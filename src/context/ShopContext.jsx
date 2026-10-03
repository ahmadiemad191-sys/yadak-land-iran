import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import {supabase,supabaseConfigured} from '../lib/supabase';

const C=createContext(null);
const readCart=()=>{try{return JSON.parse(localStorage.getItem('yadakCart')||'[]')}catch{return []}};
const mapProduct=p=>({...p,cat:p.category,price:Number(p.price),stock:Number(p.stock),img:p.image_url||'',searchTerms:p.search_terms||[],vehicles:p.vehicles||[]});

export function ShopProvider({children}){
  const [products,setProducts]=useState([]);
  const [cart,setCart]=useState(readCart);
  const [loading,setLoading]=useState(supabaseConfigured);
  const [session,setSession]=useState(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [orders,setOrders]=useState([]);
  const [discounts,setDiscounts]=useState([]);
  const persistCart=next=>{setCart(next);localStorage.setItem('yadakCart',JSON.stringify(next))};

  const loadProducts=async()=>{
    if(!supabase) return;
    const {data,error}=await supabase.from('products').select('*').eq('active',true).order('id');
    if(!error)setProducts((data||[]).map(mapProduct)); else console.error(error);
  };

  const loadAdminData=async()=>{
    if(!supabase||!isAdmin)return;
    const [{data:os,error:oe},{data:ds,error:de}]=await Promise.all([
      supabase.from('orders').select('*').order('created_at',{ascending:false}),
      supabase.from('discount_codes').select('*').order('created_at',{ascending:false})
    ]);
    if(!oe)setOrders(os||[]); else console.error(oe);
    if(!de)setDiscounts(ds||[]); else console.error(de);
  };

  useEffect(()=>{
    if(!supabaseConfigured){setLoading(false);return}
    let mounted=true;
    (async()=>{
      const {data:{session:s}}=await supabase.auth.getSession();
      if(!mounted)return;
      setSession(s);
      if(s){
        const {data:p}=await supabase.from('profiles').select('role').eq('id',s.user.id).maybeSingle();
        setIsAdmin(p?.role==='admin');
      }
      await loadProducts();
      setLoading(false);
    })();
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>{
      setSession(s);
      if(!s){
        setIsAdmin(false);
        return;
      }
      setTimeout(async()=>{
        const {data:p,error}=await supabase.from('profiles').select('role').eq('id',s.user.id).maybeSingle();
        if(error){console.error(error);setIsAdmin(false);return}
        setIsAdmin(p?.role==='admin');
      },0);
    });
    return()=>{mounted=false;subscription.unsubscribe()};
  },[]);

  useEffect(()=>{if(isAdmin)loadAdminData()},[isAdmin]);

  const addToCart=id=>{
    const p=products.find(x=>String(x.id)===String(id));
    const inCart=cart.filter(x=>String(x.id)===String(id)).length;
    if(p&&Number(p.stock)>inCart)persistCart([...cart,p]);
  };
  const removeCart=i=>persistCart(cart.filter((_,idx)=>idx!==i));

  const addProduct=async p=>{
    if(!supabase)return;
    const row={id:Number(p.id||Date.now()),name:p.name,category:p.cat,price:Number(p.price),stock:Number(p.stock),image_url:p.img||null,search_terms:p.searchTerms||[],vehicles:p.vehicles||['ALL']};
    const {data,error}=await supabase.from('products').insert(row).select().single();
    if(error)throw error;
    setProducts(prev=>[...prev,mapProduct(data)]);
  };
  const updateProduct=async(id,patch)=>{
    if(!supabase)return;
    const row={};
    if(patch.name!==undefined)row.name=patch.name;
    if(patch.cat!==undefined)row.category=patch.cat;
    if(patch.price!==undefined)row.price=Number(patch.price);
    if(patch.stock!==undefined)row.stock=Number(patch.stock);
    if(patch.img!==undefined)row.image_url=patch.img||null;
    if(patch.searchTerms!==undefined)row.search_terms=patch.searchTerms||[];
    if(patch.vehicles!==undefined)row.vehicles=patch.vehicles||['ALL'];
    if(patch.active!==undefined)row.active=patch.active;
    const {data,error}=await supabase.from('products').update(row).eq('id',id).select().single();
    if(error)throw error;
    setProducts(prev=>prev.map(p=>String(p.id)===String(id)?mapProduct(data):p));
  };
  const deleteProduct=async id=>{
    if(!supabase)return;
    const {error}=await supabase.from('products').update({active:false}).eq('id',id);
    if(error)throw error;
    setProducts(prev=>prev.filter(p=>String(p.id)!==String(id)));
  };

  const previewDiscount=async(code,subtotal)=>{if(!supabase)throw new Error('اتصال دیتابیس تنظیم نشده است.');const {data,error}=await supabase.rpc('preview_discount',{p_code:code,p_subtotal:Number(subtotal)});if(error)throw error;return data};
  const createOrder=async({customer,items,discountCode,paymentMethod})=>{
    if(!supabaseConfigured)throw new Error('اتصال فروشگاه به دیتابیس تنظیم نشده است.');
    const payload=items.reduce((a,p)=>{const found=a.find(x=>String(x.id)===String(p.id));found?found.quantity++:a.push({id:p.id,quantity:1});return a},[]);
    const {data,error}=await supabase.rpc('create_order',{p_customer:customer,p_items:payload,p_discount_code:discountCode||null,p_payment_method:paymentMethod||'پرداخت آنلاین'});
    if(error)throw error;
    const result=Array.isArray(data)?data[0]:data;
    persistCart([]);
    await loadProducts();
    return result;
  };

  const signIn=async(email,password)=>{if(!supabase)throw new Error('اتصال دیتابیس تنظیم نشده است.');const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;setSession(data.session);const {data:p,error:pe}=await supabase.from('profiles').select('role').eq('id',data.user.id).maybeSingle();if(pe)throw pe;setIsAdmin(p?.role==='admin');return data};
  const signOut=async()=>{if(supabase)await supabase.auth.signOut()};
  const addDiscount=async item=>{
    const {data,error}=await supabase.from('discount_codes').insert({code:item.code.trim().toUpperCase(),type:item.type,value:Number(item.value),min_order:Number(item.minOrder||0),active:item.active!==false}).select().single();
    if(error)throw error;
    setDiscounts(prev=>[data,...prev]);
  };
  const updateDiscount=async(code,patch)=>{
    if(!supabase)throw new Error('اتصال دیتابیس تنظیم نشده است.');
    const row={};
    if(patch.type!==undefined)row.type=patch.type;
    if(patch.value!==undefined)row.value=Number(patch.value);
    if(patch.minOrder!==undefined)row.min_order=Number(patch.minOrder||0);
    if(patch.active!==undefined)row.active=Boolean(patch.active);
    const {data,error}=await supabase.from('discount_codes').update(row).eq('code',code).select().single();
    if(error)throw error;
    setDiscounts(prev=>prev.map(x=>x.code===code?data:x));
  };
  const removeDiscount=async code=>{
    const {error}=await supabase.from('discount_codes').delete().eq('code',code);
    if(error)throw error;
    setDiscounts(prev=>prev.filter(x=>x.code!==code));
  };
  const updatePaymentStatus=async(id,paymentStatus)=>{
    if(!supabase)throw new Error('اتصال دیتابیس تنظیم نشده است.');
    const {error}=await supabase.from('orders').update({payment_status:paymentStatus,updated_at:new Date().toISOString()}).eq('id',id);
    if(error)throw error;
    setOrders(prev=>prev.map(o=>o.id===id?{...o,payment_status:paymentStatus}:o));
  };
  const updateOrderStatus=async(id,status)=>{
    const {error}=await supabase.rpc('set_order_status',{p_order_id:id,p_status:status});
    if(error)throw error;
    await loadAdminData();
  };
  const getOrderDetails=async(id)=>{
    if(!supabase)throw new Error('اتصال دیتابیس تنظیم نشده است.');
    const [{data:items,error:ie},{data:history,error:he}]=await Promise.all([
      supabase.from('order_items').select('*').eq('order_id',id).order('id'),
      supabase.from('order_status_history').select('*').eq('order_id',id).order('created_at',{ascending:true})
    ]);
    if(ie)throw ie;
    if(he)throw he;
    return {items:items||[],history:history||[]};
  };

  const total=cart.reduce((s,p)=>s+Number(p.price||0),0);
  const value=useMemo(()=>({products,cart,addToCart,removeCart,total,loading,session,isAdmin,createOrder,signIn,signOut,orders,discounts,previewDiscount,addProduct,updateProduct,deleteProduct,addDiscount,updateDiscount,removeDiscount,updatePaymentStatus,updateOrderStatus,getOrderDetails,refreshProducts:loadProducts}),[products,cart,total,loading,session,isAdmin,orders,discounts]);
  return <C.Provider value={value}>{children}</C.Provider>
}
export const useShop=()=>useContext(C);
