import {useEffect,useState} from 'react';
import {categories,money,vehicleCatalog} from '../data';
import {useShop} from '../context/ShopContext';
import {supabaseConfigured} from '../lib/supabase';

const statuses=['در انتظار پرداخت','تأیید سفارش','آماده ارسال','ارسال شد','تحویل داده شد','لغو شد'];
const empty={name:'',cat:'ترمز',price:'',stock:'10',img:'',searchTerms:'',vehicles:[]};
const discountEmpty={code:'',type:'percent',value:'10',minOrder:'0'};
const vehicleOptions=vehicleCatalog.flatMap(v=>v.models.map(m=>({key:v.brand+'|'+m.name,label:v.brand+' '+m.name})));

function Login({onLogin}){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const submit=async e=>{e.preventDefault();setBusy(true);setError('');try{await onLogin(email,password)}catch(err){setError(err.message||'ورود ناموفق بود')}finally{setBusy(false)}};
 return <main className="admin-page"><div className="admin-panel" style={{maxWidth:480,margin:'60px auto'}}><span className="eyebrow">دسترسی مدیریت</span><h1>ورود به پنل</h1><p className="muted">حساب مدیر فروشگاه را با Supabase Auth وارد کنید.</p>{error&&<div className="error">{error}</div>}<form onSubmit={submit} className="admin-form"><label>ایمیل<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>رمز عبور<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="btn full" disabled={busy}>{busy?'در حال ورود...':'ورود'}</button></form></div></main>;
}

export default function Admin(){
 const {products,orders,discounts,totalStock,session,isAdmin,signIn,signOut,addProduct,updateProduct,deleteProduct,addDiscount,removeDiscount,updateOrderStatus}=useShop();
 const [form,setForm]=useState(empty),[editing,setEditing]=useState(null),[q,setQ]=useState(''),[notice,setNotice]=useState(''),[selected,setSelected]=useState(null);
 const [discountForm,setDiscountForm]=useState(discountEmpty);
 useEffect(()=>{setSelected(null)},[orders.length]);
 if(!supabaseConfigured)return <main className="admin-page"><div className="error">ابتدا متغیرهای VITE_SUPABASE_URL و VITE_SUPABASE_PUBLISHABLE_KEY را تنظیم کنید.</div></main>;
 if(!session)return <Login onLogin={signIn}/>;
 if(!isAdmin)return <main className="admin-page"><div className="error">این حساب دسترسی مدیر ندارد.<br/><button className="btn" onClick={signOut}>خروج</button></div></main>;
 const filtered=products.filter(p=>!q||p.name.includes(q)||p.cat.includes(q));
 const change=(key,value)=>setForm(x=>({...x,[key]:value}));
 const reset=()=>{setEditing(null);setForm(empty)};
 const startEdit=p=>setEditing(p.id)||setForm({...p,price:String(p.price),stock:String(p.stock),searchTerms:(p.searchTerms||[]).join('،'),vehicles:p.vehicles||[]});
 const toggleVehicle=key=>setForm(x=>({...x,vehicles:x.vehicles.includes(key)?x.vehicles.filter(v=>v!==key):[...x.vehicles,key]}));
 const submit=async e=>{e.preventDefault();try{const data={name:form.name.trim(),cat:form.cat,price:Number(form.price),stock:Number(form.stock),img:form.img.trim(),searchTerms:form.searchTerms.split(/[،,]/).map(x=>x.trim()).filter(Boolean),vehicles:form.vehicles.length?form.vehicles:['ALL']};if(editing)await updateProduct(editing,data);else await addProduct(data);setNotice(editing?'محصول ویرایش شد.':'محصول اضافه شد.');reset()}catch(e){setNotice(e.message||'خطا در ذخیره')}};
 const addDisc=async e=>{e.preventDefault();try{await addDiscount({code:discountForm.code,type:discountForm.type,value:Number(discountForm.value),minOrder:Number(discountForm.minOrder)});setDiscountForm(discountEmpty);setNotice('کد تخفیف اضافه شد.')}catch(e){setNotice(e.message||'خطا')}};
 return <main className="admin-page">
  <div className="admin-head"><div><span className="eyebrow">پنل مدیریت واقعی</span><h1>مدیریت فروشگاه</h1><p>{session.user.email}</p></div><button className="btn ghost" onClick={signOut}>خروج</button></div>
  {notice&&<div className="success admin-notice">{notice}</div>}
  <div className="admin-stats"><div><b>{products.length}</b><span>محصول</span></div><div><b>{Number(totalStock).toLocaleString('fa-IR')}</b><span>موجودی کل</span></div><div><b>{orders.length}</b><span>سفارش</span></div><div><b>{orders.filter(o=>o.status==='در انتظار پرداخت').length}</b><span>در انتظار</span></div></div>
  <div className="admin-grid">
   <section className="admin-panel"><div className="panel-title"><h2>{editing?'ویرایش محصول':'افزودن محصول'}</h2>{editing&&<button className="text-btn" onClick={reset}>لغو</button>}</div>
    <form onSubmit={submit} className="admin-form"><label>نام محصول<input value={form.name} onChange={e=>change('name',e.target.value)} required/></label>
     <div className="form-two"><label>دسته‌بندی<select value={form.cat} onChange={e=>change('cat',e.target.value)}>{categories.map(c=><option key={c[0]} value={c[0]}>{c[0]}</option>)}</select></label><label>قیمت<input type="number" min="0" value={form.price} onChange={e=>change('price',e.target.value)} required/></label></div>
     <div className="form-two"><label>موجودی<input type="number" min="0" value={form.stock} onChange={e=>change('stock',e.target.value)} required/></label><label>تصویر<input value={form.img} onChange={e=>change('img',e.target.value)} placeholder="https://..."/></label></div>
     <label>کلمات جستجو<input value={form.searchTerms} onChange={e=>change('searchTerms',e.target.value)} placeholder="لنت، ترمز، جلو"/></label>
     <div className="vehicle-checks"><div className="field-caption">سازگاری با خودرو</div><div className="vehicle-check-grid"><label className="check"><input type="checkbox" checked={form.vehicles.includes('ALL')} onChange={()=>change('vehicles',form.vehicles.includes('ALL')?[]:['ALL'])}/><span>همه خودروها</span></label>{vehicleOptions.map(v=><label className="check" key={v.key}><input type="checkbox" disabled={form.vehicles.includes('ALL')} checked={form.vehicles.includes(v.key)} onChange={()=>toggleVehicle(v.key)}/><span>{v.label}</span></label>)}</div></div>
     <button className="btn full">{editing?'ذخیره تغییرات':'افزودن محصول'}</button>
    </form>
   </section>
   <section className="admin-panel"><div className="panel-title"><h2>سفارش‌ها</h2><span className="admin-count">{orders.length} سفارش</span></div>{orders.map(o=><div className="admin-row order-admin-row" key={o.id} onClick={()=>setSelected(o)}><span><strong>{o.order_number}</strong> — {o.customer_name}<small>{money(o.total)}</small></span><select value={o.status} onClick={e=>e.stopPropagation()} onChange={e=>updateOrderStatus(o.id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></div>)}{!orders.length&&<p className="muted">هنوز سفارشی ثبت نشده است.</p>}</section>
  </div>
  {selected&&<section className="admin-panel order-detail"><div className="panel-title"><h2>سفارش {selected.order_number}</h2><button className="text-btn" onClick={()=>setSelected(null)}>بستن</button></div><p><b>مشتری:</b> {selected.customer_name}</p><p><b>موبایل:</b> {selected.phone}</p><p><b>شهر:</b> {selected.city}</p><p><b>آدرس:</b> {selected.address}</p><p><b>کد پستی:</b> {selected.postal_code}</p><p><b>پرداخت:</b> {selected.payment_method}</p><p><b>مبلغ:</b> {money(selected.total)}</p></section>}
  <section className="admin-panel"><div className="panel-title"><h2>کدهای تخفیف</h2><span className="admin-count">{discounts.length} کد</span></div><form onSubmit={addDisc} className="admin-form"><div className="form-two"><label>کد تخفیف<input value={discountForm.code} onChange={e=>setDiscountForm(x=>({...x,code:e.target.value}))} required/></label><label>نوع<select value={discountForm.type} onChange={e=>setDiscountForm(x=>({...x,type:e.target.value}))}><option value="percent">درصدی</option><option value="fixed">مبلغ ثابت</option></select></label></div><div className="form-two"><label>مقدار<input type="number" min="1" value={discountForm.value} onChange={e=>setDiscountForm(x=>({...x,value:e.target.value}))} required/></label><label>حداقل خرید<input type="number" min="0" value={discountForm.minOrder} onChange={e=>setDiscountForm(x=>({...x,minOrder:e.target.value}))}/></label></div><button className="btn full">افزودن کد</button></form>{discounts.map(d=><div className="admin-row" key={d.code}><span><strong>{d.code}</strong><small>{d.type==='percent'?d.value+'٪':money(d.value)} — حداقل خرید: {money(d.min_order||0)}</small></span><button className="delete-btn" onClick={()=>removeDiscount(d.code)}>حذف</button></div>)}</section>
  <section className="admin-panel"><div className="panel-title"><h2>لیست محصولات</h2><input className="admin-search" value={q} onChange={e=>setQ(e.target.value)} placeholder="جستجوی محصول..."/></div>{filtered.map(p=><div className="admin-row product-admin-row" key={p.id}><div className="admin-product-main"><div className="admin-thumb">{p.img&&<img src={p.img} alt=""/></div><span><strong>{p.name}</strong><small>{p.cat} — {money(p.price)} — موجودی: {Number(p.stock).toLocaleString('fa-IR')}</small></span></div><div className="admin-actions"><button className="edit-btn" onClick={()=>startEdit(p)}>ویرایش</button><button className="delete-btn" onClick={async()=>{if(confirm('این محصول غیرفعال شود؟')){await deleteProduct(p.id);setNotice('محصول غیرفعال شد.')}}}>حذف</button></div></div>)}</section>
 </main>;
}
