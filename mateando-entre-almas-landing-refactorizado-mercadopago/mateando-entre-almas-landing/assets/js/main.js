document.addEventListener("DOMContentLoaded", () => {
  const cover = document.getElementById("bookCover");
  if (cover) cover.src = STORE_CONFIG.BOOK_IMAGE_URL;

  document.getElementById("buyHeroBtn")?.addEventListener("click", openPaymentPopup);
  document.getElementById("buyFloatBtn")?.addEventListener("click", openPaymentPopup);
});

function money(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(value);
}

function getTotals(method) {
  const book = STORE_CONFIG.BOOK_PRICE;
  const shipping = STORE_CONFIG.SHIPPING_PRICE;
  const mpFee = method === "mercadopago"
    ? Math.round(book * STORE_CONFIG.MERCADOPAGO_PERCENT / 100)
    : 0;

  return {
    book,
    shipping,
    mpFee,
    total: book + shipping + mpFee
  };
}

function openPaymentPopup() {
  const transferTotals = getTotals("transferencia");
  const mpTotals = getTotals("mercadopago");

  Swal.fire({
    title: "Elegí cómo comprar",
    html: `
      <div style="display:grid; gap:12px; text-align:left;">
        <button class="swal2-confirm swal2-styled" onclick="goCheckout('transferencia')" style="width:100%; margin:0;">
          Transferencia · ${money(transferTotals.total)}
        </button>
        <button class="swal2-confirm swal2-styled" onclick="goCheckout('mercadopago')" style="width:100%; margin:0; background:#00b1ea; color:#08233f;">
          <strong style="display:inline-flex;align-items:center;gap:8px;">
            <span style="display:inline-grid;place-items:center;width:28px;height:28px;border-radius:8px;background:#8ee6ff;font-weight:1000;">MP</span>
            MercadoPago +15% · ${money(mpTotals.total)}
          </strong>
        </button>
        <small>El envío por Correo Argentino es de ${money(STORE_CONFIG.SHIPPING_PRICE)} a todo el país.</small>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true
  });
}

function goCheckout(method) {
  window.location.href = `checkout.html?method=${encodeURIComponent(method)}`;
}
