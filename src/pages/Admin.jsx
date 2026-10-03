import {useMemo, useState} from 'react';
import {money, categories, vehicleCatalog} from '../data';
import {useShop} from '../context/ShopContext';
import {supabaseConfigured} from '../lib/supabase';

function Login({onLogin}) {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const submit=async e=>{
    e?.preventDefault();
    if(busy)return;
    setError('');
    setBusy(true);
    try{await onLogin(email,password)}
    catch(err){console.error(err);setError(err?.message||'ورود ناموفق بود')}
    finally{setBusy(false)}
  };
  return (
    <main className="admin-page">
      <div className="admin-panel" style={{maxWidth:480,margin:'60px auto'}}>
        <span className="eyebrow">دسترسی مدیریت</span><h1>ورود به پنل</h1>
        {error&&<div className="error">{error}</div>}
        <form onSubmit={submit} className="admin-form">
          <label>ایمیل<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
          <label>رمز عبور<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>
          <button type="submit" className="btn full" disabled={busy}>{busy?'در حال ورود...':'ورود'}</button>
        </form>
      </div>
    </main>
  );
}

const emptyForm={
  name:'',cat:'مصرفی',price:'',stock:'0',img:'',searchTerms:'',vehicles:['ALL'],active:true
};

function ProductForm({initial,onCancel,onSaved}) {
  const {addProduct,updateProduct}=useShop();
  const [form,setForm]=useState(initial||emptyForm);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  const allVehicles=useMemo(
    ()=>vehicleCatalog.flatMap(b=>b.models.map(m=>({value:b.brand+'|'+m.name,label:b.brand+' — '+m.name}))),
    []
  );

  const set=(key,value)=>setForm(f=>({...f,[key]:value}));
  const toggleVehicle=value=>{
    setForm(f=>{
      if(value==='ALL')return {...f,vehicles:f.vehicles.includes('ALL')?[]:['ALL']};
      const next=f.vehicles.filter(x=>x!=='ALL');
      return {...f,vehicles:next.includes(value)?next.filter(x=>x!==value):[...next,value]};
    });
  };

  const submit=async e=>{
    e.preventDefault();
    setError('');
    if(!form.name.trim()){setError('نام محصول را وارد کنید.');return}
    if(Number(form.price)<0||Number(form.stock)<0){setError('قیمت و موجودی نمی‌توانند منفی باشند.');return}
    setBusy(true);
    try{
      const payload={
        name:form.name.trim(),
        cat:form.cat,
        price:Number(form.price),
        stock:Number(form.stock),
        img:form.img.trim(),
        searchTerms:form.searchTerms.split(',').map(x=>x.trim()).filter(Boolean),
        vehicles:form.vehicles.length?form.vehicles:['ALL'],
        active:form.active
      };
      if(form.id) await updateProduct(form.id,payload);
      else await addProduct(payload);
      onSaved();
    }catch(err){console.error(err);setError(err?.message||'ذخیره محصول ناموفق بود')}
    finally{setBusy(false)}
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      {error&&<div className="error">{error}</div>}
      <div className="form-two">
        <label>نام محصول<input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="مثلاً لنت ترمز جلو پژو ۲۰۶" required/></label>
        <label>دسته‌بندی<select value={form.cat} onChange={e=>set('cat',e.target.value)}>
          {categories.map(c=><option key={c[0]} value={c[0]}>{c[0]}</option>)}
        </select></label>
      </div>
      <div className="form-two">
        <label>قیمت (تومان)<input type="number" min="0" value={form.price} onChange={e=>set('price',e.target.value)} required/></label>
        <label>موجودی<input type="number" min="0" value={form.stock} onChange={e=>set('stock',e.target.value)} required/></label>
      </div>
      <label>آدرس تصویر محصول<input value={form.img} onChange={e=>set('img',e.target.value)} placeholder="https://..."/></label>
      <label>کلمات جستجو <small>با ویرگول جدا کنید؛ مثلاً ۲۰۶، لنت، ترمز</small><input value={form.searchTerms} onChange={e=>set('searchTerms',e.target.value)} /></label>
      <div>
        <div className="field-caption">سازگاری با خودرو</div>
        <div className="vehicle-checks">
          <div className="vehicle-check-grid">
            <label className="check"><input type="checkbox" checked={form.vehicles.includes('ALL')} onChange={()=>toggleVehicle('ALL')}/> همه خودروها</label>
            {allVehicles.map(v=><label className="check" key={v.value}>
              <input type="checkbox" checked={form.vehicles.includes(v.value)} onChange={()=>toggleVehicle(v.value)}/>{v.label}
            </label>)}
          </div>
        </div>
      </div>
      <label className="check"><input type="checkbox" checked={form.active} onChange={e=>set('active',e.target.checked)}/> نمایش محصول در فروشگاه</label>
      <div className="form-actions">
        <button className="btn" type="submit" disabled={busy}>{busy?'در حال ذخیره...':form.id?'ذخیره تغییرات':'افزودن محصول'}</button>
        <button className="btn ghost" type="button" onClick={onCancel} disabled={busy}>انصراف</button>
      </div>
    </form>
  );
}

export default function Admin(){
  const {products,orders,session,isAdmin,signIn,signOut,updateOrderStatus,getOrderDetails,deleteProduct}=useShop();
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [search,setSearch]=useState('');
  const [deleteBusy,setDeleteBusy]=useState(null);
  const [selectedOrder,setSelectedOrder]=useState(null);
  const [orderBusy,setOrderBusy]=useState(false);
  const [orderError,setOrderError]=useState('');

  if(!supabaseConfigured)return <main className="admin-page"><div className="error">اتصال دیتابیس تنظیم نشده است.</div></main>;
  if(!session)return <Login onLogin={signIn}/>;
  if(!isAdmin)return <main className="admin-page"><div className="error">این حساب دسترسی مدیر ندارد.<br/><button className="btn" onClick={signOut}>خروج</button></div></main>;

  const statuses=['در انتظار پرداخت','تأیید سفارش','آماده ارسال','ارسال شد','تحویل داده شد','لغو شد'];
  const filtered=products.filter(p=>{
    const q=search.trim().toLowerCase();
    return !q||[p.name,p.cat,...(p.searchTerms||[])].join(' ').toLowerCase().includes(q);
  });

  const editProduct=p=>setEditing({
    ...p,
    cat:p.cat||'مصرفی',
    price:p.price??'',
    stock:p.stock??0,
    img:p.img||'',
    searchTerms:(p.searchTerms||[]).join(', '),
    vehicles:p.vehicles?.length?p.vehicles:['ALL'],
    active:p.active!==false
  });

  const remove=async p=>{
    if(!window.confirm('محصول «'+p.name+'» از فروشگاه حذف شود؟'))return;
    setDeleteBusy(p.id);
    try{await deleteProduct(p.id)}catch(err){window.alert(err?.message||'حذف محصول ناموفق بود')}finally{setDeleteBusy(null)}
  };

  return (
    <main className="admin-page">
      <div className="admin-head">
        <div><span className="eyebrow">پنل مدیریت</span><h1>مدیریت فروشگاه</h1><p>{session.user.email}</p></div>
        <button className="btn ghost" onClick={signOut}>خروج</button>
      </div>

      <div className="admin-stats">
        <div><b>{products.length}</b><span>محصول فعال</span></div>
        <div><b>{products.reduce((n,p)=>n+Number(p.stock||0),0).toLocaleString('fa-IR')}</b><span>موجودی کل</span></div>
        <div><b>{products.filter(p=>Number(p.stock||0)===0).length}</b><span>ناموجود</span></div>
        <div><b>{orders.length}</b><span>سفارش</span></div>
      </div>

      <section className="admin-panel">
        <div className="panel-title">
          <div><h2>مدیریت محصولات</h2><span className="admin-count">{filtered.length.toLocaleString('fa-IR')} محصول</span></div>
          <button className="btn" onClick={()=>{setEditing(null);setShowForm(true)}}>+ افزودن محصول</button>
        </div>

        {showForm&&(
          <div className="admin-notice">
            <ProductForm
              initial={editing||emptyForm}
              onCancel={()=>{setShowForm(false);setEditing(null)}}
              onSaved={()=>{setShowForm(false);setEditing(null)}}
            />
          </div>
        )}

        <input className="admin-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="جستجوی محصول..." />

        {filtered.map(p=>(
          <div className="admin-row product-admin-row" key={p.id}>
            <div className="admin-product-main">
              <div className="admin-thumb">{p.img&&<img src={p.img} alt="" />}</div>
              <span>
                <strong>{p.name}</strong>
                <small>{p.cat} — {money(p.price)} — موجودی: {Number(p.stock||0).toLocaleString('fa-IR')}{p.active===false?' — غیرفعال':''}</small>
              </span>
            </div>
            <div className="admin-actions">
              <button className="edit-btn" onClick={()=>{editProduct(p);setShowForm(true)}}>ویرایش</button>
              <button className="delete-btn" disabled={deleteBusy===p.id} onClick={()=>remove(p)}>{deleteBusy===p.id?'...':'حذف'}</button>
            </div>
          </div>
        ))}
        {!filtered.length&&<p className="muted">محصولی پیدا نشد.</p>}
      </section>

      <section className="admin-panel">
        <div className="panel-title"><h2>سفارش‌ها</h2><span className="admin-count">{orders.length.toLocaleString('fa-IR')} سفارش</span></div>
        {orderError&&<div className="error">{orderError}</div>}
        {orders.map(o=>(
          <div key={o.id}>
            <div className="admin-row order-admin-row" onClick={async()=>{
              if(selectedOrder?.id===o.id){setSelectedOrder(null);return}
              setOrderError('');setOrderBusy(true);
              try{
                const detail=await getOrderDetails(o.id);
                setSelectedOrder({...o,...detail});
              }catch(err){setOrderError(err?.message||'دریافت جزئیات سفارش ناموفق بود')}
              finally{setOrderBusy(false)}
            }}>
              <span><strong>{o.order_number}</strong> — {o.customer_name}<small>{o.city} — {o.phone} — {money(o.total)}</small></span>
              <select value={o.status} onClick={e=>e.stopPropagation()} onChange={async e=>{
                try{await updateOrderStatus(o.id,e.target.value); if(selectedOrder?.id===o.id)setSelectedOrder({...selectedOrder,status:e.target.value})}
                catch(err){setOrderError(err?.message||'تغییر وضعیت ناموفق بود')}
              }}>
                {statuses.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {selectedOrder?.id===o.id&&(
              <div className="order-detail">
                <div className="order-detail-grid">
                  <div>
                    <h3>اطلاعات مشتری</h3>
                    <p><b>نام:</b> {o.customer_name}</p>
                    <p><b>موبایل:</b> {o.phone}</p>
                    <p><b>شهر:</b> {o.city}</p>
                    <p><b>آدرس:</b> {o.address}</p>
                    <p><b>کد پستی:</b> {o.postal_code}</p>
                  </div>
                  <div>
                    <h3>پرداخت و مبلغ</h3>
                    <p><b>روش پرداخت:</b> {o.payment_method}</p>
                    <p><b>وضعیت پرداخت:</b> {o.payment_status}</p>
                    <p><b>جمع کالاها:</b> {money(o.subtotal)}</p>
                    <p><b>تخفیف:</b> {o.discount_amount?money(o.discount_amount):'بدون تخفیف'}</p>
                    <p><b>مبلغ نهایی:</b> {money(o.total)}</p>
                  </div>
                </div>
                <div className="order-history">
                  <h3>اقلام سفارش</h3>
                  {orderBusy&&selectedOrder.items?.length===undefined?<p className="muted">در حال دریافت...</p>:selectedOrder.items.map(i=>
                    <div className="order-item" key={i.id}><span>{i.product_name}<small>تعداد: {i.quantity}</small></span><b>{money(Number(i.unit_price)*Number(i.quantity))}</b></div>
                  )}
                  {!selectedOrder.items?.length&&<p className="muted">قلمی برای این سفارش ثبت نشده است.</p>}
                </div>
                <div className="order-history">
                  <h3>سابقه وضعیت</h3>
                  {selectedOrder.history.map(h=><div key={h.id}><span>{h.status}</span><small>{new Date(h.created_at).toLocaleString('fa-IR')}</small></div>)}
                </div>
              </div>
            )}
          </div>
        ))}
        {!orders.length&&<p className="muted">هنوز سفارشی ثبت نشده است.</p>}
      </section>
    </main>
  );
}
