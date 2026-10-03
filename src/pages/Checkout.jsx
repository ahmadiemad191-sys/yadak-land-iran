import {useState} from 'react';
import {useShop} from '../context/ShopContext';
import {money} from '../data';

export default function Checkout({navigate}){
  const {cart,total,createOrder,previewDiscount}=useShop();
  const [result,setResult]=useState(null),[discountCode,setDiscountCode]=useState(''),[discount,setDiscount]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const applyDiscount=async()=>{
    setError('');setDiscount(null);
    if(!discountCode.trim())return;
    try{setDiscount(await previewDiscount(discountCode,total))}catch(e){setError(e.message||'کد تخفیف معتبر نیست.')}
  };
  const finalTotal=Math.max(0,total-Number(discount?.amount||0));
  const submit=async e=>{
    e.preventDefault();if(!cart.length)return;
    setBusy(true);setError('');
    try{
      const f=new FormData(e.currentTarget);
      const customer={name:f.get('name'),phone:f.get('phone'),city:f.get('city'),address:f.get('address'),postal:f.get('postal')};
      const r=await createOrder({customer,items:cart,discountCode:discount?.code||null,paymentMethod:f.get('payment')});
      setResult(r.order_number);
    }catch(err){setError(err.message||'ثبت سفارش انجام نشد.')}
    finally{setBusy(false)}
  };
  if(result)return <main className="checkout-page"><div className="success">سفارش شما با شماره <strong>{result}</strong> ثبت شد.<br/><small>برای پرداخت آنلاین، درگاه را در مرحله بعد به همین سفارش متصل می‌کنیم.</small><br/><button className="btn" onClick={()=>navigate('track',result)}>پیگیری سفارش</button></div></main>;
  return <main className="checkout-page">
    <div className="checkout-title"><h1>تکمیل سفارش</h1><p>اطلاعات ارسال را وارد کنید.</p></div>
    {error&&<div className="error">{error}</div>}
    <div className="checkout-layout">
      <form onSubmit={submit} className="panel-form">
        <h2>اطلاعات مشتری</h2>
        <label>نام و نام خانوادگی<input name="name" required/></label>
        <label>شماره موبایل<input name="phone" required/></label>
        <label>استان و شهر<input name="city" required/></label>
        <label>آدرس کامل<textarea name="address" required/></label>
        <label>کد پستی<input name="postal" required/></label>
        <label>روش پرداخت<select name="payment"><option>پرداخت آنلاین</option><option>پرداخت در محل</option></select></label>
        <button className="btn full" disabled={busy}>{busy?'در حال ثبت سفارش...':'ثبت سفارش'}</button>
      </form>
      <aside className="order-summary"><h2>خلاصه سبد</h2>
        {cart.map((p,i)=><div className="summary-item" key={i}><span>{p.name}<small>تعداد: ۱</small></span><b>{money(p.price)}</b></div>)}
        <div className="discount-box"><input value={discountCode} onChange={e=>setDiscountCode(e.target.value)} placeholder="کد تخفیف"/><button type="button" className="btn" onClick={applyDiscount}>اعمال</button>{discount?.amount>0&&<small className="discount-ok">تخفیف: {money(discount.amount)}</small>}</div>
        <div className="sum-line"><span>جمع کل</span><b>{money(finalTotal)}</b></div>
      </aside>
    </div>
  </main>
}
