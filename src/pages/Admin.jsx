import {useState} from 'react';
import {money} from '../data';
import {useShop} from '../context/ShopContext';
import {supabaseConfigured} from '../lib/supabase';

function Login({onLogin}) {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const submit=async e=>{e.preventDefault();setError('');try{await onLogin(email,password)}catch(err){setError(err.message||'ورود ناموفق بود')}};
  return (
    <main className="admin-page">
      <div className="admin-panel" style={{maxWidth:480,margin:'60px auto'}}>
        <span className="eyebrow">دسترسی مدیریت</span><h1>ورود به پنل</h1>
        {error&&<div className="error">{error}</div>}
        <form onSubmit={submit} className="admin-form">
          <label>ایمیل<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
          <label>رمز عبور<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>
          <button className="btn full">ورود</button>
        </form>
      </div>
    </main>
  );
}

export default function Admin(){
  const {products,orders,session,isAdmin,signIn,signOut,updateOrderStatus}=useShop();
  if(!supabaseConfigured)return <main className="admin-page"><div className="error">اتصال دیتابیس تنظیم نشده است.</div></main>;
  if(!session)return <Login onLogin={signIn}/>;
  if(!isAdmin)return <main className="admin-page"><div className="error">این حساب دسترسی مدیر ندارد.<br/><button className="btn" onClick={signOut}>خروج</button></div></main>;
  const statuses=['در انتظار پرداخت','تأیید سفارش','آماده ارسال','ارسال شد','تحویل داده شد','لغو شد'];
  return (
    <main className="admin-page">
      <div className="admin-head">
        <div><span className="eyebrow">پنل مدیریت</span><h1>مدیریت فروشگاه</h1><p>{session.user.email}</p></div>
        <button className="btn ghost" onClick={signOut}>خروج</button>
      </div>
      <div className="admin-stats">
        <div><b>{products.length}</b><span>محصول</span></div>
        <div><b>{products.reduce((n,p)=>n+Number(p.stock||0),0).toLocaleString('fa-IR')}</b><span>موجودی کل</span></div>
        <div><b>{orders.length}</b><span>سفارش</span></div>
      </div>
      <section className="admin-panel">
        <div className="panel-title"><h2>سفارش‌ها</h2></div>
        {orders.map(o=>(
          <div className="admin-row order-admin-row" key={o.id}>
            <span><strong>{o.order_number}</strong> — {o.customer_name}<small>{money(o.total)}</small></span>
            <select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}>
              {statuses.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
        {!orders.length&&<p className="muted">هنوز سفارشی ثبت نشده است.</p>}
      </section>
      <section className="admin-panel">
        <div className="panel-title"><h2>محصولات</h2></div>
        {products.map(p=>(
          <div className="admin-row product-admin-row" key={p.id}>
            <span><strong>{p.name}</strong><small>{p.cat} — {money(p.price)} — موجودی: {Number(p.stock||0).toLocaleString('fa-IR')}</small></span>
          </div>
        ))}
      </section>
    </main>
  );
}
