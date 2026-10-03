export const vehicleCatalog=[
{brand:'پژو',models:[{name:'۲۰۶',years:['۱۳۸۰','۱۳۸۵','۱۳۹۰','۱۳۹۵','۱۴۰۰','۱۴۰۱','۱۴۰۲']},{name:'۲۰۷',years:['۱۳۹۰','۱۳۹۵','۱۴۰۰','۱۴۰۱','۱۴۰۲','۱۴۰۳']},{name:'پارس',years:['۱۳۸۰','۱۳۹۰','۱۴۰۰','۱۴۰۱','۱۴۰۲']},{name:'۴۰۵',years:['۱۳۸۰','۱۳۹۰','۱۴۰۰','۱۴۰۱','۱۴۰۲']}]},
{brand:'سایپا',models:[{name:'پراید',years:['۱۳۸۰','۱۳۹۰','۱۳۹۵','۱۳۹۹']},{name:'تیبا',years:['۱۳۹۰','۱۳۹۵','۱۴۰۰','۱۴۰۱']},{name:'شاهین',years:['۱۴۰۰','۱۴۰۱','۱۴۰۲','۱۴۰۳','۱۴۰۴']}]},
{brand:'کیا',models:[{name:'سراتو',years:['۱۳۹۰','۱۳۹۵','۱۳۹۸']},{name:'اسپورتیج',years:['۱۳۹۰','۱۳۹۵','۱۴۰۰']}]},
{brand:'هیوندای',models:[{name:'النترا',years:['۱۳۹۲','۱۳۹۵','۱۴۰۰']},{name:'توسان',years:['۱۳۹۰','۱۳۹۵','۱۴۰۰']}]},
{brand:'تویوتا',models:[{name:'کرولا',years:['۱۳۸۵','۱۳۹۰','۱۳۹۵','۱۴۰۰','۱۴۰۲']}]}
];
export const defaultProducts=[
{id:1,name:'دیسک ترمز جلو پژو ۲۰۶ / ۲۰۷',cat:'ترمز',price:1850000,img:'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=700&q=80',vehicles:['پژو|۲۰۶','پژو|۲۰۷']},
{id:2,name:'فیلتر هوا پژو ۲۰۶',cat:'فیلتر',price:210000,img:'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=700&q=80',vehicles:['پژو|۲۰۶']},
{id:3,name:'باتری ۶۶ آمپر صبا باتری',cat:'برقی',price:2350000,img:'https://images.unsplash.com/photo-1603712725038-e9334ae8f39f?auto=format&fit=crop&w=700&q=80',vehicles:['ALL']},
{id:4,name:'شمع موتور NGK پلاتینیوم',cat:'موتور',price:450000,img:'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80',vehicles:['ALL']},
{id:5,name:'لنت ترمز جلو کیا / هیوندای',cat:'ترمز',price:980000,img:'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c5?auto=format&fit=crop&w=700&q=80',vehicles:['کیا|سراتو','کیا|اسپورتیج','هیوندای|النترا','هیوندای|توسان']},
{id:6,name:'روغن موتور توتال 5W-30',cat:'روغن',price:1280000,img:'https://images.unsplash.com/photo-1635784063320-3e7b3b9b4b6f?auto=format&fit=crop&w=700&q=80',vehicles:['ALL']},
{id:7,name:'فیلتر روغن استاندارد',cat:'فیلتر',price:190000,img:'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=80',vehicles:['ALL']},
{id:8,name:'کمک فنر جلو خودرو',cat:'مصرفی',price:2650000,img:'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=700&q=80',vehicles:['پژو|۲۰۶','پژو|۲۰۷','پژو|۴۰۵','پژو|پارس','سایپا|پراید','سایپا|تیبا']}];
export const categories=[['مصرفی','🛢️','لوازم مصرفی'],['ترمز','◉','ترمز'],['موتور','⚙️','موتور'],['برقی','🔋','برقی و الکترونیکی'],['بدنه','🚘','بدنه و قطعات خارجی'],['فیلتر','▦','فیلترها'],['روغن','🛢','روغن و روانکار']];
export const money=n=>Number(n||0).toLocaleString('fa-IR')+' تومان';
export const fallback='/assets/hero.png';