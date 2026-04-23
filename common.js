// ============================================================
//  common.js — Up סטוק | קוד משותף לכל הדפים
//  v1.1
// ============================================================

const WHATSAPP_NUMBER = '972508810105';
const BIT_NUMBER      = '0543191550';
const PAYBOX_NUMBER   = 'YOUR_PAYBOX_NUMBER';

const DELIVERY_MIN = 100;
const DELIVERY_FREE = 300;
const DELIVERY_COST = 15;
let deliveryMode = 'pickup'; // 'pickup' or 'delivery'
let allProducts = [];
let barcodeToCategory = {};   // barcode -> Hebrew category
let allPromos = [];           // loaded from stock_promos.csv
let activeCategory = null;    // currently selected category filter
let cart = [];

// ===== מוצרים עם בחירת מאפיינים (וריאנטים) =====
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
let variantModalData = {};

function injectCommonHTML() {
    // ── Marquee bar ──
    const marquee = document.createElement('div');
    marquee.className = 'marquee-bar';
    marquee.innerHTML = `<div class="marquee-track">
        <a href="henna.html">🌿 אביזרי חינה</a>
        <a href="car.html">🚗 אביזרי רכב</a>
        <a href="cables.html">🔌 כבלים ומטענים</a>
        <a href="electric.html">⚡ תקעים ומאריכים</a>
        <span>🛍️ מחירים שמשתלמים</span>
        <span>📍 המסגר 1, אור יהודה</span>
        <a href="henna.html">🌿 אביזרי חינה</a>
        <a href="car.html">🚗 אביזרי רכב</a>
        <a href="cables.html">🔌 כבלים ומטענים</a>
        <a href="electric.html">⚡ תקעים ומאריכים</a>
        <span>🛍️ מחירים שמשתלמים</span>
        <span>📍 המסגר 1, אור יהודה</span>
    </div>`;
    document.body.insertBefore(marquee, document.body.firstChild);

    // ── Header ──
    const header = document.createElement('header');
    header.innerHTML = `
        <div class="header-inner">
            <a href="index.html" class="logo">
                <img src="images/logo.jpg" alt="UP Stock Logo" />
                <span class="logo-text">UP <span>סטוק</span></span>
            </a>
            <div class="header-search">
                <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" id="mainSearchInput" placeholder="חפש מוצר, קטגוריה..." onkeyup="syncSearch(this.value)" autocomplete="off" />
                <div class="search-dropdown" id="catMenu">
                    <a href="hadpaami.html" class="search-item"><span class="si-icon">🥤</span><div><div class="si-label">חד פעמי</div><div class="si-cat">קטגוריה</div></div></a>
                    <a href="baking.html" class="search-item"><span class="si-icon">🧁</span><div><div class="si-label">אפייה ומטבח</div><div class="si-cat">קטגוריה</div></div></a>
                    <a href="cleaning.html" class="search-item"><span class="si-icon">🧹</span><div><div class="si-label">מוצרי ניקיון</div><div class="si-cat">קטגוריה</div></div></a>
                    <a href="birthday.html" class="search-item"><span class="si-icon">🎂</span><div><div class="si-label">ימי הולדת</div><div class="si-cat">קטגוריה</div></div></a>
                    <a href="foodappeal.html" class="search-item"><span class="si-icon">🍱</span><div><div class="si-label">Food Appeal</div><div class="si-cat">קטגוריה</div></div></a>
                    <a href="promos.html" class="search-item"><span class="si-icon">🔥</span><div><div class="si-label">מבצעים</div><div class="si-cat">קטגוריה</div></div></a>
                </div>
            </div>
            <nav>
                <a href="index.html">דף בית</a>
                <a href="promos.html">מבצעים 🔥</a>
                <a href="reviews.html">חוות דעת</a>
                <a href="about.html">אודות</a>
                <a href="policy.html">מדיניות</a>
                <a href="contact.html">צור קשר</a>
            </nav>
            <button class="cart-btn" onclick="toggleCart()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                עגלת קניות
                <span class="cart-count" id="cart-count">0</span>
            </button>
            <a href="https://wa.me/${WHATSAPP_NUMBER}" class="header-cta" target="_blank">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                שלח הודעה
            </a>
        </div>`;
    document.body.insertBefore(header, marquee.nextSibling);

    const searchOverlay = document.createElement('div');
    searchOverlay.id = 'search-overlay';
    searchOverlay.innerHTML = `
        <div style="max-width:1200px;margin:0 auto;">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #e5deff;padding-bottom:12px;margin-bottom:20px;">
                <h2 id="search-status-title" style="margin:0;font-size:1.2em;color:#1a0a2e;">תוצאות חיפוש</h2>
                <button onclick="closeSearch()" style="background:#7c3aed;color:white;border:none;padding:8px 18px;border-radius:50px;cursor:pointer;font-weight:bold;">סגור ✕</button>
            </div>
            <div class="products-grid" id="search-results-container"></div>
        </div>`;
    document.body.insertBefore(searchOverlay, header.nextSibling);

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

    // Floating cart button for mobile
    const cartFloat = document.createElement('button');
    cartFloat.className = 'cart-float-btn';
    cartFloat.onclick = () => toggleCart();
    cartFloat.innerHTML = '🛒 <span id="cart-count-float">0</span> פריטים | ₪<span id="cart-total-float">0.00</span>';
    document.body.appendChild(cartFloat);

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
                <div style="display:flex;gap:8px;margin-bottom:10px;">
                    <button type="button" id="btn-pickup" onclick="setDeliveryMode('pickup')"
                        style="flex:1;padding:10px;border:2px solid #ed1c24;border-radius:8px;background:#ed1c24;color:white;font-weight:bold;cursor:pointer;font-family:inherit;">
                        🏪 איסוף עצמי
                    </button>
                    <button type="button" id="btn-delivery" onclick="setDeliveryMode('delivery')"
                        style="flex:1;padding:10px;border:2px solid #ed1c24;border-radius:8px;background:white;color:#ed1c24;font-weight:bold;cursor:pointer;font-family:inherit;">
                        🚚 משלוח
                    </button>
                </div>
                <div id="delivery-fields" style="display:none;">
                    <div id="delivery-info-box" style="background:#fff8e1;border:1px solid #ffc107;border-radius:8px;padding:10px;margin-bottom:10px;font-size:0.88em;line-height:1.7;">
                        📦 <b>תנאי משלוח:</b><br>
                        • מינימום הזמנה למשלוח: <b>₪100</b><br>
                        • עלות משלוח: <b>₪15</b> (שליח חיצוני)<br>
                        • משלוח חינם בהזמנה מעל <b>₪300</b><br>
                        • 📍 אזור משלוח: <b>בקעת אונו בלבד</b>
                    </div>
                    <label>📍 כתובת למשלוח (חובה):</label>
                    <input type="text" id="cust-loc" placeholder="רחוב, מספר, עיר">
                    <div id="delivery-cost-note" style="color:#25a244;font-weight:bold;font-size:0.9em;margin-bottom:8px;display:none;"></div>
                </div>
                <div id="pickup-fields">
                    <input type="text" id="cust-loc-pickup" placeholder="עיר / שכונה (אופציונלי)" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;box-sizing:border-box;">
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:1.4em;font-weight:bold;margin-top:15px;">
                <span>סה"כ:</span><span>₪<span id="cart-total-modal">0.00</span></span>
            </div>
            <div class="terms-checkbox-wrap" style="margin-top:15px;padding:12px;background:#f9f9f9;border:1px solid #ddd;border-radius:10px;">
                <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:0.9em;line-height:1.6;color:#333;">
                    <input type="checkbox" id="terms-agree" style="margin-top:4px;width:18px;height:18px;flex-shrink:0;accent-color:#ed1c24;cursor:pointer;">
                    <span>קראתי ואני מסכים/ה ל<a href="policy.html" target="_blank" style="color:#ed1c24;font-weight:bold;text-decoration:underline;">תקנון האתר</a>, כולל מדיניות ביטולים, החזרות ופרטיות.</span>
                </label>
                <div id="terms-error" style="color:#ed1c24;font-size:0.82em;margin-top:6px;display:none;">* יש לאשר את התקנון לפני ביצוע ההזמנה</div>
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

    // ===== חלון בחירת מאפיינים (וריאנטים) =====
    const variantModal = document.createElement('div');
    variantModal.id = 'variantModal';
    variantModal.className = 'modal';
    variantModal.style.display = 'none';
    variantModal.innerHTML = `
        <div class="modal-content" style="text-align:right; max-width:380px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;border-bottom:2px solid #eee;padding-bottom:10px;">
                <button onclick="closeVariantModal()" style="background:none;border:1px solid #ccc;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:1.1em;">✕</button>
                <h3 id="variant-modal-title" style="margin:0;font-size:1em;"></h3>
            </div>
            <div id="variant-options-container"></div>
            <button onclick="confirmVariantAdd()"
                style="width:100%;padding:13px;background:var(--dark);color:white;border:none;border-radius:10px;font-size:1.1em;font-weight:bold;cursor:pointer;margin-top:10px;font-family:inherit;">
                הוסף לסל +
            </button>
        </div>`;
    document.body.appendChild(variantModal);

    // ===== כפתור נגישות =====
    const accBtn = document.createElement('button');
    accBtn.id = 'acc-btn';
    accBtn.title = 'אפשרויות נגישות';
    accBtn.setAttribute('aria-label', 'פתח תפריט נגישות');
    accBtn.innerHTML = '♿';
    accBtn.onclick = () => {
        const p = document.getElementById('acc-panel');
        p.style.display = p.style.display === 'block' ? 'none' : 'block';
    };
    document.body.appendChild(accBtn);

    const accPanel = document.createElement('div');
    accPanel.id = 'acc-panel';
    accPanel.setAttribute('role', 'dialog');
    accPanel.setAttribute('aria-label', 'תפריט נגישות');
    accPanel.innerHTML = `
        <h3>♿ נגישות</h3>
        <button class="acc-opt" id="acc-big"      onclick="accToggle('big-text','acc-big')">🔠 הגדל טקסט</button>
        <button class="acc-opt" id="acc-contrast"  onclick="accToggle('contrast','acc-contrast')">🌓 ניגודיות גבוהה</button>
        <button class="acc-opt" id="acc-noanim"   onclick="accToggle('no-anim','acc-noanim')">⏸ עצור אנימציות</button>
        <button class="acc-opt" id="acc-readable" onclick="accToggle('readable','acc-readable')">🔤 גופן קריא</button>
        <button class="acc-opt acc-reset"          onclick="accReset()">🔄 אפס הכל</button>
        <a href="accessibility.html" style="display:block;text-align:center;font-size:0.8em;color:#666;margin-top:10px;text-decoration:underline;">הצהרת נגישות</a>`;
    document.body.appendChild(accPanel);

    // סגירת פאנל בלחיצה מחוץ לו
    document.addEventListener('click', e => {
        const panel = document.getElementById('acc-panel');
        const btn   = document.getElementById('acc-btn');
        if (panel && btn && !panel.contains(e.target) && e.target !== btn) {
            panel.style.display = 'none';
        }
    });

    const bottomNav = document.createElement('nav');
    bottomNav.className = 'mobile-bottom-nav';
    bottomNav.innerHTML = `
        <a href="index.html"><span class="nav-icon">🏠</span>דף בית</a>
        <a href="index.html#categories"><span class="nav-icon">📋</span>קטגוריות</a>
        <button onclick="document.getElementById('mainSearchInput')?.focus();document.getElementById('mainSearchInput')?.scrollIntoView({block:'center'})"><span class="nav-icon">🔍</span>חיפוש</button>
        <button onclick="toggleCart()"><span class="nav-icon">🛒</span>עגלה</button>
        <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank"><span class="nav-icon">💬</span>וואטסאפ</a>`;
    document.body.appendChild(bottomNav);

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
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap');
        :root {
            --bg: #f9f5ff; --surface: #ffffff; --text: #1a0a2e; --text-muted: #6b5b8a;
            --accent: #7c3aed; --accent-light: #ede9fe; --accent-hover: #6d28d9;
            --border: #e5deff; --gradient: linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#ec4899 100%);
            --font: 'Heebo','Segoe UI',Tahoma,sans-serif;
            --primary: #7c3aed; --dark: #1a0a2e; --light: #f9f5ff; --success: #2ecc71;
        }
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: var(--font); margin: 0; background: var(--bg); color: var(--text); direction: rtl; -webkit-font-smoothing: antialiased; }

        /* ── Marquee ── */
        .marquee-bar { background: var(--gradient); color: #fff; padding: 9px 0; overflow: hidden; font-size: 13px; font-weight: 600; }
        .marquee-track { display: flex; gap: 60px; animation: marquee 22s linear infinite; white-space: nowrap; }
        .marquee-track span, .marquee-track a { display: flex; align-items: center; gap: 8px; }
        .marquee-track a { color: #fff; text-decoration: none; background: rgba(255,255,255,0.15); padding: 3px 12px; border-radius: 50px; transition: background 0.2s; }
        .marquee-track a:hover { background: rgba(255,255,255,0.3); }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        /* ── Header ── */
        header { position: sticky; top: 0; z-index: 2000; background: rgba(249,245,255,0.97); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); }
        .header-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 72px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
        .logo img { width: 44px; height: 44px; border-radius: 12px; object-fit: cover; box-shadow: 0 4px 12px rgba(124,58,237,0.25); }
        .logo-text { font-size: 22px; font-weight: 900; color: var(--text); letter-spacing: -0.5px; }
        .logo-text span { background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        /* ── Nav ── */
        header nav { display: flex; align-items: center; gap: 2px; }
        header nav a { font-size: 14px; font-weight: 500; color: var(--text-muted); text-decoration: none; padding: 6px 12px; border-radius: 50px; transition: all 0.18s; white-space: nowrap; }
        header nav a:hover, header nav a.nav-active { color: var(--accent); background: var(--accent-light); }

        /* ── Search ── */
        .header-search { flex: 1; max-width: 320px; position: relative; }
        .header-search input { width: 100%; padding: 10px 16px 10px 42px; border-radius: 50px; border: 2px solid var(--border); background: var(--surface); font-family: var(--font); font-size: 14px; color: var(--text); outline: none; transition: border-color 0.18s, box-shadow 0.18s; direction: rtl; }
        .header-search input::placeholder { color: var(--text-muted); }
        .header-search input:focus { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(124,58,237,0.12); }
        .search-icon, .search-icon-svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; z-index: 1; }
        .search-dropdown { display: none; position: absolute; top: calc(100% + 8px); right: 0; left: 0; background: var(--surface); border: 2px solid var(--border); border-radius: 16px; box-shadow: 0 16px 48px rgba(124,58,237,0.15); overflow: hidden; z-index: 2100; }
        .search-dropdown.open { display: block; }
        .search-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; font-size: 14px; color: var(--text); text-decoration: none; transition: background 0.15s; cursor: pointer; }
        .search-item:hover { background: var(--accent-light); }
        .search-item .si-icon { font-size: 20px; }
        .search-item .si-label { font-weight: 600; }
        .search-item .si-cat { font-size: 12px; color: var(--text-muted); }

        /* ── Cart & WA buttons ── */
        .cart-btn { display: flex; align-items: center; gap: 8px; background: var(--gradient); color: #fff; border: none; padding: 10px 18px; border-radius: 50px; font-family: var(--font); font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: opacity 0.18s, transform 0.12s; box-shadow: 0 4px 16px rgba(124,58,237,0.35); flex-shrink: 0; }
        .cart-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .cart-count { background: rgba(255,255,255,0.3); border-radius: 50px; padding: 1px 8px; font-size: 12px; font-weight: 800; min-width: 20px; text-align: center; }
        .header-cta { display: flex; align-items: center; gap: 6px; background: transparent; color: var(--accent); border: 2px solid var(--accent); padding: 9px 18px; border-radius: 50px; font-family: var(--font); font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; text-decoration: none; transition: all 0.18s; flex-shrink: 0; }
        .header-cta:hover { background: var(--accent); color: #fff; }

        /* ── Mobile ── */
        .cart-float-btn { display: none; }
        @media (max-width: 900px) {
            header nav { display: none; }
            .header-cta { display: none; }
            .header-search { max-width: none; flex: 1; }
        }
        @media (max-width: 600px) {
            body { padding-bottom: 64px; }
            .header-inner { padding: 0 12px; gap: 10px; height: 60px; }
            .logo-text { font-size: 17px; }
            .logo img { width: 36px; height: 36px; }
            .cart-btn { font-size: 0; padding: 9px 12px; gap: 4px; }
            .cart-btn svg { display: block; width: 20px; height: 20px; flex-shrink: 0; }
            .cart-count { font-size: 11px !important; }
            .products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
            .product-card { padding: 10px; }
            .product-card h4 { font-size: 0.85em; min-height: 32px; }
            #search-overlay { top: 0 !important; height: 100% !important; }
        }

        /* ── Mobile bottom nav ── */
        .mobile-bottom-nav {
            display: none;
            position: fixed; bottom: 0; left: 0; right: 0;
            height: 64px;
            background: rgba(255,255,255,0.97);
            backdrop-filter: blur(16px);
            border-top: 1px solid var(--border);
            z-index: 2000;
            justify-content: space-around;
            align-items: center;
            box-shadow: 0 -4px 20px rgba(124,58,237,0.1);
        }
        .mobile-bottom-nav a, .mobile-bottom-nav button {
            display: flex; flex-direction: column; align-items: center; gap: 3px;
            color: var(--text-muted); text-decoration: none;
            font-size: 10px; font-weight: 600;
            background: none; border: none;
            padding: 6px 10px; border-radius: 12px;
            cursor: pointer; font-family: var(--font);
            transition: all 0.18s; min-width: 52px;
        }
        .mobile-bottom-nav .nav-icon { font-size: 20px; line-height: 1; }
        .mobile-bottom-nav a:hover, .mobile-bottom-nav button:hover,
        .mobile-bottom-nav a.active { color: var(--accent); background: var(--accent-light); }
        @media (max-width: 600px) { .mobile-bottom-nav { display: flex; } }

        /* ── Search overlay ── */
        #search-overlay { display: none; position: fixed; top: 108px; left: 0; width: 100%; height: calc(100% - 108px); background: white; z-index: 1500; overflow-y: auto; padding: 20px; box-sizing: border-box; }

        /* ── Products ── */
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-top: 20px; }
        .product-card { background: white; border-radius: 15px; padding: 15px; border: 1px solid var(--border); position: relative; display: flex; flex-direction: column; transition: box-shadow 0.3s; box-shadow: 0 2px 8px rgba(124,58,237,0.07); }
        .product-card:hover { box-shadow: 0 6px 20px rgba(124,58,237,0.15); }
        .product-card img { width: 100%; aspect-ratio: 1/1; object-fit: contain; background: #fff; border-radius: 10px; margin-bottom: 12px; }
        .product-card h4 { margin: 10px 0; min-height: 40px; }
        .add-btn { background: var(--gradient); color: white; border: none; width: 100%; padding: 10px; border-radius: 50px; cursor: pointer; font-weight: bold; font-family: var(--font); font-size: 14px; transition: opacity 0.2s; margin-top: auto; }
        .add-btn:hover { opacity: 0.88; }
        .add-btn:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }
        .out-of-stock-badge { background: #ed1c24; color: white; font-size: 0.8em; font-weight: bold; padding: 4px 10px; border-radius: 20px; display: inline-block; margin-bottom: 8px; }

        /* ── Modals ── */
        #imgOverlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 5000; justify-content: center; align-items: center; cursor: pointer; }
        #imgOverlay img { max-width: 90%; max-height: 85%; border: 3px solid white; border-radius: 10px; }
        .modal { display: none; position: fixed; z-index: 3000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); }
        .modal-content { background: white; width: 90%; max-width: 450px; margin: 2vh auto; border-radius: 20px; padding: 25px; text-align: right; max-height: 90vh; overflow-y: auto; box-sizing: border-box; }
        .cart-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
        .customer-form { margin-top: 15px; padding: 15px; background: #f9f9f9; border-radius: 12px; }
        .customer-form input { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box; }

        /* ── WA Float & Toast ── */
        .whatsapp-float { position: fixed; bottom: 25px; left: 25px; background: #25d366; color: white; border-radius: 50%; width: 48px; height: 48px; font-size: 1.4em; text-decoration: none; box-shadow: 0 4px 15px rgba(37,211,102,0.5); z-index: 4000; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
        .whatsapp-float:hover { transform: scale(1.1); }
        #cart-toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%) translateY(20px); background: #1a0a2e; color: white; padding: 12px 24px; border-radius: 25px; font-size: 1em; font-weight: bold; z-index: 6000; opacity: 0; transition: opacity 0.3s, transform 0.3s; pointer-events: none; white-space: nowrap; }
        #cart-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

        /* ── Payment & Variants ── */
        .payment-section { margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px; }
        .variant-group { margin-bottom: 15px; }
        .variant-group-label { font-weight: bold; margin-bottom: 8px; font-size: 0.95em; }
        .variant-choices { display: flex; flex-wrap: wrap; gap: 8px; }
        .variant-choice { padding: 8px 16px; border: 2px solid #ddd; border-radius: 8px; background: white; cursor: pointer; font-family: inherit; font-size: 0.9em; transition: all 0.15s; }
        .variant-choice:hover { border-color: var(--accent); color: var(--accent); }
        .variant-choice.selected { background: var(--dark); color: white; border-color: var(--dark); }
        .payment-title { font-size: 0.9em; color: #666; margin-bottom: 10px; text-align: center; }
        .pay-btn { width: 100%; padding: 14px; border: none; border-radius: 10px; font-size: 1.1em; font-weight: bold; cursor: pointer; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 0.2s; }
        .pay-btn:hover { opacity: 0.9; }
        .pay-btn-bit { background: #0070f3; color: white; }

        /* ── Misc ── */
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        #back-to-top { display: none; position: fixed; bottom: 85px; left: 25px; background: var(--accent); color: white; border: none; border-radius: 50%; width: 44px; height: 44px; font-size: 1.2em; cursor: pointer; z-index: 4000; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(124,58,237,0.3); transition: opacity 0.3s; }
        #back-to-top:hover { opacity: 0.8; }

        /* ── נגישות ── */
        #acc-btn { position: fixed; bottom: 145px; left: 25px; background: var(--accent); color: white; border: none; border-radius: 50%; width: 48px; height: 48px; font-size: 1.3em; cursor: pointer; z-index: 4001; box-shadow: 0 4px 15px rgba(124,58,237,0.5); display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
        #acc-btn:hover { transform: scale(1.1); }
        #acc-panel { display: none; position: fixed; bottom: 200px; left: 25px; background: white; border: 2px solid var(--accent); border-radius: 16px; padding: 15px; z-index: 4002; width: 195px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); direction: rtl; }
        #acc-panel h3 { margin: 0 0 12px; font-size: 1em; color: var(--accent); text-align: center; border-bottom: 1px solid #eee; padding-bottom: 8px; }
        .acc-opt { display: block; width: 100%; padding: 8px 10px; margin-bottom: 7px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; cursor: pointer; font-size: 0.88em; text-align: right; font-family: inherit; transition: all 0.2s; box-sizing: border-box; }
        .acc-opt:hover { background: var(--accent-light); border-color: var(--accent); }
        .acc-opt.on { background: var(--accent); color: white; border-color: var(--accent); }
        .acc-reset { background: #fff0f0 !important; color: #ed1c24 !important; border-color: #ed1c24 !important; }
        .acc-reset:hover { background: #ed1c24 !important; color: white !important; }
        body.acc-big-text { font-size: 118%; }
        body.acc-contrast * { background: #000 !important; color: #ff0 !important; border-color: #ff0 !important; }
        body.acc-contrast a { color: #0ff !important; }
        body.acc-contrast img { filter: grayscale(100%) contrast(200%); }
        body.acc-no-anim *, body.acc-no-anim *::before, body.acc-no-anim *::after { animation: none !important; transition: none !important; }
        body.acc-readable { font-family: Arial, Helvetica, sans-serif !important; letter-spacing: 0.05em; line-height: 1.7; }

        /* ── Product Slider ── */
        .product-slider-section { margin: 10px 0 30px; }
        .product-slider-wrap { position: relative; padding: 0 44px; }
        .product-slider { overflow: hidden; padding: 5px 0 15px; }
        .slider-inner { display: flex; width: max-content; direction: ltr; }
        .product-slider .product-card { min-width: 170px; max-width: 170px; flex-shrink: 0; margin-right: 15px; direction: rtl; }
        .slider-arrow { position: absolute; top: 45%; transform: translateY(-50%); background: white; border: 2px solid var(--accent); color: var(--accent); border-radius: 50%; width: 38px; height: 38px; font-size: 1.1em; cursor: pointer; z-index: 10; box-shadow: 0 2px 8px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .slider-arrow:hover { background: var(--accent); color: white; }
        .slider-arrow-next { right: 0; }
        .slider-arrow-prev { left: 0; }
        @media (max-width: 600px) { .product-slider-wrap { padding: 0 10px; } .slider-arrow { display: none; } .product-slider .product-card { min-width: 120px; max-width: 120px; margin-right: 10px; padding: 10px; } }
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

    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) cartCountEl.innerText = count;
    const cartTotalHeader = document.getElementById('cart-total-header');
    if (cartTotalHeader) cartTotalHeader.innerText = total.toFixed(2);
    document.getElementById('cart-total-modal').innerText = total.toFixed(2);
    // Update floating cart button (mobile)
    const floatCount = document.getElementById('cart-count-float');
    const floatTotal = document.getElementById('cart-total-float');
    if (floatCount) floatCount.innerText = count;
    if (floatTotal) floatTotal.innerText = total.toFixed(2);
    document.getElementById('cart-items-list').innerHTML = itemsHtml || '<div style="text-align:center;padding:20px;color:#888;">הסל ריק</div>';
    updateDeliveryCostNote();
}

function showToast(msg) {
    const toast = document.getElementById('cart-toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function addToCart(name, price, units) {
    cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if this product has a promo
    const promo = findPromoForProduct(name);
    if (promo && promo.unitPrice > 0) {
        // Extract promo total price from promo string e.g. "מבצע 2 ב-22" -> 22
        const promoMatch = promo.promo.match(/ב[-\s]?(\d+)/);
        const promoPrice = promoMatch ? parseFloat(promoMatch[1]) : null;
        if (promoPrice) {
            const existing = cart.find(i => i.name === name);
            if (existing) {
                existing.qty++;
            } else {
                cart.push({ name, unitPrice: promo.unitPrice, promoPrice, units: promo.units, qty: 1, isPromo: true });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateUI();
            showToast('🔥 ' + name.substring(0, 20) + ' נוסף במחיר מבצע!');
            return;
        }
    }

    // No promo - regular price
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

function setDeliveryMode(mode) {
    deliveryMode = mode;
    const btnPickup   = document.getElementById('btn-pickup');
    const btnDelivery = document.getElementById('btn-delivery');
    const dFields     = document.getElementById('delivery-fields');
    const pFields     = document.getElementById('pickup-fields');
    if (mode === 'delivery') {
        btnDelivery.style.background = '#ed1c24';
        btnDelivery.style.color      = 'white';
        btnPickup.style.background   = 'white';
        btnPickup.style.color        = '#ed1c24';
        dFields.style.display = 'block';
        pFields.style.display = 'none';
    } else {
        btnPickup.style.background   = '#ed1c24';
        btnPickup.style.color        = 'white';
        btnDelivery.style.background = 'white';
        btnDelivery.style.color      = '#ed1c24';
        dFields.style.display = 'none';
        pFields.style.display = 'block';
    }
    updateDeliveryCostNote();
}

function updateDeliveryCostNote() {
    const note = document.getElementById('delivery-cost-note');
    if (!note) return;
    const { total } = getOrderDetails();
    if (deliveryMode !== 'delivery') { note.style.display='none'; return; }
    note.style.display = 'block';
    if (total >= DELIVERY_FREE) {
        note.style.color = '#25a244';
        note.textContent = '🎉 משלוח חינם! (הזמנה מעל ₪' + DELIVERY_FREE + ')';
    } else {
        note.style.color = '#e67e22';
        note.textContent = '🚚 עלות משלוח: ₪' + DELIVERY_COST + ' | חינם מעל ₪' + DELIVERY_FREE;
    }
}

function validateOrder() {
    const { currentCart, name, phone, total } = getOrderDetails();
    if (currentCart.length === 0) { alert("הסל ריק"); return false; }
    if (!name || !phone) { alert("בבקשה מלא שם ומספר טלפון"); return false; }
    const termsCheckbox = document.getElementById('terms-agree');
    const termsError = document.getElementById('terms-error');
    if (termsCheckbox && !termsCheckbox.checked) {
        if (termsError) termsError.style.display = 'block';
        termsCheckbox.focus();
        return false;
    }
    if (termsError) termsError.style.display = 'none';
    if (deliveryMode === 'delivery') {
        const addr = document.getElementById('cust-loc') ? document.getElementById('cust-loc').value.trim() : '';
        if (!addr) { alert("בבקשה הכנס כתובת למשלוח"); return false; }
        if (total < DELIVERY_MIN) {
            alert("מינימום הזמנה למשלוח: ₪" + DELIVERY_MIN + "\nסך ההזמנה שלך: ₪" + total.toFixed(2));
            return false;
        }
    }
    return true;
}

function buildWhatsAppMsg() {
    const { currentCart, name, phone, location, total } = getOrderDetails();
    let msg = "*הזמנה חדשה מאתר Up סטוק*\n--------------------------\n";
    msg += `👤 *שם:* ${name}\n📞 *טלפון:* ${phone}\n`;
    if (deliveryMode === 'delivery') {
        const addr = document.getElementById('cust-loc') ? document.getElementById('cust-loc').value.trim() : location;
        const deliveryCost = total >= DELIVERY_FREE ? 0 : DELIVERY_COST;
        msg += `🚚 *משלוח לכתובת:* ${addr}\n`;
        msg += deliveryCost === 0 ? `📦 *עלות משלוח:* חינם 🎉\n` : `📦 *עלות משלוח:* ₪${deliveryCost}\n`;
    } else {
        msg += `🏪 *איסוף עצמי מהחנות*\n`;
        const pickupLoc = document.getElementById('cust-loc-pickup') ? document.getElementById('cust-loc-pickup').value.trim() : '';
        if (pickupLoc) msg += `📍 *אזור:* ${pickupLoc}\n`;
    }
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
    const deliveryCost = (deliveryMode === 'delivery' && total < DELIVERY_FREE) ? DELIVERY_COST : 0;
    const grandTotal = total + deliveryCost;
    msg += `--------------------------\n💰 *סה"כ מוצרים: ₪${total.toFixed(2)}*`;
    if (deliveryCost > 0) msg += `\n🚚 *משלוח: ₪${deliveryCost}*`;
    msg += `\n💳 *סה"כ לתשלום: ₪${grandTotal.toFixed(2)}*`;
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
// ===================================================
// 🔤  מילון נרדפות לחיפוש
// ===================================================
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

function expandQuery(words) {
    // Return original words + synonyms as one flat array (deduped)
    const all = new Set(words);
    words.forEach(w => {
        const syns = SYNONYMS[w];
        if (syns) syns.forEach(s => all.add(s));
    });
    return Array.from(all);
}

function fix(s)         { return s.replace(/ך/g,'כ').replace(/ם/g,'מ').replace(/ן/g,'נ').replace(/ף/g,'פ').replace(/ץ/g,'צ'); }
function removePunct(s) { return s.replace(/['\-\.,"]/g, ''); }
function normSmichut(s) { return s.replace(/[תה](\s|$)/g, 'א$1').replace(/[תה]$/g, 'א'); }

function openCatMenu() {
    const m = document.getElementById('catMenu');
    if (m) m.classList.add('open');
}
function closeCatMenu() {
    const m = document.getElementById('catMenu');
    if (m) m.classList.remove('open');
}
function toggleCatMenu(e) {
    if (e) e.stopPropagation();
    const m = document.getElementById('catMenu');
    if (!m) return;
    m.classList.toggle('open');
}
function initSearchDropdown() {
    const input = document.getElementById('mainSearchInput');
    const menu = document.getElementById('catMenu');
    if (!input || !menu) return;
    const allItems = [...menu.querySelectorAll('.search-item')];
    input.addEventListener('focus', () => {
        allItems.forEach(i => i.style.display = 'flex');
        menu.classList.add('open');
    });
    input.addEventListener('input', () => {
        const q = input.value.trim();
        if (!q) {
            allItems.forEach(i => i.style.display = 'flex');
            menu.classList.add('open');
            return;
        }
        const ql = q.toLowerCase();
        let any = false;
        allItems.forEach(i => {
            const label = i.querySelector('.si-label').textContent.toLowerCase();
            const show = label.includes(ql);
            i.style.display = show ? 'flex' : 'none';
            if (show) any = true;
        });
        if (any) menu.classList.add('open'); else menu.classList.remove('open');
    });
    document.addEventListener('click', e => {
        if (!e.target.closest('.header-search')) menu.classList.remove('open');
    });
}
function filterByCategory(cat) {
    activeCategory = cat;

    // Highlight active button inside menu
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    const clickedBtn = event && event.target ? event.target : null;
    if (clickedBtn && clickedBtn.classList.contains('cat-btn')) clickedBtn.classList.add('active');

    // Update toggle button label
    const catLabel = document.getElementById('catLabel');
    if (catLabel) {
        if (!cat) {
            catLabel.textContent = 'קטגוריה ▾';
            catLabel.style.color = '#ed1c24';
        } else {
            const label = clickedBtn ? clickedBtn.textContent.trim() : cat;
            catLabel.textContent = label + ' ✕';
            catLabel.style.color = '#c0392b';
        }
    }

    // Trigger search with current input value
    const q = document.getElementById('mainSearchInput') ? document.getElementById('mainSearchInput').value : '';
    syncSearch(q);
    closeCatMenu();
}

// Map English category codes (from stock_new.csv) to Hebrew display names
const categoryCodeMap = {
    'hadpaami': 'חד פעמי',
    'cleaning': 'מוצרי נקיון וטיפוח',
    'birthday': 'יום הולדת ומתנות',
    'Food Appeal': 'Food Appeal',
    'general': 'כללי'
};

function getCategoryForProduct(p) {
    // Try barcode from image filename (categories.csv already has Hebrew names)
    if (p.image) {
        const barcode = p.image.replace('images/products/','').replace('.jpg','').replace('.jpeg','').trim();
        if (barcodeToCategory[barcode]) return barcodeToCategory[barcode];
    }
    // Fallback to stock_new.csv category — translate English codes to Hebrew
    const raw = p.category || '';
    return categoryCodeMap[raw] || raw;
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

function loadPromos() {
    fetch('stock_promos.csv?t=' + Date.now())
        .then(r => r.text())
        .then(text => {
            const lines = text.split('\n').filter(l => l.trim());
            lines.forEach((line, i) => {
                if (i === 0) return; // skip header
                // name,promo,image,qty,unit_price
                const parts = line.split(',');
                if (parts.length >= 4) {
                    allPromos.push({
                        name:       parts[0].trim(),
                        promo:      parts[1].trim(),
                        image:      parts[2].trim(),
                        units:      parseInt(parts[3].trim()) || 1,
                        unitPrice:  parseFloat(parts[4]) || 0
                    });
                }
            });
        }).catch(() => {});
}

function findPromoForProduct(name) {
    // Exact name match
    const exact = allPromos.find(p => p.name === name);
    if (exact) return exact;
    // Partial match (product name contains promo name or vice versa)
    const partial = allPromos.find(p =>
        name.includes(p.name) || p.name.includes(name)
    );
    return partial || null;
}

function syncSearch(val) {
    const overlay   = document.getElementById('search-overlay');
    const container = document.getElementById('search-results-container');
    const title     = document.getElementById('search-status-title');
    const qRaw      = val.toLowerCase().trim();
    if (!qRaw || qRaw.length < 2) { overlay.style.display = "none"; return; }
    overlay.style.display = "block";
    const qFixed     = fix(qRaw);
    const rawWords   = qFixed.split(' ').filter(w => w.length > 0);
    // Expand with synonyms — search for original words AND synonyms
    const queryWords = expandQuery(rawWords);

    // Build search terms - for short words (<=3 chars) require exact word match
    const queryTerms = rawWords.map(w => {
        const cleaned = removePunct(fix(w));
        const stemmed = removePunct(normSmichut(fix(w)));
        const isShort = cleaned.length <= 3;
        const stem = stemmed.length > 4 ? stemmed.substring(0, 4) : stemmed;
        return { original: cleaned, stem, isShort };
    });

    const filtered   = allProducts.filter(p => {
        // Category filter — מוצרי "כללי" מופיעים תמיד בכל קטגוריה
        if (activeCategory) {
            const pCat = getCategoryForProduct(p);
            if (pCat !== activeCategory && pCat !== 'כללי') return false;
        }
        const pName    = p.name.toLowerCase();
        const pFixed   = removePunct(fix(pName));
        const pStemmed = removePunct(normSmichut(fix(pName)));
        const pWords   = pFixed.split(/\s+/);
        const pStemWords = pStemmed.split(/\s+/);

        // Match function for a single term against product name
        const termMatch = ({ original, stem, isShort }) => {
            if (isShort) {
                // Short words: must match a whole word in the product name
                return pWords.some(pw => pw === original || pw.startsWith(original)) ||
                       pStemWords.some(pw => pw === stem || pw.startsWith(stem));
            }
            // Longer words: substring match is fine
            return pFixed.includes(original) || pStemmed.includes(stem);
        };

        // Also check if any synonym word appears in the product name
        const synonymMatch = (word) => {
            const syns = SYNONYMS[word] || [];
            return syns.some(s => {
                const sf = removePunct(fix(s));
                const ss = removePunct(normSmichut(fix(s)));
                if (sf.length <= 3) {
                    return pWords.some(pw => pw === sf || pw.startsWith(sf)) ||
                           pStemWords.some(pw => pw === ss || pw.startsWith(ss));
                }
                return pFixed.includes(sf) || pStemmed.includes(ss);
            });
        };

        const termOrSynMatch = (term) => termMatch(term) || synonymMatch(term.original);

        // Multi-word: allow 1 mismatch when 3+ words
        if (queryTerms.length > 1) {
            const matched = queryTerms.filter(termOrSynMatch).length;
            const required = queryTerms.length >= 3 ? queryTerms.length - 1 : queryTerms.length;
            return matched >= required;
        }

        // Single word: regular match
        return termOrSynMatch(queryTerms[0]);
    });

    // Sort: most matching terms first, exact matches on top
    filtered.sort((a, b) => {
        const score = p => {
            const pF = removePunct(fix(p.name.toLowerCase()));
            const pS = removePunct(normSmichut(fix(p.name.toLowerCase())));
            const pW = pF.split(/\s+/);
            const pSW = pS.split(/\s+/);
            let s = 0;
            queryTerms.forEach(t => {
                if (t.isShort) {
                    if (pW.some(pw => pw === t.original)) s += 3;
                    else if (pW.some(pw => pw.startsWith(t.original))) s += 2;
                } else {
                    if (pF.includes(t.original)) s += 2;
                    else if (pS.includes(t.stem)) s += 1;
                }
            });
            return s;
        };
        return score(b) - score(a);
    });
    if (filtered.length === 0) { title.innerText = "לא נמצאו תוצאות ל: " + qRaw; container.innerHTML = ""; return; }
    title.innerText = `נמצאו ${filtered.length} תוצאות עבור "${qRaw}":`;
    container.innerHTML = filtered.map(p => {
        const baseName   = p.image ? p.image.replace(/\.(jpg|jpeg)$/i, '') : '';
        const imgJpg     = baseName ? 'images/products/' + baseName + '.jpg'  : 'images/logo.jpg';
        const imgZeroJpg = baseName ? 'images/products/0' + baseName + '.jpg' : 'images/logo.jpg';
        const imgJpeg    = baseName ? 'images/products/' + baseName + '.jpeg' : 'images/logo.jpg';
        const safeName   = p.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const outOfStock = !p.stock;
        const hasVariants = !!getVariantKey(p.name);
        const addAction  = hasVariants
            ? `openVariantSelector('${safeName}','${p.price}')`
            : `addToCart('${safeName}','${p.price}')`;
        return `<div class="product-card" style="${outOfStock ? 'opacity:0.55; filter:grayscale(60%);' : ''}">
            ${outOfStock ? '<div style="position:absolute;top:0;right:0;left:0;background:#ed1c24;color:white;text-align:center;padding:6px;font-weight:bold;font-size:0.85em;border-radius:15px 15px 0 0;">❌ אזל המלאי</div>' : ''}
            <img src="${imgJpg}" onerror="this.onerror=function(){this.onerror=function(){this.onerror=null;this.src='images/logo.jpg'};this.src='${imgJpeg}'};this.src='${imgZeroJpg}'" onclick="openImg(this.src)" style="${outOfStock ? 'margin-top:32px;' : ''}">
            <h4>${p.name}</h4>
            <div style="color:var(--primary);font-weight:bold;font-size:1.2em;margin-bottom:10px;">₪${p.price}</div>
            <button class="add-btn" ${outOfStock ? 'disabled style="background:#bbb;"' : `onclick="${addAction}"`}>
                ${outOfStock ? 'אזל המלאי' : (hasVariants ? 'בחר מאפיינים ✦' : 'הוסף לסל +')}
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
        loadPromos();
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
        // Init product slider if exists on page
        const sliderEl = document.getElementById('productSlider');
        if (sliderEl) {
            const cat = sliderEl.getAttribute('data-category');
            if (cat) initProductSlider(cat);
        }
    } catch (e) { console.error("CSV Load Error", e); }
}

// ===================================================
// ♿  נגישות
// ===================================================
// ===== בחירת מאפיינים (וריאנטים) =====
function getVariantKey(name) {
    return Object.keys(VARIANT_PRODUCTS).find(k => name.includes(k)) || null;
}

function openVariantSelector(name, price) {
    const key = getVariantKey(name);
    if (!key) { addToCart(name, price); return; }
    const config = VARIANT_PRODUCTS[key];
    variantModalData = { name, price, selected: {} };
    document.getElementById('variant-modal-title').textContent = name;
    const container = document.getElementById('variant-options-container');
    container.innerHTML = config.options.map(opt => `
        <div class="variant-group">
            <div class="variant-group-label">${opt.label}:</div>
            <div class="variant-choices">
                ${opt.choices.map(c => `
                    <button class="variant-choice"
                        data-group="${opt.label}" data-value="${c}"
                        onclick="selectVariantChoice(this,'${opt.label}','${c}')">
                        ${c}
                    </button>`).join('')}
            </div>
        </div>`).join('');
    document.getElementById('variantModal').style.display = 'flex';
}

function selectVariantChoice(btn, group, value) {
    document.querySelectorAll(`.variant-choice[data-group="${group}"]`)
        .forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    variantModalData.selected[group] = value;
}

function confirmVariantAdd() {
    const { name, price } = variantModalData;
    const key = getVariantKey(name);
    const config = VARIANT_PRODUCTS[key];
    for (const opt of config.options) {
        if (!variantModalData.selected[opt.label]) {
            alert(`אנא בחר ${opt.label}`);
            return;
        }
    }
    const suffix = config.options.map(o => variantModalData.selected[o.label]).join(' | ');
    addToCart(`${name} — ${suffix}`, price);
    closeVariantModal();
}

function closeVariantModal() {
    document.getElementById('variantModal').style.display = 'none';
}

function accToggle(cls, btnId) {
    const active = document.body.classList.toggle('acc-' + cls);
    document.getElementById(btnId).classList.toggle('on', active);
    localStorage.setItem('acc_' + cls, active ? '1' : '');
}

function accReset() {
    ['big-text','contrast','no-anim','readable'].forEach(cls => {
        document.body.classList.remove('acc-' + cls);
        localStorage.removeItem('acc_' + cls);
    });
    document.querySelectorAll('.acc-opt').forEach(b => b.classList.remove('on'));
}

function accRestorePrefs() {
    const map = { 'big-text':'acc-big', 'contrast':'acc-contrast', 'no-anim':'acc-noanim', 'readable':'acc-readable' };
    Object.entries(map).forEach(([cls, btnId]) => {
        if (localStorage.getItem('acc_' + cls)) {
            document.body.classList.add('acc-' + cls);
            const btn = document.getElementById(btnId);
            if (btn) btn.classList.add('on');
        }
    });
}

// ===================================================
// 🎠  סליידר מוצרים
// ===================================================

// ===== הגדרת מוצרים ידנית לסליידר של כל מחלקה =====
// אם תרצה לבחור מוצרים ספציפיים שיופיעו בסליידר — הוסף ברקודים לרשימה המתאימה.
// אם הרשימה ריקה — יוצגו מוצרים אקראיים מהמלאי.
// דוגמה:  'חד פעמי': ['7290122150018', '0835811004554'],
const SLIDER_PRODUCTS = {
    'חד פעמי':              ['6923538238643','10','7','8','7102545380418','4','729120320314','0835811000419','0835811000758','0835811001515','835811002659','0835811004493','0835811005872'],
    'מוצרי נקיון וטיפוח':   ['7290000288024','7290000287492','7290000133904','729000542912','7290005427107','7290005430510','7290012117350','7290012117428'],
    'מוצרי אפיה ובישול':    ['7290102842360','7290001468692','7290010300518','7290011695712','7290013381699','7290020178909','7290019500155','7290011695729','0835811000396','0835811000730','0835811000853','0835811001119','0835811002246','0835811004257'],
    'יום הולדת ומתנות':     ['6923538224882','6923538227524','6923538229979','692353831804','692353823747','7290118877035','7290120669413','7290120669158'],
    'Food Appeal':           ['7290119834976','7290119835584','7290119834969','7290119832033','7290119838158','7290119838943','7290119838738','7290119841332','7290119835317','7290119836833','7290119838868','7290119832965','7290119833597','7290119839773','7290119842131','7290119840038'],
    'כללי':                  [],
};

function initProductSlider(categoryName) {
    const slider = document.getElementById('productSlider');
    const section = document.getElementById('productSliderSection');
    if (!slider) return;

    let products = [];
    const manualBarcodes = SLIDER_PRODUCTS[categoryName];

    if (manualBarcodes && manualBarcodes.length > 0) {
        // מוצרים שנבחרו ידנית על-ידי בעל החנות
        products = manualBarcodes.map(bc => {
            const key = String(bc).replace(/\.(jpg|jpeg)$/i, '');
            return allProducts.find(p => {
                if (!p.image) return false;
                const pKey = p.image.replace(/\.(jpg|jpeg)$/i, '');
                return pKey === key || pKey === '0' + key || '0' + pKey === key;
            });
        }).filter(Boolean);
    } else {
        // ברירת מחדל: מוצרים אקראיים מהמחלקה
        products = allProducts.filter(p => {
            const pCat = getCategoryForProduct(p);
            return (pCat === categoryName || pCat === 'כללי') && p.stock;
        });
        products = products.sort(() => Math.random() - 0.5).slice(0, 16);
    }

    if (products.length === 0) {
        if (section) section.style.display = 'none';
        return;
    }

    // כפילות תוכן — לגלילה אינסופית ללא עצירה (גם אם יש מעט מוצרים)
    const cardsHtml = products.map(p => {
        const baseName   = p.image ? p.image.replace(/\.(jpg|jpeg)$/i, '') : '';
        const imgJpg     = baseName ? 'images/products/' + baseName + '.jpg'  : 'images/logo.jpg';
        const imgZeroJpg = baseName ? 'images/products/0' + baseName + '.jpg' : 'images/logo.jpg';
        const imgJpeg    = baseName ? 'images/products/' + baseName + '.jpeg' : 'images/logo.jpg';
        const safeName   = p.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        return `<div class="product-card">
            <img src="${imgJpg}" onerror="this.onerror=function(){this.onerror=function(){this.onerror=null;this.src='images/logo.jpg'};this.src='${imgJpeg}'};this.src='${imgZeroJpg}'" onclick="openImg(this.src)">
            <h4>${p.name}</h4>
            <div style="color:var(--primary);font-weight:bold;font-size:1.2em;margin-bottom:10px;">₪${p.price}</div>
            <button class="add-btn" onclick="addToCart('${safeName}','${p.price}')">הוסף לסל +</button>
        </div>`;
    }).join('');
    // כפל התוכן + עטיפה ב-slider-inner
    // סט יחיד — JS מסובב כרטיסים (אין CSS animation, אין duplication, אין gap)
    slider.innerHTML = `<div class="slider-inner">${cardsHtml}</div>`;
    const inner = slider.querySelector('.slider-inner');

    requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!inner.isConnected) return;
        const firstCard = inner.querySelector('.product-card');
        if (!firstCard) return;

        // רוחב כרטיס + margin — זהה לכל הכרטיסים
        const cardW = Math.round(
            firstCard.getBoundingClientRect().width +
            parseFloat(getComputedStyle(firstCard).marginRight)
        );

        const SPEED = 60; // px/s
        const state = { offset: 0, lastTs: null };
        slider._anim = state;

        function tick(ts) {
            if (!inner.isConnected) return;
            if (state.lastTs === null) state.lastTs = ts;
            const dt = Math.min((ts - state.lastTs) / 1000, 0.05);
            state.lastTs = ts;

            if (!slider.matches(':hover')) {
                state.offset += SPEED * dt;
                if (state.offset >= cardW) {
                    state.offset -= cardW;
                    inner.appendChild(inner.firstElementChild); // כרטיס ראשון → סוף
                }
            }
            inner.style.transform = `translateX(-${state.offset}px)`;
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }));
}

function slideProducts(dir) {
    const s     = document.getElementById('productSlider');
    const inner = s && s.querySelector('.slider-inner');
    if (!inner) return;
    if (s._anim) s._anim.offset = 0;
    if (dir === 'next') {
        inner.appendChild(inner.firstElementChild);
    } else {
        inner.insertBefore(inner.lastElementChild, inner.firstElementChild);
    }
}

function injectSearchOverlay() {
    if (document.getElementById('search-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.style.cssText = 'display:none;position:fixed;top:72px;left:0;width:100%;height:calc(100% - 72px);background:white;z-index:1500;overflow-y:auto;padding:24px;box-sizing:border-box;';
    overlay.innerHTML = `
        <div style="max-width:1200px;margin:0 auto;">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #e5deff;padding-bottom:12px;margin-bottom:20px;">
                <h2 id="search-status-title" style="margin:0;font-size:1.2em;color:#1a0a2e;">תוצאות חיפוש</h2>
                <button onclick="closeSearch()" style="background:#7c3aed;color:white;border:none;padding:8px 18px;border-radius:50px;cursor:pointer;font-weight:bold;">סגור ✕</button>
            </div>
            <div class="products-grid" id="search-results-container"></div>
        </div>`;
    document.body.appendChild(overlay);
}

// ===================================================
// 🚀  אתחול
// ===================================================
document.addEventListener('DOMContentLoaded', function() {
    const hasCustomHeader = document.body.hasAttribute('data-custom-header');

    if (!hasCustomHeader) {
        injectCommonCSS();
        injectCommonHTML();
        initSearchDropdown();
        accRestorePrefs();
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
        document.querySelectorAll('header nav a').forEach(a => {
            const href = a.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                a.classList.add('nav-active');
            }
        });
    } else {
        // דף הבית החדש - רק טעינת מלאי וחיפוש
        injectSearchOverlay();
        loadInventory();
        initSearchDropdown();
    }
});
