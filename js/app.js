/**
 * PARADE VW SAFARI BOROBUDUR 2026 - OFFICIAL MERCHANDISE STORE
 * Core Application Logic & State Management
 */

// Configuration Constants
const PRODUCT_PRICE = 100000; // Rp100.000 per pcs
const ADMIN_PHONE = '6282138800401'; // Pinky (+62 821-3880-0401)
const ADMIN_NAME = 'PINKY';
const STORAGE_KEY = 'PVS_BOROBUDUR_ORDERS_V1';

// Available Sizes Definition
const SIZES_DATA = [
  { size: 'XS', length: 65, width: 46, desc: 'P 65 cm • L 46 cm', weight: '40 - 48 kg' },
  { size: 'S', length: 67, width: 48, desc: 'P 67 cm • L 48 cm', weight: '48 - 55 kg' },
  { size: 'M', length: 69, width: 50, desc: 'P 69 cm • L 50 cm', weight: '55 - 63 kg', isPopular: true },
  { size: 'L', length: 72, width: 52, desc: 'P 72 cm • L 52 cm', weight: '63 - 72 kg', isPopular: true },
  { size: 'XL', length: 75, width: 54, desc: 'P 75 cm • L 54 cm', weight: '72 - 82 kg', isPopular: true },
  { size: 'XXL', length: 77, width: 56, desc: 'P 77 cm • L 56 cm', weight: '82 - 92 kg' },
  { size: '3XL', length: 79, width: 58, desc: 'P 79 cm • L 58 cm', weight: '92 - 100 kg' },
  { size: '4XL', length: 81, width: 60, desc: 'P 81 cm • L 60 cm', weight: '100 - 110 kg' },
  { size: '5XL', length: 83, width: 63, desc: 'P 83 cm • L 63 cm', weight: '110 - 120 kg' },
  { size: '6XL', length: 84, width: 65, desc: 'P 84 cm • L 65 cm', weight: '120 - 130 kg' },
  { size: '7XL', length: 85, width: 68, desc: 'P 85 cm • L 68 cm', weight: '> 130 kg (Big Size)' }
];

// App State
let cartQuantities = {};
SIZES_DATA.forEach(item => {
  cartQuantities[item.size] = 0;
});

let currentOrderData = null;

// Helper: Format Rupiah Currency
function formatRupiah(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

// Helper: Generate Clean Order ID
function generateOrderId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `PVS-${year}${month}${day}-${randomNum}`;
}

// Helper: Format Date String
function getFormattedDate(dateObj = new Date()) {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
}

// DOM Elements Initialization
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    renderSizeMatrix();
    updateCalculationUI();
    initGalleryListeners();
    initSizeRecommender();
    initNavbarScroll();
    renderSavedOrdersList();

    // Image Zoom Lightbox Triggers
    const heroMainImg = document.getElementById('heroMainImg');
    if (heroMainImg) {
      heroMainImg.parentElement.addEventListener('click', () => {
        openLightbox(heroMainImg.src);
      });
    }
    const productMainImage = document.getElementById('productMainImage');
    if (productMainImage) {
      productMainImage.parentElement.addEventListener('click', () => {
        openLightbox(productMainImage.src);
      });
    }

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
      // Close on link click
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
      });
    }

    // Header Cart shortcut
    const headerCartBtn = document.getElementById('headerCartBtn');
    if (headerCartBtn) {
      headerCartBtn.addEventListener('click', () => {
        const orderSec = document.getElementById('order');
        if (orderSec) orderSec.scrollIntoView({ behavior: 'smooth' });
      });
    }
  });
}

// Render Size Matrix Rows
function renderSizeMatrix() {
  const container = document.getElementById('sizeMatrix');
  if (!container) return;

  container.innerHTML = SIZES_DATA.map(item => {
    const qty = cartQuantities[item.size] || 0;
    const hasQtyClass = qty > 0 ? 'has-qty' : '';
    const popularTag = item.isPopular ? '<span class="pop-tag">Favorit</span>' : '';

    return `
      <div class="size-item-row ${hasQtyClass}" id="sizeRow_${item.size}">
        <div class="size-info-side">
          <div class="matrix-size-tag">${item.size}</div>
          <div class="matrix-dim">
            <span class="dim-size-name">Size ${item.size} ${popularTag}</span>
            <span class="dim-measurement">${item.desc}</span>
          </div>
        </div>

        <div class="qty-stepper">
          <button type="button" class="stepper-btn" onclick="changeQty('${item.size}', -1)" aria-label="Kurangi Size ${item.size}">−</button>
          <input type="number" class="stepper-input" id="qtyInput_${item.size}" value="${qty}" min="0" max="999" onchange="setCustomQty('${item.size}', this.value)" readonly>
          <button type="button" class="stepper-btn" onclick="changeQty('${item.size}', 1)" aria-label="Tambah Size ${item.size}">+</button>
        </div>
      </div>
    `;
  }).join('');
}

// Modify Qty by Delta (+1, -1)
function changeQty(size, delta) {
  const current = cartQuantities[size] || 0;
  const newQty = Math.max(0, current + delta);
  cartQuantities[size] = newQty;
  updateSizeRowState(size, newQty);
  updateCalculationUI();
}

// Set Specific Qty
function setCustomQty(size, val) {
  let num = parseInt(val, 10);
  if (isNaN(num) || num < 0) num = 0;
  cartQuantities[size] = num;
  updateSizeRowState(size, num);
  updateCalculationUI();
}

// Quick Add Presets
function quickAdd(size) {
  changeQty(size, 1);
  showToast(`Berhasil menambah 1 pcs Size ${size}!`);
}

function addSingleSize(size) {
  changeQty(size, 1);
  showToast(`+1 Kaos Size ${size} ditambahkan ke keranjang.`);
  const orderSec = document.getElementById('order');
  if (orderSec) {
    orderSec.scrollIntoView({ behavior: 'smooth' });
  }
}

function resetAllQuantities() {
  SIZES_DATA.forEach(item => {
    cartQuantities[item.size] = 0;
    updateSizeRowState(item.size, 0);
  });
  updateCalculationUI();
  showToast('Jumlah pesanan di-reset ke 0.');
}

// Update Single Row Visual State
function updateSizeRowState(size, qty) {
  const input = document.getElementById(`qtyInput_${size}`);
  if (input) input.value = qty;

  const row = document.getElementById(`sizeRow_${size}`);
  if (row) {
    if (qty > 0) {
      row.classList.add('has-qty');
    } else {
      row.classList.remove('has-qty');
    }
  }
}

// Update Calculations Everywhere
function updateCalculationUI() {
  let totalQty = 0;
  const selectedList = [];

  SIZES_DATA.forEach(item => {
    const q = cartQuantities[item.size] || 0;
    if (q > 0) {
      totalQty += q;
      selectedList.push({
        size: item.size,
        qty: q,
        price: PRODUCT_PRICE,
        subtotal: q * PRODUCT_PRICE
      });
    }
  });

  const subtotalAmount = totalQty * PRODUCT_PRICE;

  // Update Live Matrix Bar
  const liveTotalQty = document.getElementById('liveTotalQty');
  const liveSubtotal = document.getElementById('liveSubtotal');
  if (liveTotalQty) liveTotalQty.innerText = `${totalQty} PCS`;
  if (liveSubtotal) liveSubtotal.innerText = formatRupiah(subtotalAmount);

  // Update Header / Mobile Badges
  const headerCartCount = document.getElementById('headerCartCount');
  const headerCartTotal = document.getElementById('headerCartTotal');
  if (headerCartCount) headerCartCount.innerText = totalQty;
  if (headerCartTotal) headerCartTotal.innerText = formatRupiah(subtotalAmount);

  // Update Native Mobile Bottom App Dock Cart Badge
  const dockCartBadge = document.getElementById('dockCartBadge');
  if (dockCartBadge) {
    dockCartBadge.innerText = totalQty;
    if (totalQty > 0) {
      dockCartBadge.classList.add('active');
    } else {
      dockCartBadge.classList.remove('active');
    }
  }

  // Update Mobile Floating Checkout Bar
  const floatingPrice = document.getElementById('floatingPrice');
  const floatingCount = document.getElementById('floatingCount');
  const mobileFloatingBar = document.getElementById('mobileFloatingBar');
  if (floatingPrice) floatingPrice.innerText = formatRupiah(subtotalAmount);
  if (floatingCount) floatingCount.innerText = `(${totalQty} Pcs Dipilih)`;
  if (mobileFloatingBar) {
    if (totalQty > 0) {
      mobileFloatingBar.classList.add('active');
    } else {
      mobileFloatingBar.classList.remove('active');
    }
  }

  // Update Sticky Right Summary Box
  const summaryTotalQty = document.getElementById('summaryTotalQty');
  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryGrandTotal = document.getElementById('summaryGrandTotal');
  const summaryItemsList = document.getElementById('summaryItemsList');

  if (summaryTotalQty) summaryTotalQty.innerText = `${totalQty} pcs`;
  if (summarySubtotal) summarySubtotal.innerText = formatRupiah(subtotalAmount);
  if (summaryGrandTotal) summaryGrandTotal.innerText = formatRupiah(subtotalAmount);

  if (summaryItemsList) {
    if (selectedList.length === 0) {
      summaryItemsList.innerHTML = `
        <div class="empty-cart-msg">
          <i class="fa-solid fa-shirt"></i>
          <p>Belum ada ukuran kaos yang dipilih.<br>Silakan tentukan jumlah pada kolom di sebelah kiri.</p>
        </div>
      `;
    } else {
      summaryItemsList.innerHTML = selectedList.map(item => `
        <div class="summary-item-row">
          <div class="summary-item-left">
            <span class="summary-item-badge">Size ${item.size}</span>
            <span>× ${item.qty} pcs</span>
          </div>
          <div class="summary-item-right font-mono">
            <strong>${formatRupiah(item.subtotal)}</strong>
          </div>
        </div>
      `).join('');
    }
  }
}

// Delivery Method Radio Switch
function handleDeliveryChange() {
  const isShip = document.getElementById('deliveryShip').checked;
  const addressGroup = document.getElementById('addressFieldGroup');
  const addressInput = document.getElementById('custAddress');
  const optionShip = document.getElementById('optionShipRadioCard');
  const optionPickup = document.getElementById('optionPickupRadioCard');
  const summaryShippingStatus = document.getElementById('summaryShippingStatus');

  if (isShip) {
    optionShip.classList.add('active');
    optionPickup.classList.remove('active');
    if (addressGroup) addressGroup.style.display = 'block';
    if (addressInput) addressInput.setAttribute('required', 'required');
    if (summaryShippingStatus) summaryShippingStatus.innerText = 'Exclude (Dihitung Admin)';
  } else {
    optionPickup.classList.add('active');
    optionShip.classList.remove('active');
    if (addressGroup) addressGroup.style.display = 'none';
    if (addressInput) addressInput.removeAttribute('required');
    if (summaryShippingStatus) summaryShippingStatus.innerText = 'Ambil Langsung di Venue';
  }
}

// Order Submission Process
function processOrderSubmission() {
  // 1. Check total quantity
  let totalQty = 0;
  const orderedSizes = [];

  SIZES_DATA.forEach(item => {
    const q = cartQuantities[item.size] || 0;
    if (q > 0) {
      totalQty += q;
      orderedSizes.push({
        size: item.size,
        qty: q,
        price: PRODUCT_PRICE,
        subtotal: q * PRODUCT_PRICE
      });
    }
  });

  if (totalQty === 0) {
    alert('Silakan pilih minimal 1 pcs kaos sesuai ukuran yang diinginkan terlebih dahulu.');
    const matrixSec = document.getElementById('sizeMatrix');
    if (matrixSec) matrixSec.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  // 2. Validate Customer Form Inputs
  const nameInput = document.getElementById('custName');
  const phoneInput = document.getElementById('custWhatsapp');
  const addressInput = document.getElementById('custAddress');
  const notesInput = document.getElementById('custNotes');
  const isShip = document.getElementById('deliveryShip').checked;

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const address = addressInput ? addressInput.value.trim() : '';
  const notes = notesInput ? notesInput.value.trim() : '';

  if (!name) {
    alert('Mohon isi Nama Lengkap pemesan.');
    if (nameInput) nameInput.focus();
    return;
  }

  if (!phone) {
    alert('Mohon isi Nomor WhatsApp pemesan.');
    if (phoneInput) phoneInput.focus();
    return;
  }

  if (isShip && !address) {
    alert('Mohon lengkapi Alamat Pengiriman.');
    if (addressInput) addressInput.focus();
    return;
  }

  // 3. Build Order Object
  const orderId = generateOrderId();
  const dateStr = getFormattedDate();

  currentOrderData = {
    orderId: orderId,
    date: dateStr,
    timestamp: new Date().toISOString(),
    customerName: name,
    customerPhone: phone,
    deliveryMethod: isShip ? 'DIKIRIM (Kurir/Ekspedisi)' : 'AMBIL LANGSUNG (Venue Event Borobudur)',
    isShip: isShip,
    address: isShip ? address : 'Ambil langsung di lokasi acara Parade VW Safari Borobudur 2026',
    notes: notes || '-',
    items: orderedSizes,
    totalQty: totalQty,
    totalPrice: totalQty * PRODUCT_PRICE
  };

  // 4. Save to Local Storage
  saveOrderToStorage(currentOrderData);

  // 5. Open Invoice Modal
  displayInvoiceModal(currentOrderData);
}

function handleFormSubmit(e) {
  e.preventDefault();
  processOrderSubmission();
}

// Display Invoice Modal with Generated Data
function displayInvoiceModal(order) {
  const modal = document.getElementById('invoiceModal');
  if (!modal) return;

  document.getElementById('invOrderId').innerText = order.orderId;
  document.getElementById('invDate').innerText = order.date;
  document.getElementById('invCustomerName').innerText = order.customerName;
  document.getElementById('invCustomerPhone').innerText = order.customerPhone;
  document.getElementById('invDeliveryMethod').innerText = order.deliveryMethod;
  document.getElementById('invAddress').innerText = order.address;
  document.getElementById('invNotes').innerText = order.notes;

  // Hide or show address row based on delivery
  const addressRow = document.getElementById('invAddressRow');
  if (addressRow) {
    addressRow.style.display = (order.isShip && order.address && order.address.trim() !== '-') ? 'block' : 'none';
  }

  // Hide or show notes row based on content
  const notesRow = document.getElementById('invNotesRow');
  if (notesRow) {
    notesRow.style.display = (order.notes && order.notes.trim() !== '-' && order.notes.trim() !== '') ? 'block' : 'none';
  }

  // Table items
  const tableBody = document.getElementById('invItemsTableBody');
  if (tableBody) {
    tableBody.innerHTML = order.items.map(item => `
      <tr>
        <td><strong>Size ${item.size}</strong></td>
        <td>${formatRupiah(item.price)}</td>
        <td class="text-center font-mono">${item.qty} pcs</td>
        <td class="text-right font-mono"><strong>${formatRupiah(item.subtotal)}</strong></td>
      </tr>
    `).join('');
  }

  document.getElementById('invTotalPieces').innerText = `${order.totalQty} Pcs`;
  document.getElementById('invSubtotalAmount').innerText = formatRupiah(order.totalPrice);
  document.getElementById('invShippingText').innerText = order.isShip ? 'Exclude (Dihitung Admin via WA)' : 'Gratis (Ambil di Lokasi)';
  document.getElementById('invGrandTotal').innerText = formatRupiah(order.totalPrice);

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeInvoiceModal() {
  const modal = document.getElementById('invoiceModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// WhatsApp Direct Integration - Clean, Elegant & Device-Safe Formatting
function generateWhatsAppMessage(order) {
  const dividerThick = '──────────────────────────────';
  const dividerThin  = '------------------------------';
  
  // Format items with subtotal per size
  const itemsText = order.items.map(it => {
    return `• Size ${it.size.padEnd(3, ' ')}: ${it.qty} pcs (${formatRupiah(it.subtotal)})`;
  }).join('\n');

  const subtotalFormatted = formatRupiah(order.totalPrice);
  const deliveryLabel = order.isShip ? 'Dikirim Kurir / Ekspedisi' : 'Ambil Langsung di Lokasi Event Borobudur';
  const shippingCostLabel = order.isShip ? 'Exclude (Dikonfirmasi Admin)' : 'Gratis (Ambil di Venue)';
  const totalLabel = order.isShip ? 'TOTAL ESTIMASI' : 'TOTAL BAYAR';

  let msg = `🏁 *PARADE VW SAFARI BOROBUDUR 2026*\n`;
  msg += `*OFFICIAL MERCHANDISE STORE*\n`;
  msg += `${dividerThick}\n\n`;

  msg += `📋 *DATA PESANAN*\n`;
  msg += `• *No. Order :* ${order.orderId}\n`;
  msg += `• *Tanggal   :* ${order.date}\n\n`;

  msg += `👤 *DATA PEMESAN*\n`;
  msg += `• *Nama      :* ${order.customerName}\n`;
  msg += `• *WhatsApp  :* ${order.customerPhone}\n`;
  msg += `• *Pengambilan:* ${deliveryLabel}\n`;

  if (order.isShip && order.address && order.address.trim() !== '-') {
    msg += `• *Alamat    :* ${order.address.trim()}\n`;
  }

  if (order.notes && order.notes.trim() !== '-' && order.notes.trim() !== '') {
    msg += `• *Catatan   :* ${order.notes.trim()}\n`;
  }
  msg += `\n`;

  msg += `👕 *RINCIAN KAOS RESMI*\n`;
  msg += `${itemsText}\n`;
  msg += `${dividerThin}\n`;
  msg += `• *Total Kaos :* ${order.totalQty} pcs\n`;
  msg += `• *Harga      :* Rp 100.000 / pcs\n`;
  msg += `• *Subtotal   :* ${subtotalFormatted}\n`;
  msg += `• *OngkosKirim:* ${shippingCostLabel}\n\n`;

  msg += `💵 *${totalLabel} : ${subtotalFormatted}*\n`;
  msg += `${dividerThick}\n\n`;

  if (order.isShip) {
    msg += `Halo Admin Pinky, saya telah memesan kaos resmi Parade VW Safari Borobudur 2026. Mohon informasi total ongkos kirim ke alamat saya beserta nomor rekening pembayarannya.\n\n`;
  } else {
    msg += `Halo Admin Pinky, saya telah memesan kaos resmi Parade VW Safari Borobudur 2026 untuk diambil langsung di venue. Mohon informasi nomor rekening dan instruksi pembayarannya.\n\n`;
  }

  msg += `Terima kasih! 🙏\n`;
  msg += `*PARADE VW SAFARI BOROBUDUR 2026*\n`;
  msg += `_Official Licensed Merchandise_`;

  return msg;
}

function sendToWhatsAppAdmin() {
  if (!currentOrderData) return;
  const text = generateWhatsAppMessage(currentOrderData);
  const encodedText = encodeURIComponent(text);
  const waUrl = `https://api.whatsapp.com/send?phone=${ADMIN_PHONE}&text=${encodedText}`;
  window.open(waUrl, '_blank');
}

function copyOrderDetails() {
  if (!currentOrderData) return;
  const text = generateWhatsAppMessage(currentOrderData);
  navigator.clipboard.writeText(text).then(() => {
    showToast('Format pesanan berhasil disalin ke clipboard!');
  }).catch(() => {
    showToast('Berhasil disalin.');
  });
}

// Lightbox Fullscreen Preview Functions
function openLightbox(imgSrc) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  if (modal && img && imgSrc) {
    img.src = imgSrc;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// High-Resolution Professional Printable Invoice Generator (Isolated 1-Page A4)
function printInvoice() {
  if (!currentOrderData) return;
  const order = currentOrderData;

  const rowsHtml = order.items.map((it, idx) => `
    <tr>
      <td style="text-align: center; padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${idx + 1}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
        <strong>Kaos Resmi Parade VW Safari Borobudur 2026</strong><br>
        <span style="font-size: 11px; color: #64748b;">100% Cotton Combed 24s • Sablon High-Plastisol</span>
      </td>
      <td style="text-align: center; padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #b45309;">Size ${it.size}</td>
      <td style="text-align: right; padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${formatRupiah(it.price)}</td>
      <td style="text-align: center; padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold;">${it.qty} pcs</td>
      <td style="text-align: right; padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: bold; color: #0f172a;">${formatRupiah(it.subtotal)}</td>
    </tr>
  `).join('');

  const shippingText = order.isShip 
    ? 'Exclude / Belum Termasuk (Dikonfirmasi Admin via WA)' 
    : 'Bebas Ongkir (Ambil Langsung di Lokasi Event)';

  const addressRow = order.isShip ? `
    <tr>
      <td style="padding: 4px 0; color: #64748b; font-size: 12px; width: 140px; vertical-align: top;">Alamat Pengiriman:</td>
      <td style="padding: 4px 0; color: #0f172a; font-size: 12px; font-weight: 600;">${order.address}</td>
    </tr>
  ` : '';

  const notesRow = (order.notes && order.notes.trim() !== '-' && order.notes.trim() !== '') ? `
    <tr>
      <td style="padding: 4px 0; color: #64748b; font-size: 12px; width: 140px; vertical-align: top;">Catatan Pemesan:</td>
      <td style="padding: 4px 0; color: #0f172a; font-size: 12px; font-style: italic;">${order.notes}</td>
    </tr>
  ` : '';

  const printWindow = window.open('', '_blank', 'width=850,height=1000');
  if (!printWindow) {
    alert('Harap izinkan popup browser untuk mencetak / download invoice.');
    return;
  }

  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Invoice #${order.orderId} - Parade VW Safari Borobudur 2026</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 15mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          background: #ffffff;
          color: #1e293b;
          font-size: 13px;
          line-height: 1.5;
          padding: 10px;
        }
        .invoice-wrapper {
          max-width: 780px;
          margin: 0 auto;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 26px 30px;
          position: relative;
        }
        .invoice-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 18px;
          border-bottom: 2px solid #cbd5e1;
          margin-bottom: 20px;
        }
        .header-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .logo-img {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          border: 2px solid #d97706;
          object-fit: cover;
        }
        .event-title {
          font-size: 18px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: 0.05em;
          line-height: 1.1;
        }
        .event-sub {
          font-size: 11px;
          font-weight: 700;
          color: #b45309;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 3px;
        }
        .event-location {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }
        .header-invoice-title {
          text-align: right;
        }
        .doc-title {
          font-size: 22px;
          font-weight: 900;
          color: #d90429;
          letter-spacing: 0.05em;
        }
        .doc-badge {
          display: inline-block;
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
          font-size: 11px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
          margin-top: 4px;
        }
        
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 22px;
        }
        .meta-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px 16px;
        }
        .meta-card-title {
          font-size: 11px;
          font-weight: 800;
          color: #b45309;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 6px;
          margin-bottom: 8px;
        }
        .meta-table {
          width: 100%;
        }
        .status-pill {
          display: inline-block;
          background: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
          padding: 1px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .items-table th {
          background: #0f172a;
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 10px 8px;
          text-align: left;
        }
        
        .calc-summary-section {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 20px;
          margin-bottom: 22px;
          align-items: start;
        }
        .instructions-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 11.5px;
          color: #166534;
        }
        .instructions-box strong {
          display: block;
          font-size: 12px;
          margin-bottom: 4px;
          color: #14532d;
        }
        .instructions-box ul {
          margin-left: 16px;
          margin-top: 4px;
        }
        .instructions-box li {
          margin-bottom: 2px;
        }
        
        .calc-table-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
        }
        .calc-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 12.5px;
          color: #475569;
        }
        .calc-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          margin-top: 8px;
          border-top: 2px solid #cbd5e1;
          font-size: 14px;
          font-weight: 900;
          color: #0f172a;
        }
        .calc-total-amount {
          font-size: 18px;
          color: #d90429;
          font-weight: 900;
        }

        .invoice-footer {
          border-top: 1px dashed #cbd5e1;
          padding-top: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          color: #64748b;
        }
        .footer-stamp {
          border: 2px dashed #d97706;
          color: #b45309;
          padding: 4px 12px;
          border-radius: 6px;
          font-weight: 800;
          font-size: 10.5px;
          letter-spacing: 0.08em;
          text-align: center;
        }
        
        @media print {
          body {
            padding: 0;
          }
          .invoice-wrapper {
            border: none;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-wrapper">
        <!-- Header -->
        <div class="invoice-header">
          <div class="header-brand">
            <img src="${window.location.origin}/assets/logo_official.jpg" alt="Logo" class="logo-img" onerror="this.src='assets/logo_official.jpg'">
            <div>
              <div class="event-title">PARADE VW SAFARI BOROBUDUR 2026</div>
              <div class="event-sub">Official Merchandise Order Receipt</div>
              <div class="event-location">Kawasan Candi Borobudur, Magelang, Jawa Tengah</div>
            </div>
          </div>
          <div class="header-invoice-title">
            <div class="doc-title">INVOICE</div>
            <div class="doc-badge">ORDER #${order.orderId}</div>
          </div>
        </div>

        <!-- Meta Info -->
        <div class="meta-grid">
          <div class="meta-card">
            <div class="meta-card-title">Informasi Pesanan</div>
            <table class="meta-table">
              <tr>
                <td style="padding: 3px 0; color: #64748b; font-size: 12px; width: 110px;">No. Order:</td>
                <td style="padding: 3px 0; color: #0f172a; font-size: 12px; font-weight: 800;">${order.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 3px 0; color: #64748b; font-size: 12px;">Tanggal:</td>
                <td style="padding: 3px 0; color: #0f172a; font-size: 12px; font-weight: 600;">${order.date}</td>
              </tr>
              <tr>
                <td style="padding: 3px 0; color: #64748b; font-size: 12px;">Status:</td>
                <td style="padding: 3px 0;"><span class="status-pill">⏳ MENUNGGU KONFIRMASI WA</span></td>
              </tr>
              <tr>
                <td style="padding: 3px 0; color: #64748b; font-size: 12px;">Admin Official:</td>
                <td style="padding: 3px 0; color: #0f172a; font-size: 12px; font-weight: 700;">+62 821-3880-0401 (PINKY)</td>
              </tr>
            </table>
          </div>

          <div class="meta-card">
            <div class="meta-card-title">Data Pemesan & Pengiriman</div>
            <table class="meta-table">
              <tr>
                <td style="padding: 3px 0; color: #64748b; font-size: 12px; width: 120px;">Nama Pemesan:</td>
                <td style="padding: 3px 0; color: #0f172a; font-size: 12px; font-weight: 800;">${order.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 3px 0; color: #64748b; font-size: 12px;">No. WhatsApp:</td>
                <td style="padding: 3px 0; color: #0f172a; font-size: 12px; font-weight: 700;">${order.customerPhone}</td>
              </tr>
              <tr>
                <td style="padding: 3px 0; color: #64748b; font-size: 12px;">Pengambilan:</td>
                <td style="padding: 3px 0; color: #b45309; font-size: 12px; font-weight: 700;">${order.deliveryMethod}</td>
              </tr>
              ${addressRow}
              ${notesRow}
            </table>
          </div>
        </div>

        <!-- Table Items -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">No</th>
              <th>Deskripsi Produk</th>
              <th style="width: 80px; text-align: center;">Ukuran</th>
              <th style="width: 120px; text-align: right;">Harga Satuan</th>
              <th style="width: 70px; text-align: center;">Qty</th>
              <th style="width: 130px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <!-- Summary & Instructions -->
        <div class="calc-summary-section">
          <div class="instructions-box">
            <strong>Petunjuk Pembayaran & Konfirmasi:</strong>
            <ul>
              <li>1. Kirimkan invoice ini atau konfirmasi via WhatsApp ke <strong>+62 821-3880-0401 (PINKY)</strong>.</li>
              <li>2. Admin akan mengonfirmasi ketersediaan stok & memberikan nomor rekening resmi.</li>
              <li>3. Pembayaran dapat melalui transfer Bank (BCA / Mandiri / BRI) atau QRIS.</li>
              <li>4. Simpan bukti transfer untuk verifikasi saat pengambilan / pengiriman.</li>
            </ul>
          </div>

          <div class="calc-table-box">
            <div class="calc-row">
              <span>Total Kaos:</span>
              <strong style="color: #0f172a;">${order.totalQty} pcs</strong>
            </div>
            <div class="calc-row">
              <span>Subtotal Harga:</span>
              <span style="font-weight: 700; color: #0f172a;">${formatRupiah(order.totalPrice)}</span>
            </div>
            <div class="calc-row">
              <span>Ongkos Kirim:</span>
              <span style="font-size: 11px; font-weight: 700; color: #b45309;">${order.isShip ? 'Exclude (Dihitung Admin)' : 'Gratis (Ambil di Venue)'}</span>
            </div>
            <div class="calc-total-row">
              <span>TOTAL PEMBAYARAN:</span>
              <span class="calc-total-amount">${formatRupiah(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="invoice-footer">
          <div>
            <strong>Parade VW Safari Borobudur 2026</strong> • Official Licensed Merchandise<br>
            <em>“Ride Classic. Celebrate Culture.”</em>
          </div>
          <div class="footer-stamp">
            OFFICIAL VERIFIED MERCHANDISE
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
}

// Local Storage Management
function saveOrderToStorage(order) {
  try {
    let list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    list.unshift(order);
    // Keep last 15 orders
    list = list.slice(0, 15);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    renderSavedOrdersList();
  } catch (e) {
    console.error('Storage error', e);
  }
}

function renderSavedOrdersList() {
  const container = document.getElementById('savedChipsContainer');
  if (!container) return;

  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (list.length === 0) {
      container.innerHTML = '<span class="empty-chip">Belum ada riwayat pesanan lokal.</span>';
      return;
    }

    container.innerHTML = list.map(ord => `
      <div class="order-chip" onclick="loadSavedOrder('${ord.orderId}')">
        <i class="fa-solid fa-receipt"></i> ${ord.orderId} (${ord.customerName} - ${ord.totalQty} pcs)
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '';
  }
}

function loadSavedOrder(orderId) {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const found = list.find(o => o.orderId === orderId);
    if (found) {
      currentOrderData = found;
      displayInvoiceModal(found);
    }
  } catch (e) {}
}

// Order Lookup Function
function lookupOrder() {
  const input = document.getElementById('lookupOrderIdInput');
  const resultBox = document.getElementById('lookupResultBox');
  if (!input || !resultBox) return;

  const query = input.value.trim().toLowerCase();
  if (!query) {
    alert('Masukkan Nomor Order (Contoh: PVS-...) atau Nomor WhatsApp Anda.');
    input.focus();
    return;
  }

  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const matches = list.filter(o => 
      o.orderId.toLowerCase().includes(query) || 
      o.customerPhone.includes(query) ||
      o.customerName.toLowerCase().includes(query)
    );

    resultBox.classList.remove('d-none');

    if (matches.length === 0) {
      resultBox.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 10px;">
          <i class="fa-solid fa-circle-exclamation text-gold" style="font-size: 1.8rem; margin-bottom: 8px;"></i>
          <p>Pesanan dengan kata kunci "<strong>${input.value}</strong>" tidak ditemukan di perangkat ini.</p>
          <small>Jika Anda memesan dari perangkat lain, silakan hubungi langsung WhatsApp Admin Pinky (+62 821-3880-0401).</small>
        </div>
      `;
    } else {
      resultBox.innerHTML = `
        <h4 style="color: var(--gold-light); margin-bottom: 12px; font-size: 0.95rem;">
          <i class="fa-solid fa-check text-gold"></i> Ditemukan ${matches.length} Pesanan:
        </h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${matches.map(m => `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #fff; display: block;">${m.orderId}</strong>
                <small style="color: var(--text-muted);">${m.date} • ${m.customerName} • ${m.totalQty} Pcs (${formatRupiah(m.totalPrice)})</small>
              </div>
              <button class="btn-gold-sm" onclick="loadSavedOrder('${m.orderId}')">Buka Invoice</button>
            </div>
          `).join('')}
        </div>
      `;
    }
  } catch (e) {
    console.error(e);
  }
}

// Size Recommender Calculator
function initSizeRecommender() {
  const heightInp = document.getElementById('heightInput');
  const weightInp = document.getElementById('weightInput');
  const display = document.getElementById('recSizeDisplay');
  const notes = document.getElementById('recNotes');
  const btnApply = document.getElementById('btnApplyRecSize');

  function calculateSize() {
    const h = parseFloat(heightInp.value) || 170;
    const w = parseFloat(weightInp.value) || 65;

    let recommended = 'L';
    let explanation = 'Ukuran paling pas dan nyaman untuk postur standar.';

    // Logic based on weight thresholds & height
    if (w < 48) {
      recommended = 'XS';
      explanation = 'Sangat pas untuk postur ramping / remaja.';
    } else if (w < 55) {
      recommended = 'S';
      explanation = 'Pas untuk postur ramping dengan kenyamanan optimal.';
    } else if (w <= 63) {
      recommended = 'M';
      explanation = 'Ukuran populer paling pas untuk tubuh proporsional.';
    } else if (w <= 72) {
      recommended = 'L';
      explanation = 'Sangat nyaman dan leluasa untuk aktivitas harian & parade.';
    } else if (w <= 82) {
      recommended = 'XL';
      explanation = 'Ideal untuk postur berisi / tegap.';
    } else if (w <= 92) {
      recommended = 'XXL';
      explanation = 'Potongan ekstra leluasa untuk kenyamanan maksimal.';
    } else if (w <= 100) {
      recommended = '3XL';
      explanation = 'Ukuran big size untuk postur besar.';
    } else if (w <= 110) {
      recommended = '4XL';
      explanation = 'Ukuran big size leluasa.';
    } else if (w <= 120) {
      recommended = '5XL';
      explanation = 'Big size ekstra lebar.';
    } else if (w <= 130) {
      recommended = '6XL';
      explanation = 'Super big size lebar 65 cm.';
    } else {
      recommended = '7XL';
      explanation = 'Ukuran maksimal lebar 68 cm (Super Jumbo).';
    }

    if (display) display.innerText = `${recommended}`;
    if (notes) notes.innerText = explanation;

    if (btnApply) {
      btnApply.onclick = () => {
        addSingleSize(recommended);
      };
    }
  }

  if (heightInp && weightInp) {
    heightInp.addEventListener('input', calculateSize);
    weightInp.addEventListener('input', calculateSize);
    calculateSize();
  }
}

// Gallery & Lightbox Handlers
function initGalleryListeners() {
  // Hero Thumbnails
  const heroThumbs = document.querySelectorAll('#heroThumbnails .thumbnail');
  const heroMainImg = document.getElementById('heroMainImg');
  heroThumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      heroThumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const src = thumb.getAttribute('data-src');
      if (heroMainImg && src) {
        heroMainImg.src = src;
      }
    });
  });

  // Product Section Thumbnails
  const productThumbs = document.querySelectorAll('#productThumbsRow .thumb-btn');
  const productMainImage = document.getElementById('productMainImage');
  productThumbs.forEach(btn => {
    btn.addEventListener('click', () => {
      productThumbs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const src = btn.getAttribute('data-src');
      if (productMainImage && src) {
        productMainImage.src = src;
      }
    });
  });

  // Lightbox Zoom
  const zoomIndicator = document.querySelector('.main-image-container');
  if (zoomIndicator) {
    zoomIndicator.addEventListener('click', () => {
      const src = heroMainImg ? heroMainImg.src : 'assets/tshirt_1.jpg';
      openLightbox(src);
    });
  }

  if (productMainImage) {
    productMainImage.addEventListener('click', () => {
      openLightbox(productMainImage.src);
    });
  }
}

// FAQ Accordion Toggle
function toggleFaq(btn) {
  const item = btn.parentElement;
  const answer = item.querySelector('.faq-answer');
  const isActive = item.classList.contains('active');

  // Close other FAQs
  document.querySelectorAll('.faq-item').forEach(el => {
    el.classList.remove('active');
    const ans = el.querySelector('.faq-answer');
    if (ans) ans.style.maxHeight = null;
  });

  if (!isActive && answer) {
    item.classList.add('active');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}

// Navbar Scroll Effect
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// Toast Notification Display
function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMsg');
  if (!toast || !msgEl) return;

  msgEl.innerText = message;
  toast.classList.add('active');

  setTimeout(() => {
    toast.classList.remove('active');
  }, 3200);
}
