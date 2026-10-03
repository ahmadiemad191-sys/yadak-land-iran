import {useMemo,useState} from 'react';
import {categories,money,vehicleCatalog} from '../data';
import {useShop} from '../context/ShopContext';
import {ProductModal} from './Layout';

export default function Home(){
 const {products,addToCart}=useShop();
 const [cat,setCat]=useState('همه'),[q,setQ]=useState(''),[selected,setSelected]=useState(null);
 const [brand,setBrand]=useState(''),[model,setModel]=useState(''),[year,setYear]=useState('');
 const currentBrand=vehicleCatalog.find(v=>v.brand===brand);
 const currentModel=currentBrand?.models.find(m=>m.name===model);
 const vehicleSelected=Boolean(brand&&model&&year);
 const vehicleKey=brand&&model?brand+'|'+model:'';
 const clearVehicle=()=>{setBrand('');setModel('');setYear('')};
 const normalize=value=>String(value||'').replace(/ي/g,'ی').replace(/ك/g,'ک').trim().toLowerCase();
 const quickParts=['لنت','فیلتر هوا','فیلتر روغن','دیسک ترمز','روغن موتور','شمع','کمک فنر'];
 const filtered=useMemo(()=>{const term=normalize(q);return products.filter(p=>{const searchable=normalize([p.name,p.cat,...(p.searchTerms||[])].join(' '));return (cat==='همه'||p.cat===cat)&&(!term||searchable.includes(term))&&(!vehicleSelected||p.vehicles?.includes('ALL')||p.vehicles?.includes(vehicleKey));});},[products,q,cat,vehicleSelected,vehicleKey]);
 const selectCat=c=>{setCat(c);document.getElementById('shop')?.scrollIntoView({behavior:'smooth'})};
 const runSearch=term=>{setQ(term);setCat('همه');document.getElementById('shop')?.scrollIntoView({behavior:'smooth'})};

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

  <section className="vehicle-selector" id="vehicle">
   <div className="vehicle-head"><div><span className="eyebrow">جستجوی هوشمند</span><h2>اول خودروت را انتخاب کن</h2><p>برند، مدل و سال را مشخص کن تا قطعات سازگار نمایش داده شوند.</p></div>{vehicleSelected&&<button className="vehicle-clear" onClick={clearVehicle}>پاک کردن خودرو ×</button>}</div>
   <div className="vehicle-fields">
    <label><span>برند</span><select value={brand} onChange={e=>{setBrand(e.target.value);setModel('');setYear('')}}><option value="">انتخاب برند</option>{vehicleCatalog.map(v=><option key={v.brand} value={v.brand}>{v.brand}</option>)}</select></label>
    <label><span>مدل</span><select value={model} disabled={!brand} onChange={e=>{setModel(e.target.value);setYear('')}}><option value="">انتخاب مدل</option>{currentBrand?.models.map(m=><option key={m.name} value={m.name}>{m.name}</option>)}</select></label>
    <label><span>سال</span><select value={year} disabled={!model} onChange={e=>setYear(e.target.value)}><option value="">انتخاب سال</option>{currentModel?.years.map(y=><option key={y} value={y}>{y}</option>)}</select></label>
    <div className={vehicleSelected?'vehicle-status active':'vehicle-status'}>{vehicleSelected?<><span>✓</span><b>{brand} {model} • مدل {year}</b><small>فیلتر سازگاری فعال شد</small></>:<><span>⌖</span><b>خودرویی انتخاب نشده</b><small>برای دقت بیشتر انتخاب کنید</small></>}</div>
   </div>
  </section>

  <section className="categories" id="categories">
   <div className="section-title"><div><span className="eyebrow">دسترسی سریع</span><h2>دسته‌بندی قطعات</h2></div><a href="#shop" onClick={()=>setCat('همه')}>مشاهده همه ←</a></div>
   <div className="cat-grid">{categories.map(([c,icon,label])=><button className="cat-card" key={c} onClick={()=>selectCat(c)}><span className="cat-icon">{icon}</span><b>{label}</b><small>مشاهده محصولات</small></button>)}</div>
  </section>

  <section className="products" id="shop">
   <div className="section-title"><div><span className="eyebrow">{vehicleSelected?'قطعات سازگار با خودرو':'منتخب فروشگاه'}</span><h2>{vehicleSelected?`${brand} ${model} مدل ${year}`:'محصولات ویژه'}</h2></div>
    <div className="product-search"><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&document.getElementById('shop')?.scrollIntoView({behavior:'smooth'})} placeholder="مثلاً لنت، فیلتر، روغن..." aria-label="جستجوی قطعه"/><button onClick={()=>document.getElementById('shop')?.scrollIntoView({behavior:'smooth'})}>جستجو</button></div>
   </div>
   <div className="quick-search">{quickParts.map(term=><button key={term} className={normalize(q)===normalize(term)?'active':''} onClick={()=>runSearch(term)}>{term}</button>)}{(q||vehicleSelected||cat!=='همه')&&<button className="clear-search" onClick={()=>{setQ('');setCat('همه')}}>حذف فیلترها ×</button>}</div>
   <div className="filter-row">{['همه',...categories.map(x=>x[0])].map(c=><button key={c} className={cat===c?'active':''} onClick={()=>setCat(c)}>{c}</button>)}</div>
   {(vehicleSelected||q)&&<div className="vehicle-result">{vehicleSelected&&<>✓ خودرو: <b>{brand} {model} مدل {year}</b> — </>}{q&&<>جستجو: <b>«{q}»</b> — </>} {filtered.length} محصول پیدا شد.</div>}
   <div className="product-grid">{filtered.map(p=><article className="product" key={p.id}>
    <button className="quick-view" onClick={()=>setSelected(p)}>جزئیات</button>
    <div className="product-image"><img src={p.img} alt={p.name}/><span>{p.cat}</span></div>
    <div className="product-body"><h3>{p.name}</h3><div className="spec">{vehicleSelected?'✓ سازگار با خودرو انتخابی':'کیفیت مناسب • مشاوره پیش از خرید'}</div><div className="product-bottom"><div className="price">{money(p.price)}</div><button className="add" disabled={Number(p.stock??10)<=0} onClick={()=>{if(Number(p.stock??10)>0){addToCart(p.id);dispatchEvent(new Event('open-cart'))}}}>{Number(p.stock??10)>0?'افزودن به سبد':'ناموجود'}</button></div></div>
   </article>)}{!filtered.length&&<div className="empty">محصولی مطابق جستجو و خودروی انتخاب‌شده پیدا نشد.</div>}</div>
  </section>

  <section className="trust-strip"><div><strong>خرید مطمئن، انتخاب دقیق</strong><span>قبل از ثبت سفارش برای انتخاب قطعه مناسب با ما مشورت کنید.</span></div><a className="btn" href="#contact">ارتباط با ما</a></section>
  <section id="about" className="about"><div><span className="eyebrow">درباره یدکی لند</span><h2>برای خودروت، قطعه درست را انتخاب کن.</h2><p>یدکی لند ایران با تمرکز روی قطعات خودرو، تجربه خرید ساده و شفاف را هدف گرفته است؛ از جستجوی قطعه تا ثبت سفارش و پیگیری.</p></div><div className="about-points"><span>✓ قیمت شفاف</span><span>✓ توضیحات کاربردی</span><span>✓ پشتیبانی قبل از خرید</span></div></section>
  <section className="features"><div><span>◈</span><b>تضمین اصالت</b><small>کالای معتبر و قابل اعتماد</small></div><div><span>₮</span><b>قیمت رقابتی</b><small>قیمت‌گذاری شفاف</small></div><div><span>↗</span><b>ارسال سریع</b><small>به سراسر کشور</small></div><div><span>◌</span><b>مشاوره تخصصی</b><small>پاسخگویی قبل از خرید</small></div></section>
  <ProductModal product={selected} onClose={()=>setSelected(null)}/>
 </main>
}