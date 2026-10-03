import {createContext,useContext,useMemo,useState} from 'react';
import {defaultProducts} from '../data';
const C=createContext(null);
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
export function ShopProvider({children}){
 const custom=read('yadakProducts',[]),deleted=read('yadakDeletedProducts',[]),overrides=read('yadakProductOverrides',{});
 const build=()=>defaultProducts.filter(p=>!deleted.includes(p.id)).map(p=>({...p,...(overrides[p.id]||{})})).concat(custom.filter(p=>!deleted.includes(p.id)));
 const [products,setProducts]=useState(build),[cart,setCart]=useState(()=>read('yadakCart',[]));
 const persist=next=>{setCart(next);localStorage.setItem('yadakCart',JSON.stringify(next))};
 const addToCart=id=>{const p=products.find(x=>x.id===id);if(p&&Number(p.stock??10)>0)persist([...cart,p])};
 const removeCart=i=>persist(cart.filter((_,idx)=>idx!==i));
 const addProduct=p=>{const next={...p,id:Date.now()};const customNow=read('yadakProducts',[]);localStorage.setItem('yadakProducts',JSON.stringify([...customNow,next]));setProducts(prev=>[...prev,next])};
 const updateProduct=(id,patch)=>{const customNow=read('yadakProducts',[]);const item=customNow.find(p=>p.id===id);if(item){localStorage.setItem('yadakProducts',JSON.stringify(customNow.map(p=>p.id===id?{...p,...patch,id}:p)))}else{const current=read('yadakProductOverrides',{});localStorage.setItem('yadakProductOverrides',JSON.stringify({...current,[id]:{...patch,id}}))}setProducts(prev=>prev.map(p=>p.id===id?{...p,...patch}:p))};
 const deleteProduct=id=>{const customNow=read('yadakProducts',[]).filter(p=>p.id!==id);localStorage.setItem('yadakProducts',JSON.stringify(customNow));const deletedNow=read('yadakDeletedProducts',[]);if(!deletedNow.includes(id)){deletedNow.push(id);localStorage.setItem('yadakDeletedProducts',JSON.stringify(deletedNow))}setProducts(prev=>prev.filter(p=>p.id!==id))};
 const value=useMemo(()=>({products,cart,addToCart,removeCart,addProduct,updateProduct,deleteProduct,total:cart.reduce((s,p)=>s+p.price,0)}),[products,cart]);
 return <C.Provider value={value}>{children}</C.Provider>;
}
export const useShop=()=>useContext(C);