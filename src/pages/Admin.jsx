import {useMemo,useState} from 'react';
import {categories,money,vehicleCatalog,defaultProducts} from '../data';
import {useShop} from '../context/ShopContext';
const empty={name:'',cat:'ترمز',price:'',stock:'10',img:'',searchTerms:'',vehicles:[]};
const vehicleOptions=vehicleCatalog.flatMap(v=>v.models.map(m=>({key:v.brand+'|'+m.name,label:v.brand+' '+m.name})));
export default function Admin(){
 const {products,addProduct,updateProduct,deleteProduct}=useShop();
 const [editing,setEditing]=useState(null),[form,setForm]=useState(empty),[q,setQ]=useState(''),[notice,setNotice]=useState('');
 const orders=JSON.parse(localStorage.getItem('yadakOrders')||'[]');
 const filtered=useMemo(()=>products.filter(p=>!q||p.name.includes(q)||p.cat.includes(q)),[products,q]);
 const totalStock=products.reduce((s,p)=>s+Number(p.stock??10),0);
 const startEdit=p=>{setEditing(p.id);setForm({...empty,...p,searchTerms:(p.searchTerms||[]).join('،'),vehicles:p.vehicles||[]});window.scrollTo({top:0,behavior:'smooth'})};
 const reset=()=>{setEditing(null);setForm(empty)};
 const change=(k,v)=>setForm(x=>({...x,[k]:v}));
 const toggleVehicle=key=>setForm(x=>({...x,vehicles:x.vehicles.includes(key)?x.vehicles.filter(v=>v!==key):[...x.vehicles,key]}));
 const submit=e=>{e.preventDefault();const data={name:form.name.trim(),cat:form.cat,price:Number(form.price),stock:Number(form.stock),img:form.img.trim(),searchTerms:form.searchTerms.split(/[،,]/).map(x=>x.trim()).filter(Boolean),vehicles:form.vehicles.length?form.vehicles:['ALL']};editing?updateProduct(editing,data):addProduct(data);setNotice(editing?'محصول با موفقیت ویرایش شد.':'محصول جدید اضافه شد.');reset();setTimeout(()=>setNotice(''),2500)};
 return <main className="admin-page">
  <div className="admin-head"><div><span className="eyebrow">پنل مدیریت فروشگاه</span><h1>مدیریت محصولات و موجودی</h1><p>افزودن، ویرایش، قیمت‌گذاری، موجودی و سازگاری خودروها.</p></div><button className="btn ghost" onClick={()=>location.hash='home'}>بازگشت به فروشگاه</button></div>
  {notice&&<div className="success admin-notice">✓ {notice}</div>}
  <div className="admin-stats"><div><b>{products.length}</b><span>محصول</span></div><div><b>{totalStock.toLocaleString('fa-IR')}</b><span>موجودی کل</span></div><div><b>{orders.length}</b><span>سفارش</span></div><div><b>{defaultProducts.length}</b><span>محصول پایه</span></div></div>
  <div className="admin-grid">
   <section className="admin-panel"><div className="panel-title"><h2>{editing?'ویرایش محصول':'افزودن محصول'}</h2>{editing&&<button className="text-btn" onClick={reset}>لغو ویرایش</button>}</div>
    <form onSubmit={submit} className="admin-form">
     <label>نام محصول<input value={form.name} onChange={e=>change('name',e.target.value)} placeholder="مثلاً لنت ترمز جلو پژو ۲۰۶" required/></label>
     <div className="form-two"><label>دسته‌بندی<select value={form.cat} onChange={e=>change('cat',e.target.value)}>{categories.map(c=><option key={c[0]}>{c[0]}</option>)}</select></label><label>قیمت (تومان)<input value={form.price} onChange={e=>change('price',e.target.value)} type="number" min="0" required/></label></div>
     <div className="form-two"><label>موجودی<input value={form.stock} onChange={e=>change('stock',e.target.value)} type="number" min="0" required/></label><label>تصویر محصول<input value={form.img} onChange={e=>change('img',e.target.value)} placeholder="https://..."/></label></div>
     <label>کلمات جستجو<input value={form.searchTerms} onChange={e=>change('searchTerms',e.target.value)} placeholder="لنت، ترمز، جلو"/><small>کلمات را با «،» جدا کنید.</small></label>
     <div className="vehicle-checks"><div className="field-caption">سازگاری با خودرو</div><div className="vehicle-check-grid"><label className="check"><input type="checkbox" checked={form.vehicles.includes('ALL')} onChange={()=>change('vehicles',form.vehicles.includes('ALL')?[]:['ALL'])}/><span>همه خودروها</span></label>{vehicleOptions.map(v=><label className="check" key={v.key}><input type="checkbox" disabled={form.vehicles.includes('ALL')} checked={form.vehicles.includes(v.key)} onChange={()=>toggleVehicle(v.key)}/><span>{v.label}</span></label>)}</div></div>
     <div className="form-actions"><button className="btn full">{editing?'ذخیره تغییرات':'افزودن محصول'}</button>{editing&&<button type="button" className="btn ghost full" onClick={reset}>لغو</button>}</div>
    </form>
   </section>
   <section className="admin-panel"><div className="panel-title"><h2>سفارش‌ها</h2><span className="admin-count">{orders.length} سفارش</span></div>{orders.map(o=><div className="admin-row" key={o.id}><span><strong>{o.id}</strong> — {o.customer?.name||'مشتری'}<small>{Number(o.total||0).toLocaleString('fa-IR')} تومان — {o.status||'ثبت شده'}</small></span></div>)}{!orders.length&&<p className="muted">هنوز سفارشی ثبت نشده است.</p>}</section>
  </div>
  <section className="admin-panel"><div className="panel-title"><h2>لیست محصولات</h2><input className="admin-search" value={q} onChange={e=>setQ(e.target.value)} placeholder="جستجوی محصول..."/></div>{filtered.map(p=><div className="admin-row product-admin-row" key={p.id}><div className="admin-product-main"><div className="admin-thumb">{p.img&&<img src={p.img} alt=""/>}</div><span><strong>{p.name}</strong><small>{p.cat} — {money(p.price)} — موجودی: {Number(p.stock??10).toLocaleString('fa-IR')}</small></span></div><div className="admin-actions"><button className="edit-btn" onClick={()=>startEdit(p)}>ویرایش</button><button className="delete-btn" onClick={()=>{if(confirm('این محصول حذف شود؟'))deleteProduct(p.id)}}>حذف</button></div></div>)}{!filtered.length&&<p className="muted">محصولی پیدا نشد.</p>}</section>
 </main>
}