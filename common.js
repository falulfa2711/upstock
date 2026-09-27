// Up Stock storefront — shared UI, catalog and order calculations. 2026-09-27.
// All prices are calculated in agorot; WhatsApp is a request, not a paid order.
'use strict';
const WHATSAPP_NUMBER = '972508810105';
const DELIVERY_MIN = 100, DELIVERY_FREE = 300, DELIVERY_COST = 15;
let allProducts = [], allPromos = [], barcodeToCategory = {}, cart = [], deliveryMode = 'pickup';
let catalogState = 'loading', promoState = 'loading', activeCategory = null;
let variantModalData = {}, cartReturnFocus = null, searchTimer;
const SYNONYMS = {
    'מגבת':   ['מפיות', 'מפית', 'ניגוב', 'סושי'],
    'מגבות':  ['מפיות', 'מפית', 'ניגוב', 'סושי'],
    'נייר מגבת': ['סושי', 'מפיות'],
    'מפיות':  ['מגבת', 'מגבות', 'סושי'],
    'מפית':   ['מגבת', 'מגבות'],
    'כוס':    ['גביע', 'כוסות'],
    'כוסות':  ['גביע', 'כוס'],
    'גביע':   ['כוס', 'כוסות'],
    'צלחת':   ['צלחות'],
    'צלחות':  ['צלחת'],
    'שקית':   ['שקיות', 'קסרול', 'שק'],
    'שקיות':  ['שקית'],
    'סכין':   ['סכינים'],
    'סכינים': ['סכין'],
    'מזלג':   ['מזלגות'],
    'מזלגות': ['מזלג'],
    'כף':     ['כפות', 'כפיות'],
    'כפות':   ['כף'],
    'כפית':   ['כפיות'],
    'כפיות':  ['כפית', 'כף'],
    'סבון':   ['שמפו', 'ניקוי'],
    'שמפו':   ['סבון'],
    'ניקוי':  ['סבון', 'שמפו'],
    'קסרול':  ['שקית', 'מנה'],
    'נר':     ['נרות'],
    'נרות':   ['נר'],
    'בלון':   ['בלונים'],
    'בלונים': ['בלון'],
    'תבנית':  ['תבניות'],
    'תבניות': ['תבנית'],
    // סכו"ם — המפתח חייב להיות עם מ רגילה (אחרי נרמול fix())
    'סכומ':   ['סכין', 'מזלג', 'כף', 'כפית', 'סכינים', 'מזלגות', 'כפות', 'כפיות'],
    // כלי שתייה
    'כלי שתיה': ['כוס', 'כוסות', 'גביע', 'כוסית'],
    'שתיה':   ['כוס', 'כוסות', 'גביע'],
    // מפה
    'מפה':    ['גליל מפה', 'מפת שולחן', 'מפה מרובע', 'מפה מרובעת'],
    'גליל':   ['גליל מפה', 'גליל'],
    // ניקוי - הרחבה
    'ניקוי':  ['סבון', 'שמפו', 'ספוג', 'מגב', 'אקונומיקה', 'חומר ניקוי'],
    'ספוג':   ['מגב', 'ניקוי'],
    'מגב':    ['ספוג', 'ניקוי'],
    // כפות הגשה
    'הגשה':   ['כף', 'כפות', 'מזלג', 'מגש'],
};


const categoryCodeMap = {hadpaami:'חד פעמי',cleaning:'מוצרי נקיון וטיפוח',birthday:'יום הולדת ומתנות','Food Appeal':'Food Appeal',general:'כללי'};
const VARIANT_PRODUCTS = {
    'בלון הליום מספר': {
        options: [
            { label: 'מספר', choices: ['0','1','2','3','4','5','6','7','8','9'] },
            { label: 'צבע',  choices: ['תכלת','זהב','כסף','ורוד'] }
        ]
    },
    'מספרים מבצק סוכר': {
        options: [
            { label: 'מספר', choices: ['0','1','2','3','4','5','6','7','8','9'] },
            { label: 'צבע',  choices: ['כחול','לבן','ורוד'] }
        ]
    },
    'כוסות צבעוניות': {
        options: [
            { label: 'צבע', choices: ['תכלת','כחול','ורוד','סגול','ירוק','טורקיז','צהוב','אדום','זהב','כסף','לבן','שחור'] }
        ]
    },
    'צלחת וינטג': {
        options: [
            { label: 'בחר צבע', choices: ['זהב נצנצים','כסף נצנצים','מנטה','ורוד','שקוף','שחור','לבן','קרם'] }
        ]
    },
    'מזלג וינטג': {
        options: [
            { label: 'בחר צבע', choices: ['זהב נצנצים','כסף נצנצים','שחור','לבן','מנטה','ורוד','שקוף','קרם'] }
        ]
    },
    'סכין וינטג': {
        options: [
            { label: 'בחר צבע', choices: ['זהב נצנצים','כסף נצנצים','שחור','לבן','מנטה','ורוד','שקוף','קרם'] }
        ]
    },
    'כף וינטג': {
        options: [
            { label: 'בחר צבע', choices: ['זהב נצנצים','כסף נצנצים','שחור','לבן','מנטה','ורוד','שקוף','קרם'] }
        ]
    },
    'כפית וינטג': {
        options: [
            { label: 'בחר צבע', choices: ['זהב נצנצים','כסף נצנצים','לבן','מנטה','ורוד','קרם'] }
        ]
    },
    'נייר עטיפה גיליון': {
        options: [
            { label: 'בחר צבע', choices: ['תכלת פסים זהב','לבן פסים זהב','אפור פסים זהב','כחול פסים זהב','אדום פסים זהב'] }
        ]
    },
    'מגש וינטג\' אובלי גדול': {
        options: [
            { label: 'בחר צבע', choices: ['ורוד','זהב נצנץ','לבן','שקוף','קרם'] }
        ]
    },
    'מגש וינטג\' עמוק': {
        options: [
            { label: 'בחר צבע', choices: ['מנטה','ורוד','זהב נצנץ','לבן','שקוף','קרם'] }
        ]
    },
    'לפתניה וינטג': {
        options: [
            { label: 'בחר צבע', choices: ['ורוד','מנטה','לבן','שקוף','זהב נצנץ','ברונזה','קרם'] }
        ]
    },
    'קסרול וינטג': {
        options: [
            { label: 'בחר צבע', choices: ['ורוד','מנטה','לבן','שקוף','שחור','זהב נצנץ','קרם','ברונזה'] }
        ]
    }
};

const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => Number(value).toLocaleString('he-IL',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' ₪';
const cents = value => Math.round(Number(value) * 100);
function normalize(value) { return String(value || '').normalize('NFKC').toLowerCase().replace(/["'׳״־–-]/g,' ').replace(/ך/g,'כ').replace(/ם/g,'מ').replace(/ן/g,'נ').replace(/ף/g,'פ').replace(/ץ/g,'צ').replace(/\s+/g,' ').trim(); }
function extractPrice(value) { const matches = String(value).match(/\d+(?:\.\d+)?/g); return matches ? Number(matches[matches.length-1]) : 0; }
function readJSON(storage,key,fallback) { try { const value=JSON.parse(storage.getItem(key)); return value ?? fallback; } catch { return fallback; } }
function writeJSON(storage,key,value) { try { storage.setItem(key,JSON.stringify(value)); return true; } catch { return false; } }
function safeStorage(type) { try { return window[type]; } catch { return {getItem:()=>null,setItem:()=>{throw Error('Storage unavailable');}}; } }
const persistentStorage = safeStorage('localStorage'), tabStorage = safeStorage('sessionStorage');
function validCart(value) { return Array.isArray(value) ? value.filter(i=>i && typeof i.name==='string' && Number.isInteger(Number(i.qty)) && i.qty>0 && i.qty<=9999 && Number.isFinite(Number(i.price ?? i.unitPrice ?? i.promoPrice)) && Number(i.price ?? i.unitPrice ?? i.promoPrice)>=0).map(i=>({...i,qty:Number(i.qty)})) : []; }
function lineCents(item) {
    const q=item.qty || 1;
    if(item.isPromo && item.unitPrice>0 && item.promoPrice>0 && item.units>0) return Math.floor(q/item.units)*cents(item.promoPrice)+(q%item.units)*cents(item.unitPrice);
    if(item.isPromo && item.promoPrice>0) return q*cents(item.promoPrice);
    return q*cents(extractPrice(item.price));
}
function orderTotals(items,mode) { const subtotal=items.reduce((sum,i)=>sum+lineCents(i),0); const shipping=mode==='delivery' && subtotal<cents(DELIVERY_FREE) ? cents(DELIVERY_COST):0; return {subtotal,shipping,total:subtotal+shipping}; }
function persistCart() {
    const saved=writeJSON(persistentStorage,'cart',cart);
    if(!saved) showToast('הסל נשמר בחלון הנוכחי בלבד. הדפדפן חסם שמירה.');
    // Legacy standalone pages edit this representation. Keep a baseline so unchanged
    // snapshots never resurrect removed lines when returning to a shared page.
    const legacy=cart.map(i=>({...i,price:lineCents(i)/100/i.qty}));
    writeJSON(tabStorage,'upstock_cart',legacy);
    writeJSON(tabStorage,'upstock_legacy_baseline',legacy);
}
function loadCart() {
    cart=validCart(readJSON(persistentStorage,'cart',[]));
    const legacy=validCart(readJSON(tabStorage,'upstock_cart',[]));
    const baseline=readJSON(tabStorage,'upstock_legacy_baseline',null);
    if(Array.isArray(baseline)) {
        const names=new Set([...baseline,...legacy].map(i=>i.name));
        for(const name of names) {
            const before=baseline.filter(i=>i.name===name).reduce((s,i)=>s+i.qty,0);
            const after=legacy.filter(i=>i.name===name).reduce((s,i)=>s+i.qty,0);
            const delta=after-before;
            if(!delta) continue;
            const item=cart.find(i=>i.name===name);
            if(item) item.qty=Math.max(0,item.qty+delta);
            else if(delta>0) cart.push({...legacy.find(i=>i.name===name),qty:delta});
        }
        cart=cart.filter(i=>i.qty>0);
    } else {
        // First migration: retain each old basket, avoiding a duplicate copy of a line.
        legacy.forEach(i=>{const existing=cart.find(p=>p.name===i.name);if(existing) existing.qty=Math.max(existing.qty,i.qty);else cart.push(i);});
    }
    persistCart();
}
function parseCSV(text) {
    const rows=[]; let row=[],field='',quoted=false;
    for(let i=0;i<text.length;i++) { const c=text[i]; if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else if(quoted)quoted=false;else if(!field.trim())quoted=true;else field+=c;}else if(c===','&&!quoted){row.push(field.trim());field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field.trim());if(row.some(Boolean))rows.push(row);row=[];field='';}else field+=c; }
    row.push(field.trim());if(row.some(Boolean))rows.push(row);return rows;
}
async function csvFile(path) { const response=await fetch(path,{cache:'no-cache'}); if(!response.ok)throw Error(path+': '+response.status); return parseCSV(await response.text()).slice(1); }
function imagePath(value) {
    if(!value)return 'images/logo.jpg';
    const path=String(value).replace(/\\/g,'/');
    if(/^(https?:|data:|\/\/)/i.test(path)||path.includes('..'))return 'images/logo.jpg';
    const original=path.includes('/')?path:'images/products/'+path;
    // Non-generative edits; original filenames remain the catalog identifiers.
    const edited={'images/hot_cups.jpg':'images/catalog-edited/hot_cups-catalog.png','images/cold_cups.jpg':'images/catalog-edited/cold_cups-catalog.png','images/wipes.jpg':'images/catalog-edited/wipes-catalog.png'};
    return edited[original]||original;
}
function productId(p) { return p.id || 'product:'+(p.image || normalize(p.name)); }
function getCategoryForProduct(p) { const barcode=String(p.image||'').split('/').pop().replace(/\.(jpg|jpeg|png|webp)$/i,''); return barcodeToCategory[barcode] || categoryCodeMap[p.category] || p.category || 'כללי'; }
function findPromoForProduct(name,image) {
    if(image) { const found=allPromos.find(p=>imagePath(p.image)===imagePath(image));if(found)return found; }
    const found=allPromos.filter(p=>normalize(p.name)===normalize(name));return found.length===1?found[0]:null;
}
function stockProduct(p) { return allProducts.find(i=>imagePath(i.image)===imagePath(p.image)) || allProducts.find(i=>normalize(i.name)===normalize(p.name)); }
function canAdd(p) { const inventory=stockProduct(p);return p.stock!==false && (!inventory || inventory.stock); }
function makeItem(p) {
    const promo=p.isPromo?p:findPromoForProduct(p.name,p.image);
    const item={id:productId(p),name:p.name,image:p.image,price:Number(p.price)||0,qty:1};
    if(promo)Object.assign(item,{id:promo.id,name:promo.name,isPromo:true,unitPrice:promo.unitPrice,promoPrice:promo.promoPrice,units:promo.units,promo:promo.promo});
    return item;
}
function addProduct(p,variant) {
    if(!canAdd(p)){showToast('המוצר אזל מהמלאי');return;}
    if(getVariantKey(p.name)&&!variant){openVariantSelector(p.name,p.price,p);return;}
    const item=makeItem(p);if(variant){item.id+=':'+variant;item.name+=' — '+variant;item.variant=variant;}
    const existing=cart.find(i=>(i.id||i.name)===(item.id||item.name)||(!i.id&&i.name===item.name));
    if(existing){if(existing.qty>=9999)return;existing.qty++;}else cart.push(item);
    persistCart();updateUI();showToast('נוסף לסל: '+item.name);
}
// Compatibility with unchanged seasonal and category HTML.
function addToCart(name,price,units) { const p=allProducts.find(i=>i.name===name)||{name,price:extractPrice(price),units,id:'legacy:'+name};addProduct(p); }
function addPromoToCart(name,unitPrice,promoPrice,units) { const p=allPromos.find(i=>i.name===name&&i.units===units&&i.promoPrice===promoPrice)||{id:'promo:'+name+':'+units,name,unitPrice,promoPrice,units,isPromo:true,price:unitPrice||promoPrice};addProduct(p); }
function changeQty(index,delta) { const item=cart[index];if(!item)return;item.qty=Math.min(9999,item.qty+delta);if(item.qty<=0)cart.splice(index,1);persistCart();updateUI(); }
function removeItem(index) { cart.splice(index,1);persistCart();updateUI(); }
function clearCart() { cart=[];persistCart();updateUI(); }
function showToast(message) { if(!$('cart-toast'))return;$('cart-toast').textContent=message;$('cart-toast').classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>$('cart-toast')?.classList.remove('show'),3500); }
function renderProducts(container,products) {
    if(!container)return;container.replaceChildren();
    products.forEach(p=>{
        const article=document.createElement('article');article.className='product-card store-product';
        const promo=p.isPromo?p:findPromoForProduct(p.name,p.image);const available=canAdd(p);const variants=!!getVariantKey(p.name);
        const badge=document.createElement('span');badge.className='store-badge';badge.textContent=!available?'אזל מהמלאי':promo?promo.promo:'לבית וליום יום';article.append(badge);
        const picture=document.createElement('button');picture.className='store-picture';picture.type='button';picture.setAttribute('aria-label','הגדלת תמונת '+p.name);
        const img=document.createElement('img');img.src=imagePath(p.image);img.alt=p.name;img.loading='lazy';img.width=240;img.height=180;
        let attempts=0;img.onerror=()=>{const base=imagePath(p.image);const choices=[base.replace(/\/([^/]+)$/, '/0$1'),base.replace(/\.jpg$/i,'.jpeg')];if(attempts<choices.length)img.src=choices[attempts++];else {img.onerror=null;picture.textContent='תמונה תתווסף בקרוב';picture.classList.add('store-no-image');picture.disabled=true;}};picture.append(img);picture.onclick=()=>openImg(img.src);article.append(picture);
        const title=document.createElement('h3');title.textContent=p.name;article.append(title);
        const unit=document.createElement('p');unit.className='store-unit';unit.textContent=promo&&!promo.unitPrice?'מארז של '+promo.units+' יחידות':'מחיר ליחידה / חבילה';article.append(unit);
        const price=document.createElement('strong');price.className='store-price';price.textContent=money(promo?(promo.unitPrice||promo.promoPrice):p.price);article.append(price);
        const add=document.createElement('button');add.className='add-btn';add.disabled=!available;add.textContent=!available?'אזל מהמלאי':variants?'בחירת צבע / מאפיינים':promo&&!promo.unitPrice?'+ הוספת מארז':'+ הוספה לסל';add.onclick=()=>addProduct(p);article.append(add);container.append(article);
    });
}
function renderCatalog() {
    if($('home-products'))renderProducts($('home-products'),allPromos.filter(canAdd).slice(0,4));
    if($('promos-container')){ $('promos-container').className='store-grid';renderProducts($('promos-container'),allPromos); }
    const slider=$('productSlider');if(slider)initProductSlider(slider.dataset.category);
}
async function loadInventory() {
    const results=await Promise.allSettled([csvFile('stock_new.csv'),csvFile('stock_promos.csv'),csvFile('categories.csv')]);
    if(results[0].status==='fulfilled'){
        allProducts=results[0].value.filter(r=>r[0]&&r[2]!==''&&Number.isFinite(Number(r[2]))&&Number(r[2])>=0).map(r=>({id:'product:'+r[1],name:r[0],image:r[1],price:Number(r[2]),category:r[3]||'',stock:r[4]!=='0'}));catalogState='ready';
    }else catalogState='error';
    if(results[2].status==='fulfilled')results[2].value.forEach(r=>{barcodeToCategory[r[0]]=r[1];});
    if(results[1].status==='fulfilled'){
        allPromos=results[1].value.map(r=>({id:'promo:'+r[2],name:r[0],promo:r[1],image:r[2],units:Number(r[3]),unitPrice:Number(r[4])||0,promoPrice:Number((r[1]?.match(/ב[-\s]*(\d+(?:\.\d+)?)/)||[])[1]),isPromo:true})).filter(p=>p.name&&p.units>0&&p.promoPrice>0);promoState='ready';
    }else promoState='error';
    renderCatalog();
    for(const id of ['home-products','promos-container'])if($(id)&&!allPromos.length)$(id).innerHTML='<div class="store-empty">'+(promoState==='error'?'לא הצלחנו לטעון את המבצעים.':'אין כרגע מבצעים להצגה.')+' <button type="button" onclick="loadInventory()">טעינה מחדש</button></div>';
    const search=$('mainSearchInput');if(search?.value)syncSearch(search.value);
}
function initProductSlider(category) {
    const container=$('productSlider');if(!container)return;container.className='store-grid';
    const products=allProducts.filter(p=>getCategoryForProduct(p)===category);
    const section=$('productSliderSection');section?.querySelectorAll('.slider-arrow').forEach(b=>b.hidden=true);
    const heading=section?.querySelector('h2');if(heading)heading.textContent='המוצרים במחלקה';
    if(section){const gallery=section.parentElement.querySelector('.gallery');if(gallery){let before=gallery.previousElementSibling?.matches('h2')?gallery.previousElementSibling:gallery;before.before(section);}}
    let visible=24;const draw=()=>{renderProducts(container,products.slice(0,visible));const old=$('store-more');if(old)old.remove();if(products.length>visible){const more=document.createElement('button');more.id='store-more';more.className='store-more';more.textContent='הצגת מוצרים נוספים ('+(products.length-visible)+')';more.onclick=()=>{visible+=24;draw();};container.after(more);}};draw();
    if(!products.length)container.innerHTML='<p class="store-empty">'+(catalogState==='error'?'לא הצלחנו לטעון את המוצרים. <button onclick="loadInventory()">נסו שוב</button>':'לא נמצאו מוצרים במחלקה. אפשר לחפש מוצר בשורת החיפוש.')+'</p>';
}
function slideProducts() {} // Old category arrows are hidden; product grids do not move.
function syncSearch(value) {
    const overlay=$('search-overlay'), container=$('search-results-container');if(!overlay)return;
    const query=normalize(value);if(query.length<2){closeSearch(false);return;}overlay.hidden=false;
    if(catalogState!=='ready'){ $('search-status-title').textContent=catalogState==='error'?'לא הצלחנו לטעון מוצרים. נסו לרענן את הדף.':'טוענים מוצרים…';container.replaceChildren();return; }
    const words=query.split(' ');const synonyms=Object.fromEntries(Object.entries(SYNONYMS).map(([key,values])=>[normalize(key),values.map(normalize)]));
    const found=allProducts.filter(p=>(!activeCategory||getCategoryForProduct(p)===activeCategory)&&words.every(w=>[w,...(synonyms[w]||[])].some(term=>normalize(p.name).includes(term))));
    $('search-status-title').textContent=found.length?'נמצאו '+found.length+' מוצרים':'לא נמצאו מוצרים — נסו שם קצר יותר';
    let limit=36;const draw=()=>{renderProducts(container,found.slice(0,limit));$('search-more')?.remove();if(found.length>limit){const b=document.createElement('button');b.id='search-more';b.className='store-more';b.textContent='הצגת תוצאות נוספות';b.onclick=()=>{limit+=36;draw();};container.after(b);}};draw();
}
function closeSearch(focus=true) { if($('search-overlay'))$('search-overlay').hidden=true;if(focus)$('mainSearchInput')?.focus(); }
function filterByCategory(cat) { activeCategory=cat;syncSearch($('mainSearchInput')?.value||''); }
function openCatMenu(){} function closeCatMenu(){} function toggleCatMenu(){}
function openImg(src) { const dialog=$('store-image-dialog');$('store-large-image').src=src;dialog.showModal(); }
function closeModal() { $('store-image-dialog')?.close(); }
function getVariantKey(name) { return Object.keys(VARIANT_PRODUCTS).find(k=>name.includes(k))||null; }
function openVariantSelector(name,price,product) {
    const key=getVariantKey(name);if(!key){addToCart(name,price);return;}
    variantModalData={name,price,product:product||allProducts.find(p=>p.name===name)||{name,price},selected:{}};
    $('variant-modal-title').textContent=name;const container=$('variant-options-container');container.replaceChildren();
    VARIANT_PRODUCTS[key].options.forEach((option,index)=>{const label=document.createElement('label');label.textContent=option.label;const select=document.createElement('select');select.id='variant-choice-'+index;select.setAttribute('aria-label',option.label);select.innerHTML='<option value="">בחירה…</option>';option.choices.forEach(choice=>{const o=document.createElement('option');o.value=choice;o.textContent=choice;select.append(o);});select.onchange=()=>{variantModalData.selected[option.label]=select.value;};label.append(select);container.append(label);});$('variant-error').textContent='';$('variantModal').showModal();
}
function confirmVariantAdd() { const config=VARIANT_PRODUCTS[getVariantKey(variantModalData.name)];if(!config)return;const missing=config.options.find(o=>!variantModalData.selected[o.label]);if(missing){$('variant-error').textContent='יש לבחור '+missing.label;return;}addProduct(variantModalData.product,config.options.map(o=>o.label+': '+variantModalData.selected[o.label]).join(' | '));closeVariantModal(); }
function closeVariantModal() { $('variantModal').close(); }
function toggleCart() { const dialog=$('cartModal');if(dialog.open){dialog.close();return;}cartReturnFocus=document.activeElement;updateUI();dialog.showModal(); }
function updateUI() {
    if(!$('cart-items-list'))return;
    const count=cart.reduce((sum,i)=>sum+i.qty,0);$('cart-count').textContent=count;$('cart-count-mobile').textContent=count;
    const list=$('cart-items-list');list.replaceChildren();
    cart.forEach((item,index)=>{const line=document.createElement('div');line.className='store-cart-line';
        const detail=document.createElement('div');const title=document.createElement('strong');title.textContent=item.name;detail.append(title);
        const price=document.createElement('p');price.textContent=money(lineCents(item)/100)+(item.isPromo&&!item.unitPrice?' · '+item.units+' יחידות במארז':'');detail.append(price);
        const controls=document.createElement('div');controls.className='store-qty';
        for(const [label,action] of [['−',()=>changeQty(index,-1)],[String(item.qty),null],['+',()=>changeQty(index,1)],['הסרה',()=>removeItem(index)]]){const el=document.createElement(action?'button':'span');el.textContent=label;if(action){el.type='button';el.setAttribute('aria-label',(label==='+'?'הגדלת כמות ':label==='−'?'הקטנת כמות ': 'הסרת ')+item.name);el.onclick=action;}controls.append(el);}line.append(detail,controls);list.append(line);});
    if(!cart.length)list.innerHTML='<div class="store-empty">הסל שלכם עדיין ריק.<br>מוסיפים מוצר ומתחילים כאן.</div>';
    const totals=orderTotals(cart,deliveryMode);$('cart-subtotal').textContent=money(totals.subtotal/100);$('cart-shipping').textContent=deliveryMode==='pickup'?'איסוף עצמי — ללא עלות':totals.shipping?money(totals.shipping/100):'חינם';$('cart-total-modal').textContent=money(totals.total/100);
    $('store-checkout').hidden=!cart.length;updateDeliveryCostNote();
}
function setDeliveryMode(mode) { deliveryMode=mode==='delivery'?'delivery':'pickup';$('delivery-fields').hidden=deliveryMode!=='delivery';$('pickup-fields').hidden=deliveryMode!=='pickup';document.querySelectorAll('[data-delivery]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.delivery===deliveryMode)));$('order-error').textContent='';updateUI(); }
function updateDeliveryCostNote() { const total=orderTotals(cart,deliveryMode).subtotal/100;const note=$('delivery-cost-note');if(note)note.textContent=deliveryMode==='pickup'?'איסוף מהמסגר 1, אור יהודה, לאחר אישור החנות.':total<DELIVERY_MIN?'חסרים '+money(DELIVERY_MIN-total)+' למינימום הזמנה למשלוח.':total<DELIVERY_FREE?'משלוח 15 ₪ · חסרים '+money(DELIVERY_FREE-total)+' למשלוח חינם.':'המשלוח ללא עלות.'; }
function getOrderDetails() { const totals=orderTotals(cart,deliveryMode);return {currentCart:cart,name:$('cust-name')?.value.trim()||'',phone:$('cust-phone')?.value.trim()||'',location:$('cust-loc')?.value.trim()||'',total:totals.subtotal/100,grandTotal:totals.total/100}; }
function validateOrder() {
    const {name,phone,location,total}=getOrderDetails();let message='',field;
    if(!cart.length)message='הסל ריק.';
    else if(!name){message='יש למלא שם מלא.';field=$('cust-name');}
    else if(!/^(?:0\d{8,9}|\+972\d{8,9})$/.test(phone.replace(/[\s()-]/g,''))){message='יש להזין מספר טלפון תקין, למשל 0501234567.';field=$('cust-phone');}
    else if(deliveryMode==='delivery'&&!location){message='יש למלא עיר, רחוב ומספר בית.';field=$('cust-loc');}
    else if(deliveryMode==='delivery'&&!$('delivery-area').checked){message='יש לאשר שהכתובת נמצאת בבקעת אונו. לכתובת אחרת, פנו לחנות.';field=$('delivery-area');}
    else if(deliveryMode==='delivery'&&total<DELIVERY_MIN)message='מינימום הזמנה למשלוח הוא '+money(DELIVERY_MIN)+'. אפשר לבחור איסוף עצמי.';
    else if(!$('terms-agree').checked){message='יש לאשר את תנאי ההזמנה.';field=$('terms-agree');}
    const unavailable=cart.find(item=>{const p=stockProduct(item);return p&&!p.stock;});
    if(!message&&unavailable)message='המוצר '+unavailable.name+' אינו זמין כרגע. יש להסירו מהסל או לפנות לחנות.';
    $('order-error').textContent=message;if(field)field.focus();return !message;
}
function buildWhatsAppMsg() {
    const {name,phone,location}=getOrderDetails();const totals=orderTotals(cart,deliveryMode);
    const lines=['בקשת הזמנה מאתר Up סטוק','שם: '+name,'טלפון: '+phone,deliveryMode==='delivery'?'משלוח: '+location:'איסוף עצמי מהמסגר 1, אור יהודה',''];
    cart.forEach(i=>{lines.push('• '+i.name);if(i.id)lines.push('  מזהה: '+i.id);lines.push('  כמות: '+i.qty+(i.isPromo&&!i.unitPrice?' מארזים ('+i.units+' יחידות במארז)':' יחידות / חבילות')+' | סה״כ: '+money(lineCents(i)/100));});
    lines.push('','סה״כ מוצרים: '+money(totals.subtotal/100),'משלוח: '+(deliveryMode==='pickup'?'איסוף עצמי':money(totals.shipping/100)),'סה״כ לתשלום לאחר אישור: '+money(totals.total/100));
    const notes=$('cust-notes')?.value.trim();if(notes)lines.push('הערות: '+notes);
    lines.push('','אשמח לאישור הזמינות, התשלום ומועד האספקה.');return lines.join('\n');
}
function sendToWhatsApp() { if(!validateOrder())return;const msg=buildWhatsAppMsg();$('order-copy').value=msg;$('copy-fallback').hidden=false;window.open('https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');$('order-status').textContent='נפתח חלון וואטסאפ. יש ללחוץ שם על שליחה; ההזמנה ממתינה לאישור החנות.'; }
async function copyOrder() { if(!validateOrder())return;const msg=buildWhatsAppMsg();$('order-copy').value=msg;$('copy-fallback').hidden=false;try{await navigator.clipboard.writeText(msg);$('order-status').textContent='הסיכום הועתק. אפשר להדביק אותו בשיחה עם החנות.';}catch{$('order-copy').focus();$('order-copy').select();$('order-status').textContent='אפשר להעתיק את הסיכום מהשדה המסומן.';} }
function payWithBit() { showToast('התשלום יתואם עם החנות בוואטסאפ לאחר אישור ההזמנה.'); }
function accToggle(cls) {document.body.classList.toggle(cls);writeJSON(persistentStorage,'acc_'+cls,document.body.classList.contains(cls));}
function accReset(){['big-text','contrast','no-anim','readable'].forEach(c=>{document.body.classList.remove(c);writeJSON(persistentStorage,'acc_'+c,false);});}
function accRestorePrefs(){['big-text','contrast','no-anim','readable'].forEach(c=>{if(readJSON(persistentStorage,'acc_'+c,false))document.body.classList.add(c);});}
function injectCommonHTML() {
    const shell=document.createElement('div');shell.innerHTML=`
    <div class="store-top">המסגר 1, אור יהודה · איסוף עצמי ומשלוחים בבקעת אונו</div>
    <header class="store-header"><div class="store-header-inner"><a class="store-logo" href="index.html" aria-label="Up סטוק — דף הבית"><span>UP</span> סטוק<b>.</b></a><label class="store-search"><span aria-hidden="true">⌕</span><input id="mainSearchInput" type="search" placeholder="מה צריך לבית היום?" aria-label="חיפוש מוצרים" autocomplete="off"></label><button type="button" class="store-cart-button" onclick="toggleCart()" aria-haspopup="dialog">הסל שלי <span id="cart-count">0</span></button></div><nav class="store-nav" aria-label="מחלקות"><a href="index.html#categories">כל המחלקות</a><a href="cleaning.html">ניקיון וטיפוח</a><a href="hadpaami.html">חד־פעמי ואירוח</a><a href="baking.html">אפייה ומטבח</a><a href="birthday.html">ימי הולדת</a><a href="foodappeal.html">Food Appeal</a><a href="promos.html">מבצעים</a></nav></header>`;
    document.body.prepend(...shell.children);
    const ui=document.createElement('div');ui.innerHTML=`
    <section id="search-overlay" hidden aria-label="תוצאות חיפוש"><div class="store-search-heading"><h2 id="search-status-title">תוצאות חיפוש</h2><button type="button" onclick="closeSearch()">סגירה ✕</button></div><div id="search-results-container" class="store-grid"></div></section>
    <div id="cart-toast" role="status" aria-live="polite"></div>
    <dialog id="cartModal" class="store-dialog" aria-labelledby="store-cart-title"><div class="store-dialog-heading"><h2 id="store-cart-title">הסל שלי</h2><button class="store-close" onclick="toggleCart()" aria-label="סגירת הסל">✕</button></div><div id="cart-items-list"></div><div id="store-checkout">
    <div class="store-form"><h3>איך תרצו לקבל את ההזמנה?</h3><div class="store-delivery"><button data-delivery="pickup" type="button" aria-pressed="true" onclick="setDeliveryMode('pickup')">איסוף עצמי</button><button data-delivery="delivery" type="button" aria-pressed="false" onclick="setDeliveryMode('delivery')">משלוח</button></div><p id="delivery-cost-note" class="store-muted"></p><div id="pickup-fields" class="store-muted">המסגר 1, אור יהודה · בתיאום מראש</div><div class="store-form-grid"><label for="cust-name">שם מלא<input id="cust-name" autocomplete="name" required maxlength="100"></label><label for="cust-phone">טלפון<input id="cust-phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="24" placeholder="0501234567"></label></div><div id="delivery-fields" hidden><label for="cust-loc">כתובת למשלוח<input id="cust-loc" autocomplete="street-address" maxlength="250" placeholder="עיר, רחוב ומספר בית"></label><label class="store-check"><input id="delivery-area" type="checkbox"> הכתובת נמצאת בבקעת אונו</label><p class="store-muted">מינימום משלוח 100 ₪ · עלות 15 ₪ · חינם מ־300 ₪. כתובת מחוץ לאזור? <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener">דברו עם החנות</a>.</p></div><label for="cust-notes">הערות להזמנה (לא חובה)<textarea id="cust-notes" rows="2" maxlength="500" placeholder="פרטים שיעזרו לנו להכין את ההזמנה"></textarea></label></div>
    <dl class="store-totals"><dt>מוצרים</dt><dd id="cart-subtotal"></dd><dt>משלוח</dt><dd id="cart-shipping"></dd><dt><strong>סה״כ</strong></dt><dd><strong id="cart-total-modal"></strong></dd></dl>
    <label class="store-check"><input id="terms-agree" type="checkbox"><span>קראתי ואני מסכים/ה ל<a href="policy.html" target="_blank" rel="noopener">תנאי ההזמנה, הביטולים והפרטיות</a>.</span></label><p id="order-error" role="alert"></p><button class="store-whatsapp" onclick="sendToWhatsApp()">המשך לשליחה בוואטסאפ ←</button><p class="store-muted">הבקשה תיפתח בוואטסאפ. ההזמנה, המחיר, התשלום ומועד האספקה יאושרו על ידי החנות. הסל נשמר גם לאחר היציאה.</p><button class="store-copy" onclick="copyOrder()">העתקת סיכום ההזמנה</button><p id="order-status" role="status"></p><div id="copy-fallback" hidden><label for="order-copy">סיכום להעתקה ידנית</label><textarea id="order-copy" readonly rows="5"></textarea></div></div></dialog>
    <dialog id="variantModal" class="store-dialog" aria-labelledby="variant-modal-title"><div class="store-dialog-heading"><h2 id="variant-modal-title"></h2><button onclick="closeVariantModal()" aria-label="סגירת בחירת מאפיינים">✕</button></div><div id="variant-options-container"></div><p id="variant-error" role="alert"></p><button class="store-primary" onclick="confirmVariantAdd()">הוספה לסל</button></dialog>
    <dialog id="store-image-dialog" class="store-dialog store-image-dialog" aria-label="תמונת מוצר מוגדלת"><button onclick="closeModal()" aria-label="סגירת תמונה">✕</button><img id="store-large-image" alt="תמונת המוצר המוגדלת"></dialog>
    <nav class="store-mobile-nav" aria-label="ניווט מהיר"><button class="mobile-accessibility" onclick="document.getElementById('acc-panel').hidden=!document.getElementById('acc-panel').hidden">נגישות</button><a href="index.html">בית</a><a href="index.html#categories">מחלקות</a><button onclick="document.getElementById('mainSearchInput').focus()">חיפוש</button><button onclick="toggleCart()">סל · <span id="cart-count-mobile">0</span></button><a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener">וואטסאפ</a></nav>
    <div class="store-tools"><button id="acc-btn" aria-label="אפשרויות נגישות" onclick="document.getElementById('acc-panel').hidden=!document.getElementById('acc-panel').hidden">נגישות</button><a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener">דברו איתנו</a></div><section id="acc-panel" hidden aria-label="אפשרויות נגישות"><button onclick="accToggle('big-text')">הגדלת טקסט</button><button onclick="accToggle('contrast')">ניגודיות גבוהה</button><button onclick="accToggle('no-anim')">הפחתת תנועה</button><button onclick="accReset()">איפוס</button><a href="accessibility.html">הצהרת נגישות</a><button onclick="document.getElementById('acc-panel').hidden=true">סגירה</button></section>`;
    document.body.append(...ui.children);
    $('mainSearchInput').addEventListener('input',e=>{clearTimeout(searchTimer);const value=e.target.value;searchTimer=setTimeout(()=>syncSearch(value),120);});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSearch(false);});
    document.querySelectorAll('dialog.store-dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
    $('cartModal').addEventListener('close',()=>{cartReturnFocus?.focus();});
    const updateHeaderSize=()=>document.documentElement.style.setProperty('--store-header-height',Math.ceil(document.querySelector('.store-header').getBoundingClientRect().height)+'px');
    new ResizeObserver(updateHeaderSize).observe(document.querySelector('.store-header'));updateHeaderSize();
}
function injectCommonCSS() {
    const style=document.createElement('style');style.textContent=`
    @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800&display=swap');
    :root{--primary:#763ac4;--accent:#763ac4;--dark:#281937;--light:#faf8fc;--bg:#faf8fc;--text:#281937;--text-muted:#76667e;--border:#e7dfec;--surface:white;--font:Heebo,Arial,sans-serif;--store-header-height:128px}
    *,*::before,*::after{box-sizing:border-box}body{margin:0;font-family:var(--font);color:var(--text);background:var(--bg);direction:rtl;padding-bottom:64px;text-align:right}button,input,select,textarea{font:inherit}button,a{-webkit-tap-highlight-color:transparent}button{cursor:pointer}button:disabled{cursor:not-allowed}a{color:var(--primary)}:focus-visible{outline:3px solid #a568dd;outline-offset:3px}[hidden]{display:none!important}img{max-width:100%}.container{max-width:1200px;margin:auto;padding:24px 32px}.skip-link{position:absolute;top:-100px;right:10px;z-index:9000;background:white;padding:12px}.skip-link:focus{top:10px}
    .store-top{background:#763ac4;color:white;text-align:center;font-size:12px;padding:8px 16px}.store-header{position:sticky;top:0;z-index:200;background:rgba(255,255,255,.98);border-bottom:1px solid var(--border)}.store-header-inner{max-width:1200px;margin:auto;padding:18px 32px;display:flex;gap:30px;align-items:center}.store-logo{font-size:28px;font-weight:800;text-decoration:none;color:#281937;white-space:nowrap;letter-spacing:-1px}.store-logo span{color:#763ac4}.store-logo b{color:#cc408c}.store-search{display:flex;align-items:center;gap:10px;background:#faf8fc;border:1px solid var(--border);border-radius:12px;padding:10px 14px;flex:1;max-width:600px}.store-search>span{font-size:25px;line-height:1}.store-search input{background:transparent;color:var(--text);border:0;min-width:0;width:100%;font-size:16px}.store-cart-button{background:#763ac4;color:white;border:0;border-radius:12px;padding:12px 18px;font-weight:600;white-space:nowrap;margin-right:auto}.store-cart-button span{margin-right:8px;background:#ffffff25;padding:2px 7px;border-radius:6px}.store-nav{max-width:1200px;margin:auto;display:flex;gap:24px;flex-wrap:wrap;padding:0 32px 14px}.store-nav a{font-size:13px;color:#66556f;text-decoration:none}.store-nav a:hover{text-decoration:underline;color:#763ac4}
    .store-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:18px!important;width:100%;margin-top:16px}.store-product.product-card{min-width:0;background:white;border:1px solid var(--border);border-radius:17px;padding:16px;display:flex;flex-direction:column;gap:9px;box-shadow:none;transition:box-shadow .15s;overflow:hidden;transform:none}.store-product:hover{box-shadow:0 8px 24px #45275b0c}.store-badge{font-size:12px;border-radius:6px;background:#f1e9fa;color:#6b30ac;padding:4px 8px;align-self:flex-start;min-height:26px}.store-picture{display:block;border:0;padding:0;background:white;width:100%;border-radius:10px}.store-product .store-picture img{display:block;width:100%;height:175px;object-fit:contain;aspect-ratio:auto;margin:0}.store-product h3{font-size:16px;line-height:1.5;margin:4px 0 0;min-height:48px;color:#281937}.store-unit{font-size:12px;color:#75667d;margin:0}.store-price{font-size:23px;color:#4c266f;margin-top:auto}.store-product .add-btn{background:white;color:#763ac4;border:1px solid #763ac4;border-radius:10px;padding:10px;width:100%;min-height:44px;font-weight:700;margin:4px 0 0;font-size:14px;white-space:normal}.store-product .add-btn:hover{background:#f3ebfb}.store-product .add-btn:disabled{background:#f0edf2;color:#716978;border-color:#d6cfdd}.store-empty{grid-column:1/-1;text-align:center;padding:32px 12px;color:#75667d;line-height:1.8}.store-more{display:block;margin:24px auto;border:1px solid #763ac4;border-radius:12px;background:white;color:#763ac4;padding:12px 24px}.product-slider-wrap{position:static!important;overflow:visible!important;padding:0!important}.product-slider-section{margin:24px 0 40px!important}.slider-arrow{display:none!important}.gallery{margin-top:18px!important}.gallery img{height:160px!important}.page-header{border-bottom:1px solid var(--border)!important;padding:28px 20px!important;margin-bottom:12px!important}.page-header h1{font-size:29px!important}.section-title{font-size:23px!important}
    #search-overlay{position:fixed;inset:var(--store-header-height) 0 0;background:#faf8fc;overflow:auto;z-index:190;padding:24px max(24px,calc((100% - 1136px)/2)) 100px}.store-search-heading{display:flex;justify-content:space-between;align-items:center;gap:14px}.store-search-heading h2{font-size:20px}.store-search-heading button,.store-close{background:white;border:1px solid var(--border);border-radius:9px;padding:8px 14px;min-height:44px}
    .store-dialog{color:#281937;background:white;border:0;border-radius:20px;padding:26px;width:calc(100% - 32px);max-width:570px;max-height:90dvh;overflow:auto;box-shadow:0 24px 90px #28193740;text-align:right}.store-dialog::backdrop{background:#24163280;backdrop-filter:blur(3px)}body:has(dialog[open]){overflow:hidden}.store-dialog-heading{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:18px}.store-dialog-heading h2{margin:0;font-size:25px}.store-dialog-heading button,.store-image-dialog>button{background:#f6f0fa;border:0;border-radius:8px;min-width:44px;min-height:44px}.store-cart-line{padding:14px 0;border-bottom:1px solid var(--border);display:flex;gap:16px;align-items:center;justify-content:space-between}.store-cart-line strong{font-size:14px;overflow-wrap:anywhere}.store-cart-line p{margin:5px 0;font-size:14px;color:#763ac4}.store-qty{display:flex;align-items:center;gap:8px;flex-shrink:0}.store-qty button{min-width:36px;min-height:40px;border:1px solid var(--border);border-radius:8px;background:white;color:#66349e}.store-qty button:last-child{font-size:12px}.store-form{background:#faf8fc;border-radius:14px;padding:18px;margin-top:18px}.store-form h3{margin:0 0 12px;font-size:18px}.store-delivery{display:flex;gap:10px}.store-delivery button{flex:1;padding:12px;background:white;border:1px solid #bba0d1;border-radius:10px;color:#66349e}.store-delivery button[aria-pressed=true]{background:#763ac4;color:white;border-color:#763ac4}.store-dialog label{display:block;font-size:14px;margin:12px 0 6px}.store-dialog input:not([type=checkbox]),.store-dialog select,.store-dialog textarea{display:block;width:100%;padding:11px;border:1px solid #cfc1da;border-radius:9px;background:white;color:#281937;margin:6px 0;font-size:16px}.store-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.store-dialog .store-check{display:flex;align-items:flex-start;gap:10px;font-size:13px;line-height:1.8}.store-check input{width:18px;height:18px;flex-shrink:0;accent-color:#763ac4;margin-top:3px}.store-muted{font-size:13px;color:#75667d;line-height:1.8}.store-totals{display:grid;grid-template-columns:1fr auto;gap:12px;margin:24px 0}.store-totals dt,.store-totals dd{margin:0}.store-totals strong{font-size:21px}.store-whatsapp,.store-primary{background:#167d4b;color:white;border:0;border-radius:11px;padding:14px 18px;width:100%;font-weight:700;min-height:48px}.store-primary{background:#763ac4}.store-copy{background:white;color:#66349e;border:1px solid #cfc1da;border-radius:10px;padding:10px 16px;width:100%}#order-error,#variant-error{color:#b12337;font-size:14px}#order-status{font-size:13px;color:#17663e}.store-image-dialog{max-width:800px}.store-image-dialog img{display:block;max-height:70dvh;object-fit:contain;margin:10px auto;width:100%}
    #cart-toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);max-width:calc(100% - 32px);padding:12px 22px;background:#281937;color:white;border-radius:12px;z-index:9000;opacity:0;pointer-events:none;font-size:14px}#cart-toast.show{opacity:1}.store-tools{position:fixed;bottom:12px;left:16px;display:flex;gap:8px;z-index:180}.store-tools button,.store-tools a{font-family:inherit;background:white;color:#66349e;border:1px solid #cfc1da;border-radius:10px;text-decoration:none;padding:10px 14px;font-size:12px;min-height:40px}.store-tools a{background:#167d4b;border-color:#167d4b;color:white}#acc-panel{position:fixed;left:16px;bottom:64px;background:white;border:1px solid var(--border);padding:16px;border-radius:14px;box-shadow:0 12px 30px #28193720;z-index:500;display:grid;gap:8px}#acc-panel button{padding:10px;background:#f3eafb;border:0;border-radius:8px}#acc-panel a{font-size:13px}.store-mobile-nav{display:none}.big-text main p,.big-text main a,.big-text .store-product h3{font-size:1.2em!important}.contrast{filter:contrast(1.4)}.no-anim *{animation:none!important;transition:none!important;scroll-behavior:auto!important}.readable{font-family:Arial,sans-serif}
    @media(max-width:900px){.store-header-inner{gap:20px}.store-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}.store-nav{gap:16px}.store-product .store-picture img{height:150px}}
    @media(max-width:600px){body{padding-bottom:112px}.container{padding:16px}.store-header-inner{padding:13px 16px;gap:12px;flex-wrap:wrap}.store-logo{font-size:25px}.store-search{order:3;flex-basis:100%;max-width:none;padding:9px 12px}.store-cart-button{padding:10px 14px}.store-nav{display:none}.store-top{font-size:11px;padding:7px 10px}.store-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important}.store-product.product-card{padding:12px;gap:8px}.store-product .store-picture img{height:140px}.store-product h3{font-size:14px;min-height:42px}.store-price{font-size:21px}.store-badge{font-size:11px}.store-product .add-btn{font-size:13px;padding:10px 6px}.store-mobile-nav{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-around;background:white;border-top:1px solid var(--border);z-index:200;padding:8px 4px max(8px,env(safe-area-inset-bottom))}.store-mobile-nav a,.store-mobile-nav button{background:none;border:0;color:#66349e;font:inherit;font-size:12px;text-decoration:none;padding:12px 8px;min-height:44px}.store-tools{bottom:70px;left:10px}.store-tools a{display:none}.store-tools button{padding:6px 10px;min-height:32px;background:#ffffffed}#acc-panel{bottom:112px}.store-dialog{padding:18px;width:calc(100% - 20px);max-height:92dvh}.store-cart-line{align-items:start;flex-direction:column;gap:8px}.store-qty{width:100%;justify-content:flex-start}.store-qty button{min-height:44px;min-width:44px}.store-form{padding:14px}.store-form-grid{grid-template-columns:1fr;gap:0}.store-dialog-heading h2{font-size:22px}.store-search-heading h2{font-size:17px}#search-overlay{padding:18px 16px 120px}#cart-toast{bottom:118px}.store-badge{overflow-wrap:anywhere}}
    #promos-container{max-width:1136px;margin:24px auto;padding:0 16px}body>h1{text-align:center} .store-no-image{height:175px;background:#f5f0f8;color:#75667d;font-size:13px;display:flex;align-items:center;justify-content:center}.products-grid:not(.store-grid){display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px}.product-card:not(.store-product){background:white;border:1px solid var(--border);border-radius:16px;padding:16px;display:flex;flex-direction:column}.product-card:not(.store-product) img{height:180px;width:100%;object-fit:contain}.add-btn{background:#763ac4;color:white;border:0;border-radius:10px;padding:12px;min-height:44px;font-weight:700}.store-tools{position:static;justify-content:center;padding:20px}.store-mobile-nav .mobile-accessibility{display:none}
    @media(max-width:600px){.store-tools{display:none}.store-mobile-nav .mobile-accessibility{display:block}.store-mobile-nav a,.store-mobile-nav button{font-size:11px;padding:12px 5px}.products-grid:not(.store-grid){grid-template-columns:repeat(2,minmax(0,1fr))}.home-hero .hero-display{display:none}}
    @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
    `;document.head.append(style);
}
document.addEventListener('DOMContentLoaded',()=>{
    injectCommonCSS();injectCommonHTML();loadCart();accRestorePrefs();updateUI();loadInventory();
});
// The unchanged promos page registers its old renderer before this deferred script.
// Disable that renderer so a slower response cannot overwrite the shared cards.
if(typeof window.loadPromos==='function')document.removeEventListener('DOMContentLoaded',window.loadPromos);
window.addEventListener('pageshow',event=>{if(event.persisted){loadCart();updateUI();}});
window.addEventListener('storage',event=>{if(event.key==='cart'){cart=validCart(readJSON(persistentStorage,'cart',[]));updateUI();}});
