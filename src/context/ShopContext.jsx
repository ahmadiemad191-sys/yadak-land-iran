import {createContext,useContext,useMemo,useState} from 'react';
import {defaultProducts} from '../data';
const C=createContext(null);
export function ShopProvider({children}){
 const custom=JSON.parse(localStorage.getItem('yadakProducts')||'[]');
 const [products,setProducts]=useState([...defaultProducts,...custom]);
 const [cart,setCart]=useState(()=>JSON.parse(localStorage.getItem('yadakCart')||'[]'));
 const persist=(next)=>{setCart(next);localStorage.setItem('yadakCart',JSON.stringify(next));};
 const addToCart=id=>{const p=products.find(x=>x.id===id);if(p)persist([...cart,p]);};
 const removeCart=i=>persist(cart.filter((_,idx)=>idx!==i));
 const addProduct=p=>{const next={...p,id:Date.now()};const customNow=JSON.parse(localStorage.getItem('yadakProducts')||'[]');localStorage.setItem('yadakProducts',JSON.stringify([...customNow,next]));setProducts([...products,next]);};
 const deleteProduct=id=>{const customNow=JSON.parse(localStorage.getItem('yadakProducts')||'[]').filter(p=>p.id!==id);localStorage.setItem('yadakProducts',JSON.stringify(customNow));setProducts([...defaultProducts,...customNow]);};
 const value=useMemo(()=>({products,cart,addToCart,removeCart,addProduct,deleteProduct,total:cart.reduce((s,p)=>s+p.price,0)}),[products,cart]);
 return <C.Provider value={value}>{children}</C.Provider>;
}
export const useShop=()=>useContext(C);