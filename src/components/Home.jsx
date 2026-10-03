import {useState} from 'react';
import {categories,money,vehicleCatalog} from '../data';
import {useShop} from '../context/ShopContext';
import {ProductModal} from './Layout';

export default function Home(){
 const {products,addToCart}=useShop();
 const [cat,setCat]=useState('همه'),[q,setQ]=useState(''),[selected,setSelected]=useState(null);\n const [brand,setBrand]=useState(''),[model,setModel]=useState(''),[year,setYear]=useState('');\n const currentBrand=vehicleCatalog.find(v=>v.brand===brand);\n const currentModel=currentBrand?.models.find(m=>m.name===model);\n const vehicleSelected=Boolean(brand&&model&&year);\n const vehicleKey=brand&&model?brand+'|'+model:'';\n const clearVehicle=()=>{setBrand('');setModel('');setYear('')};
 const filtered=products.filter(p=>(cat==='همه'||p.cat===cat)&&(!q||p.name.includes(q)||p.cat.includes(q))&&(!vehicleSelected||p.vehicles?.includes('ALL')||p.vehicles?.includes(vehicleKey)));
 const selectCat=c=>{setCat(c);document.getElementById('shop')?.scrollIntoView({behavior:'smooth'})};
 return <main id="home">
  <section className="hero">
   <div className="hero-bg"/>
   <div className="hero-shade"/>
   <div className="hero-content">
    <div className="hero-badge">فروش تخصصی قطعات خودرو • ارسال به سراسر ایران</div>
    <h1>یدکی لند <em>ایران</em></h1>
    <p>قطعه مناسب خودروت را سریع، مطمئن و با قیمت شفاف پیدا کن.</p>
    <div className="hero-actions"><a href="#shop" className="btn">مشاهده محصولات</a><a href="#categories" className="btn ghost">دسته‌بندی‌ها</a></div>
    <div className="hero-stats"><span><b>اصالت</b>کالای معتبر</span><span><b>مشاوره</b>قبل از خرید</span><span><b>ارسال</b>به سراسر کشور</span></div>
   </div>
  </section>

  <section className="categories" id="categories">
   <div className="section-title"><div><span className="eyebrow">دسترسی سریع</span><h2>دسته‌بندی قطعات</h2></div><a href="#shop" onClick={()=>setCat('همه')}>مشاهده همه ←</a></div>
   <div className="cat-grid">{categories.map(([c,icon,label])=><button className="cat-card" key={c} onClick={()=>selectCat(c)}><span className="cat-icon">{icon}</span><b>{label}</b><small>مشاهده محصولات</small></button>)}</div>
  </section>

  <section className="products" id="shop">
   <div className="section-title"><div><span className="eyebrow">{vehicleSelected?'قطعات سازگار با خودرو':'منتخب فروشگاه'}</span><h2>{vehicleSelected?`${brand} ${model} مدل ${year}`:'محصولات ویژه'}</h2></div>
    <div className="product-search"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="جستجوی نام قطعه یا دسته..."/><a href="#shop" onClick={()=>{setCat('همه');setQ('')}}>همه</a></div>
   </div>
   <div className="filter-row">{['همه',...categories.map(x=>x[0])].map(c=><button key={c} className={cat===c?'active':''} onClick={()=>setCat(c)}>{c}</button>)}</div>
   {vehicleSelected&&<div className="vehicle-result">✓ فیلتر خودرو فعال است — {filtered.length} محصول سازگار نمایش داده می‌شود.</div>}\n   <div className="product-grid">{filtered.map(p=><article className="product" key={p.id}>
    <button className="quick-view" onClick={()=>setSelected(p)}>جزئیات</button>
    <div className="product-image"><img src={p.img} alt={p.name}/><span>{p.cat}</span></div>
    <div className="product-body"><h3>{p.name}</h3><div className="spec">{vehicleSelected?'✓ سازگار با خودرو انتخابی':'کیفیت مناسب • مشاوره پیش از خرید'}</div><div className="product-bottom"><div className="price">{money(p.price)}</div><button className="add" onClick={()=>{addToCart(p.id);dispatchEvent(new Event('open-cart'))}}>افزودن به سبد</button></div></div>
   </article>)}{!filtered.length&&<div className="empty">محصولی مطابق جستجو پیدا نشد.</div>}</div>
  </section>

  <section className="trust-strip"><div><strong>خرید مطمئن، انتخاب دقیق</strong><span>قبل از ثبت سفارش برای انتخاب قطعه مناسب با ما مشورت کنید.</span></div><a className="btn" href="#contact">ارتباط با ما</a></section>
  <section id="about" className="about"><div><span className="eyebrow">درباره یدکی لند</span><h2>برای خودروت، قطعه درست را انتخاب کن.</h2><p>یدکی لند ایران با تمرکز روی قطعات خودرو، تجربه خرید ساده و شفاف را هدف گرفته است؛ از جستجوی قطعه تا ثبت سفارش و پیگیری.</p></div><div className="about-points"><span>✓ قیمت شفاف</span><span>✓ توضیحات کاربردی</span><span>✓ پشتیبانی قبل از خرید</span></div></section>
  <section className="features"><div><span>◈</span><b>تضمین اصالت</b><small>کالای معتبر و قابل اعتماد</small></div><div><span>₮</span><b>قیمت رقابتی</b><small>قیمت‌گذاری شفاف</small></div><div><span>↗</span><b>ارسال سریع</b><small>به سراسر کشور</small></div><div><span>◌</span><b>مشاوره تخصصی</b><small>پاسخگویی قبل از خرید</small></div></section>
  <ProductModal product={selected} onClose={()=>setSelected(null)}/>
 </main>
}