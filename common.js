// ============================================================
//  common.js — Up סטוק | קוד משותף לכל הדפים
//  v1.1
// ============================================================

const WHATSAPP_NUMBER = '972549397753';
const BIT_NUMBER      = '0543191550';
const PAYBOX_NUMBER   = 'YOUR_PAYBOX_NUMBER';

let allProducts = [];
let barcodeToCategory = {};   // barcode -> Hebrew category
let activeCategory = null;    // currently selected category filter
let cart = [];

function injectCommonHTML() {
    const header = document.createElement('div');
    header.className = 'cart-sticky-header';
    header.innerHTML = `
        <div onclick="toggleCart()" style="cursor:pointer; flex-shrink:0;">
            🛒 בסל: <span id="cart-count">0</span> | ₪<span id="cart-total-header">0.00</span>
        </div>
        <div class="search-box-mini">
            <div style="position:relative;display:flex;align-items:center;gap:6px;width:100%;">
              <input type="text" id="mainSearchInput" placeholder="🔍 חפש מוצר..." onkeyup="syncSearch(this.value)" autocomplete="off" style="flex:1;min-width:0;box-sizing:border-box;">
              <button onclick="toggleCatMenu(event)" id="catToggleBtn" style="flex-shrink:0;padding:7px 12px;background:#ed1c24;color:white;border:none;border-radius:20px;font-size:0.82em;font-weight:700;cursor:pointer;white-space:nowrap;font-family:inherit;">📂 קטגוריה ▾</button>
              <div id="catMenu" style="display:none;position:absolute;top:calc(100% + 6px);right:0;background:white;border:2px solid #ed1c24;border-radius:12px;padding:10px;z-index:2000;flex-wrap:wrap;gap:7px;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,0.15);min-width:280px;">
                <button class="cat-btn active" id="catAll" onclick="filterByCategory(null)">🏠 הכל</button>
                <button class="cat-btn" onclick="filterByCategory('חד פעמי')">🥤 חד פעמי</button>
                <button class="cat-btn" onclick="filterByCategory('מוצרי אפיה ובישול')">🍰 אפיה ובישול</button>
                <button class="cat-btn" onclick="filterByCategory('מוצרי נקיון וטיפוח')">🧹 נקיון וטיפוח</button>
                <button class="cat-btn" onclick="filterByCategory('יום הולדת ומתנות')">🎂 יום הולדת</button>
                <button class="cat-btn" onclick="filterByCategory('לבית')">🏡 לבית</button>
                <button class="cat-btn" onclick="filterByCategory('אביזרי רכב')">🚗 אביזרי רכב</button>
              </div>
            </div>
        </div>`;
    document.body.insertBefore(header, document.body.firstChild);

    const nav = document.createElement('div');
    nav.className = 'nav-bar';
    nav.innerHTML = `
        <a href="index.html">🏠 בית</a>
        <a href="promos.html" style="color:#ed1c24;font-weight:800;">🔥 מבצעים</a>
        <a href="about.html">ℹ️ אודות</a>
        <a href="contact.html">📞 צור קשר</a>
        <a href="reviews.html">⭐ חוות דעת</a>`;
    document.body.insertBefore(nav, header.nextSibling);

    const searchOverlay = document.createElement('div');
    searchOverlay.id = 'search-overlay';
    searchOverlay.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #eee;padding-bottom:10px;">
            <h2 id="search-status-title" style="margin:0;font-size:1.2em;">תוצאות חיפוש</h2>
            <button onclick="closeSearch()" style="background:var(--primary);color:white;border:none;padding:8px 15px;border-radius:8px;cursor:pointer;font-weight:bold;">סגור X</button>
        </div>
        <div class="products-grid" id="search-results-container"></div>`;
    document.body.insertBefore(searchOverlay, nav.nextSibling);

    const waFloat = document.createElement('a');
    waFloat.href = `https://wa.me/${WHATSAPP_NUMBER}`;
    waFloat.target = '_blank';
    waFloat.className = 'whatsapp-float';
    waFloat.innerHTML = '💬';
    document.body.appendChild(waFloat);

    const toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.innerHTML = '✅ נוסף לסל!';
    document.body.appendChild(toast);

    const imgOverlay = document.createElement('div');
    imgOverlay.id = 'imgOverlay';
    imgOverlay.onclick = () => { imgOverlay.style.display = 'none'; };
    imgOverlay.innerHTML = `
        <button onclick="event.stopPropagation();document.getElementById('imgOverlay').style.display='none'"
            style="position:fixed;top:20px;left:20px;background:white;color:#1a1a1a;border:none;border-radius:50%;width:40px;height:40px;font-size:1.3em;cursor:pointer;z-index:5001;box-shadow:0 2px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">✕</button>
        <img id="viewImg" src="">`;
    document.body.appendChild(imgOverlay);

    const cartModal = document.createElement('div');
    cartModal.id = 'cartModal';
    cartModal.className = 'modal';
    cartModal.innerHTML = `
        <div class="modal-content">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                <button onclick="toggleCart()" style="background:none;border:1px solid #ccc;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:1.1em;">✕</button>
                <h2 style="margin:0;">הסל שלי 🛍️</h2>
                <button onclick="clearCart()" style="background:none;border:1px solid #ccc;padding:5px 10px;border-radius:5px;cursor:pointer;">🗑️ ריקון</button>
            </div>
            <div id="cart-items-list" style="max-height:250px;overflow-y:auto;border-bottom:1px solid #eee;"></div>
            <div class="customer-form">
                <label>👤 שם מלא (חובה):</label>
                <input type="text" id="cust-name" placeholder="הכנס שם מלא">
                <label>📞 טלפון (חובה):</label>
                <input type="tel" id="cust-phone" placeholder="מספר ליצירת קשר">
                <label>📍 עיר / שכונה:</label>
                <input type="text" id="cust-loc" placeholder="לאן להגיע?">
            </div>
            <div style="display:flex;justify-content:space-between;font-size:1.4em;font-weight:bold;margin-top:15px;">
                <span>סה"כ:</span><span>₪<span id="cart-total-modal">0.00</span></span>
            </div>
            <button onclick="sendToWhatsApp()" style="background:#25d366;color:white;border:none;width:100%;padding:15px;border-radius:10px;font-size:1.2em;font-weight:bold;cursor:pointer;margin-top:15px;">
                💬 שלח הזמנה בוואטסאפ
            </button>
            <div class="payment-section">
                <div class="payment-title">💳 או שלם עכשיו:</div>
                <button class="pay-btn pay-btn-bit" onclick="payWithBit()">🔵 תשלום עם Bit</button>
            </div>
            <button onclick="toggleCart()" style="width:100%;background:none;border:none;color:#999;cursor:pointer;margin-top:10px;">סגור</button>
        </div>`;
    document.body.appendChild(cartModal);

    const backToTop = document.createElement('button');
    backToTop.id = 'back-to-top';
    backToTop.innerHTML = '⬆';
    backToTop.title = 'חזרה לראש הדף';
    backToTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(backToTop);

    window.addEventListener('scroll', () => {
        backToTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });
}

function injectCommonCSS() {
    const style = document.createElement('style');
    style.textContent = `
        :root { --primary: #ed1c24; --dark: #1a1a1a; --light: #f8f9fa; --success: #2ecc71; }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; background: var(--light); color: var(--dark); direction: rtl; }
        .cart-sticky-header { position: sticky; top: 0; z-index: 2000; background: var(--primary); color: white; padding: 10px 15px; display: flex; justify-content: center; align-items: center; gap: 20px; font-weight: bold; box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
        .search-box-mini { width: 260px; }
        .search-box-mini input { width: 100%; padding: 8px 16px; border-radius: 20px; border: none; outline: none; font-size: 1em; font-family: 'Segoe UI', Tahoma, sans-serif; }
        .search-box-mini input::placeholder { color: #aaa; }
        .cat-btn { padding:7px 14px;border:2px solid #ed1c24;border-radius:20px;background:white;color:#ed1c24;font-size:0.85em;font-weight:700;cursor:pointer;transition:all 0.2s;white-space:nowrap;font-family:inherit; }
        .cat-btn:hover,.cat-btn.active { background:#ed1c24;color:white; }
        .nav-bar { background: white; padding: 15px; display: flex; justify-content: center; gap: 30px; border-bottom: 1px solid #eee; position: sticky; top: 45px; z-index: 1000; }
        .nav-bar a { text-decoration: none; color: var(--dark); font-weight: 600; }
        #search-overlay { display: none; position: fixed; top: 95px; left: 0; width: 100%; height: calc(100% - 95px); background: white; z-index: 1500; overflow-y: auto; padding: 20px; box-sizing: border-box; }
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-top: 20px; }
        .product-card { background: white; border-radius: 15px; padding: 15px; border: 1px solid #f0f0f0; position: relative; display: flex; flex-direction: column; transition: 0.3s; }
        .product-card img { width: 100%; aspect-ratio: 1/1; object-fit: contain; background: #fff; border-radius: 10px; margin-bottom: 12px; }
        .product-card h4 { margin: 10px 0; min-height: 40px; }
        .add-btn { background: var(--dark); color: white; border: none; width: 100%; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: background 0.2s; }
        .add-btn:active { background: #444; }
        .add-btn:disabled { background: #ccc; cursor: not-allowed; }
        .out-of-stock-badge { background: #ed1c24; color: white; font-size: 0.8em; font-weight: bold; padding: 4px 10px; border-radius: 20px; display: inline-block; margin-bottom: 8px; }
        #imgOverlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 5000; justify-content: center; align-items: center; cursor: pointer; }
        #imgOverlay img { max-width: 90%; max-height: 85%; border: 3px solid white; border-radius: 10px; }
        .modal { display: none; position: fixed; z-index: 3000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); }
        .modal-content { background: white; width: 90%; max-width: 450px; margin: 2vh auto; border-radius: 20px; padding: 25px; text-align: right; max-height: 90vh; overflow-y: auto; box-sizing: border-box; }
        .cart-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
        .customer-form { margin-top: 15px; padding: 15px; background: #f9f9f9; border-radius: 12px; }
        .customer-form input { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box; }
        .whatsapp-float { position: fixed; bottom: 25px; left: 25px; background: #25d366; color: white; border-radius: 50%; width: 48px; height: 48px; font-size: 1.4em; text-decoration: none; box-shadow: 0 4px 15px rgba(37,211,102,0.5); z-index: 4000; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
        .whatsapp-float:hover { transform: scale(1.1); }
        #cart-toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%) translateY(20px); background: #1a1a1a; color: white; padding: 12px 24px; border-radius: 25px; font-size: 1em; font-weight: bold; z-index: 6000; opacity: 0; transition: opacity 0.3s, transform 0.3s; pointer-events: none; white-space: nowrap; }
        #cart-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        .payment-section { margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px; }
        .payment-title { font-size: 0.9em; color: #666; margin-bottom: 10px; text-align: center; }
        .pay-btn { width: 100%; padding: 14px; border: none; border-radius: 10px; font-size: 1.1em; font-weight: bold; cursor: pointer; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 0.2s; }
        .pay-btn:hover { opacity: 0.9; }
        .pay-btn-bit { background: #0070f3; color: white; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        #back-to-top { display: none; position: fixed; bottom: 85px; left: 25px; background: var(--dark); color: white; border: none; border-radius: 50%; width: 44px; height: 44px; font-size: 1.2em; cursor: pointer; z-index: 4000; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: opacity 0.3s; }
        #back-to-top:hover { opacity: 0.8; }
        .nav-bar a.nav-active { color: var(--primary) !important; border-bottom: 2px solid var(--primary); padding-bottom: 3px; }
    `;
    document.head.appendChild(style);
}

// ===================================================
// 🛒  פונקציות סל
// ===================================================
function extractPrice(priceValue) {
    if (typeof priceValue === 'number') return priceValue;
    const str = String(priceValue);
    const nums = str.match(/\d+(\.\d+)?/g);
    if (!nums) return 0;
    return parseFloat(nums[nums.length - 1]);
}

function updateUI() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    let count = 0, total = 0;
    const itemsHtml = cart.map((i, idx) => {
        const qty = i.qty || 1;
        let lineTotal, promoTag = '';

        if (i.isPromo && i.unitPrice && i.promoPrice && i.units) {
            // qty = מספר יחידות בודדות
            const fullPromos = Math.floor(qty / i.units);
            const remainder  = qty % i.units;
            lineTotal = (fullPromos * i.promoPrice) + (remainder * i.unitPrice);
            // תגית מבצע אם הגיע לכמות
            if (fullPromos > 0 && remainder === 0) {
                promoTag = `<span style="font-size:0.72em;background:#ed1c24;color:white;border-radius:10px;padding:1px 7px;margin-right:5px;">🔥 מבצע!</span>`;
            }
        } else if (i.isPromo && i.promoPrice) {
            lineTotal = qty * i.promoPrice;
        } else {
            lineTotal = extractPrice(i.price) * qty;
        }

        count += qty;
        total += lineTotal;

        return `<div class="cart-item">
            <div style="display:flex;align-items:center;gap:6px;">
                <button onclick="removeItem(${idx})" style="background:none;border:none;color:red;cursor:pointer;font-size:1.2em;">×</button>
                <button onclick="changeQty(${idx},-1)" style="background:#eee;border:none;border-radius:4px;width:26px;height:26px;cursor:pointer;font-size:1em;font-weight:bold;">−</button>
                <span style="font-weight:bold;min-width:20px;text-align:center;">${qty}</span>
                <button onclick="changeQty(${idx},1)"  style="background:#eee;border:none;border-radius:4px;width:26px;height:26px;cursor:pointer;font-size:1em;font-weight:bold;">+</button>
                <span style="font-weight:bold;color:var(--primary);">₪${lineTotal.toFixed(2)}</span>
            </div>
            <div style="text-align:right;">
                <strong>${i.name}</strong>${promoTag}
            </div>
        </div>`;
    }).join('');

    document.getElementById('cart-count').innerText = count;
    document.getElementById('cart-total-header').innerText = total.toFixed(2);
    document.getElementById('cart-total-modal').innerText = total.toFixed(2);
    document.getElementById('cart-items-list').innerHTML = itemsHtml || '<div style="text-align:center;padding:20px;color:#888;">הסל ריק</div>';
}

function showToast(msg) {
    const toast = document.getElementById('cart-toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function addToCart(name, price, units) {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(i => i.name === name);
    if (existing) { existing.qty++; } else { cart.push({ name, price, qty: 1, units: units || null }); }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateUI();
    showToast('✅ ' + name.substring(0, 20) + ' נוסף לסל!');
}

function addPromoToCart(name, unitPrice, promoPrice, units) {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, unitPrice, promoPrice, units, qty: 1, isPromo: true });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateUI();
    showToast('✅ ' + name.substring(0, 20) + ' נוסף לסל!');
}

function changeQty(idx, delta) {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[idx].qty = (cart[idx].qty || 1) + delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateUI();
}

function removeItem(idx) {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(idx, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateUI();
}

function clearCart() {
    if (confirm("לרוקן את הסל?")) {
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateUI();
    }
}

function toggleCart() {
    const m = document.getElementById('cartModal');
    m.style.display = (m.style.display === 'block') ? 'none' : 'block';
    if (m.style.display === 'block') updateUI();
}

// ===================================================
// 💬  וואטסאפ ותשלום
// ===================================================
function getOrderDetails() {
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    const name     = document.getElementById('cust-name').value.trim();
    const phone    = document.getElementById('cust-phone').value.trim();
    const location = document.getElementById('cust-loc').value.trim();
    let total = 0;
    currentCart.forEach(i => {
        const qty = i.qty || 1;
        if (i.isPromo && i.unitPrice && i.promoPrice && i.units) {
            const fullPromos = Math.floor(qty / i.units);
            const remainder  = qty % i.units;
            total += (fullPromos * i.promoPrice) + (remainder * i.unitPrice);
        } else if (i.isPromo && i.promoPrice) {
            total += qty * i.promoPrice;
        } else {
            total += extractPrice(i.price) * qty;
        }
    });
    return { currentCart, name, phone, location, total };
}

function validateOrder() {
    const { currentCart, name, phone } = getOrderDetails();
    if (currentCart.length === 0) { alert("הסל ריק"); return false; }
    if (!name || !phone) { alert("בבקשה מלא שם ומספר טלפון"); return false; }
    return true;
}

function buildWhatsAppMsg() {
    const { currentCart, name, phone, location, total } = getOrderDetails();
    let msg = "*הזמנה חדשה מאתר Up סטוק*\n--------------------------\n";
    msg += `👤 *שם:* ${name}\n📞 *טלפון:* ${phone}\n`;
    if (location) msg += `📍 *מיקום:* ${location}\n`;
    msg += "--------------------------\n";
    currentCart.forEach(i => {
        const q = i.qty || 1;
        if (i.isPromo) {
            const promoTotal = i.unitPrice && i.promoPrice && i.units
                ? (() => {
                    const total = q * i.units;
                    const full  = Math.floor(total / i.units);
                    const rem   = total % i.units;
                    return (full * i.promoPrice) + (rem * i.unitPrice);
                })()
                : (i.promoPrice || 0) * q;
            msg += `• ${i.name}\n  מבצע | כמות: ${q} | סה"כ: ₪${promoTotal.toFixed(2)}\n`;
        } else {
            const p = extractPrice(i.price);
            msg += `• ${i.name}\n  כמות: ${q} | סה"כ: ₪${(p * q).toFixed(2)}\n`;
        }
    });
    msg += `--------------------------\n💰 *סה"כ לתשלום: ₪${total.toFixed(2)}*`;
    return msg;
}

function sendToWhatsApp() {
    if (!validateOrder()) return;
    const msg = buildWhatsAppMsg();
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function payWithBit() {
    if (!validateOrder()) return;
    const { total, name } = getOrderDetails();
    const note = encodeURIComponent('הזמנה מ-Up סטוק - ' + name);
    const url  = `https://bit.ly/pay/${BIT_NUMBER}?amount=${total.toFixed(2)}&note=${note}`;
    window.open(url, '_blank');
    setTimeout(() => {
        const msg = buildWhatsAppMsg() + '\n🔵 *תשלום נשלח דרך Bit*';
        window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    }, 1500);
}

// ===================================================
// 🔍  חיפוש עברי
// ===================================================
function fix(s)         { return s.replace(/ך/g,'כ').replace(/ם/g,'מ').replace(/ן/g,'נ').replace(/ף/g,'פ').replace(/ץ/g,'צ'); }
function removePunct(s) { return s.replace(/['\-\.,"]/g, ''); }
function normSmichut(s) { return s.replace(/ת(\s|$)/g, 'א$1').replace(/ת$/g, 'א'); }

function openCatMenu() {
    const m = document.getElementById('catMenu');
    if (m) m.style.display = 'flex';
}
function closeCatMenu() {
    const m = document.getElementById('catMenu');
    if (m) m.style.display = 'none';
}
function toggleCatMenu(e) {
    e.stopPropagation();
    const m = document.getElementById('catMenu');
    if (!m) return;
    const isOpen = m.style.display === 'flex';
    m.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen) {
        // close when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function handler(ev) {
                if (!m.contains(ev.target)) {
                    m.style.display = 'none';
                    document.removeEventListener('click', handler);
                }
            });
        }, 0);
    }
}
function filterByCategory(cat) {
    activeCategory = cat;
    // Update button styles
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    if (!cat) {
        const all = document.getElementById('catAll');
        if (all) all.classList.add('active');
    } else {
        document.querySelectorAll('.cat-btn').forEach(b => {
            if (b.textContent.includes(cat.substring(0,4))) b.classList.add('active');
        });
    }
    // Trigger search with current input value
    const q = document.getElementById('mainSearchInput')?.value || '';
    syncSearch(q);
    closeCatMenu();
}

function getCategoryForProduct(p) {
    // Try barcode from image filename
    if (p.image) {
        const barcode = p.image.replace('images/products/','').replace('.jpg','').replace('.jpeg','').trim();
        if (barcodeToCategory[barcode]) return barcodeToCategory[barcode];
    }
    return p.category || '';
}

function loadCategories() {
    fetch('categories.csv?t=' + Date.now())
        .then(r => r.text())
        .then(text => {
            const lines = text.split('\n').filter(l => l.trim());
            lines.forEach((line, i) => {
                if (i === 0) return; // skip header
                const parts = line.split(',');
                if (parts.length >= 2) {
                    barcodeToCategory[parts[0].trim()] = parts[1].trim();
                }
            });
        }).catch(() => {});
}

function syncSearch(val) {
    const overlay   = document.getElementById('search-overlay');
    const container = document.getElementById('search-results-container');
    const title     = document.getElementById('search-status-title');
    const qRaw      = val.toLowerCase().trim();
    if (!qRaw || qRaw.length < 2) { overlay.style.display = "none"; return; }
    overlay.style.display = "block";
    const qFixed     = fix(qRaw);
    const queryWords = qFixed.split(' ').filter(w => w.length > 0);
    const queryStems = queryWords.map(w => { const n = removePunct(normSmichut(w)); return n.length > 3 ? n.substring(0, 3) : n; });
    const filtered   = allProducts.filter(p => {
        // Category filter
        if (activeCategory) {
            const pCat = getCategoryForProduct(p);
            if (pCat !== activeCategory) return false;
        }
        const pFixed = removePunct(normSmichut(fix(p.name.toLowerCase())));
        return queryStems.every(stem => pFixed.includes(stem));
    });
    if (filtered.length === 0) { title.innerText = "לא נמצאו תוצאות ל: " + qRaw; container.innerHTML = ""; return; }
    title.innerText = `נמצאו ${filtered.length} תוצאות עבור "${qRaw}":`;
    container.innerHTML = filtered.map(p => {
        const baseName   = p.image ? p.image.replace(/\.(jpg|jpeg)$/i, '') : '';
        const imgJpg     = baseName ? 'images/products/' + baseName + '.jpg'  : 'images/logo.jpg';
        const imgJpeg    = baseName ? 'images/products/' + baseName + '.jpeg' : 'images/logo.jpg';
        const safeName   = p.name.replace(/'/g, "\\'");
        const outOfStock = !p.stock;
        return `<div class="product-card" style="${outOfStock ? 'opacity:0.55; filter:grayscale(60%);' : ''}">
            ${outOfStock ? '<div style="position:absolute;top:0;right:0;left:0;background:#ed1c24;color:white;text-align:center;padding:6px;font-weight:bold;font-size:0.85em;border-radius:15px 15px 0 0;">❌ אזל המלאי</div>' : ''}
            <img src="${imgJpg}" onerror="this.onerror=null;this.src='${imgJpeg}';this.onerror=function(){this.src='images/logo.jpg'}" onclick="openImg(this.src)" style="${outOfStock ? 'margin-top:32px;' : ''}">
            <h4>${p.name}</h4>
            <div style="color:var(--primary);font-weight:bold;font-size:1.2em;margin-bottom:10px;">₪${p.price}</div>
            <button class="add-btn" ${outOfStock ? 'disabled style="background:#bbb;"' : `onclick="addToCart('${safeName}','${p.price}')"`}>
                ${outOfStock ? 'אזל המלאי' : 'הוסף לסל +'}
            </button>
        </div>`;
    }).join('');
}

function closeSearch() {
    document.getElementById('search-overlay').style.display = "none";
    document.getElementById('mainSearchInput').value = "";
}

function openImg(src) {
    document.getElementById('viewImg').src = src;
    document.getElementById('imgOverlay').style.display = 'flex';
}

// ===================================================
// 📂  טעינת CSV
// ===================================================
async function loadInventory() {
    try {
        const response = await fetch('stock_new.csv?t=' + Date.now());
        const text = await response.text();
        const rows = text.split('\n').filter(r => r.trim());
        allProducts = [];
        loadCategories();
        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(',');
            if (cols.length >= 3) {
                const name     = cols[0]?.trim();
                const image    = cols[1]?.trim();
                const price    = parseFloat(cols[2]?.trim());
                const category = cols[3]?.trim() || '';
                const stock    = cols[4]?.trim() !== '0';
                if (name && !isNaN(price)) allProducts.push({ name, image, price, category, stock });
            }
        }
    } catch (e) { console.error("CSV Load Error", e); }
}

// ===================================================
// 🚀  אתחול
// ===================================================
document.addEventListener('DOMContentLoaded', function() {
    injectCommonCSS();
    injectCommonHTML();
    loadInventory();
    updateUI();

    // שחזור שם וטלפון שמורים
    const custNameEl  = document.getElementById('cust-name');
    const custPhoneEl = document.getElementById('cust-phone');
    if (custNameEl && custPhoneEl) {
        const savedName  = localStorage.getItem('cust_name');
        const savedPhone = localStorage.getItem('cust_phone');
        if (savedName)  custNameEl.value  = savedName;
        if (savedPhone) custPhoneEl.value = savedPhone;
        custNameEl.addEventListener('input',  e => localStorage.setItem('cust_name',  e.target.value));
        custPhoneEl.addEventListener('input', e => localStorage.setItem('cust_phone', e.target.value));
    }

    // הדגשת דף פעיל בתפריט
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-bar a').forEach(a => {
        const href = a.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            a.classList.add('nav-active');
        }
    });
});
