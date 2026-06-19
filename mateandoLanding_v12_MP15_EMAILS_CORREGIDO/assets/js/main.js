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
  const subtotal = book + shipping;

  // IMPORTANTE: la comisión de MercadoPago se aplica sobre el subtotal completo
  // (libro + envío), no solo sobre el valor del libro.
  const mpFee = method === "mercadopago"
    ? Math.round(subtotal * STORE_CONFIG.MERCADOPAGO_PERCENT / 100)
    : 0;

  return { book, shipping, subtotal, mpFee, total: subtotal + mpFee };
}

function openPaymentPopup() {
  const transferTotals = getTotals("transferencia");
  const mpTotals = getTotals("mercadopago");

  Swal.fire({
    title: "Elegí cómo comprar",
    html: `
      <div class="payment-choice">
        <button class="payment-option" id="transferPaymentBtn" type="button">
          <span class="payment-icon transfer-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 10.5L12 4l9 6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M5 10h14v9H5v-9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <path d="M8 13h2M14 13h2M8 16h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </span>
          <span>
            <strong>Transferencia</strong>
            <small>${money(transferTotals.total)}</small>
          </span>
        </button>

        <button class="payment-option mp-option" id="mpPaymentBtn" type="button">
          <span class="payment-icon mp-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4.2 10.4c1.9-3.1 5.2-4.8 7.8-4.8s5.9 1.7 7.8 4.8c.7 1.1.5 2.5-.5 3.4-2 1.8-4.6 2.8-7.3 2.8s-5.3-1-7.3-2.8c-1-.9-1.2-2.3-.5-3.4Z" fill="currentColor" opacity=".24"/>
              <path d="M7.2 12.1c1.2 1.1 2.8 1.7 4.8 1.7s3.6-.6 4.8-1.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M8.3 10.8c.8-.7 1.7-1 2.7-.4l1 .6 1-.6c1-.6 1.9-.3 2.7.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 19.8c5.2 0 9.4-3.5 9.4-7.8S17.2 4.2 12 4.2 2.6 7.7 2.6 12s4.2 7.8 9.4 7.8Z" stroke="currentColor" stroke-width="1.8"/>
            </svg>
          </span>
          <span>
            <strong>MercadoPago +15%</strong>
            <small>${money(mpTotals.total)}</small>
          </span>
        </button>

        <small class="payment-note">
          El envío por Correo Argentino es de ${money(STORE_CONFIG.SHIPPING_PRICE)} a todo el país.
        </small>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true,
    didOpen: () => {
      document.getElementById("transferPaymentBtn")?.addEventListener("click", () => {
        window.location.href = "checkout.html?method=transferencia";
      });

      document.getElementById("mpPaymentBtn")?.addEventListener("click", () => {
        openMercadoPagoExternalFlow();
      });
    }
  });
}

function openMercadoPagoExternalFlow() {
  const seconds = Number(STORE_CONFIG.MERCADOPAGO_WAIT_SECONDS || 60);
  let remaining = seconds;
  let intervalId = null;

  Swal.fire({
    title: "Pago con MercadoPago",
    html: `
      <div class="mp-popup">
        <div class="mp-popup-header">
          <div class="mp-popup-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4.2 10.4c1.9-3.1 5.2-4.8 7.8-4.8s5.9 1.7 7.8 4.8c.7 1.1.5 2.5-.5 3.4-2 1.8-4.6 2.8-7.3 2.8s-5.3-1-7.3-2.8c-1-.9-1.2-2.3-.5-3.4Z" fill="currentColor" opacity=".24"/>
              <path d="M7.2 12.1c1.2 1.1 2.8 1.7 4.8 1.7s3.6-.6 4.8-1.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M8.3 10.8c.8-.7 1.7-1 2.7-.4l1 .6 1-.6c1-.6 1.9-.3 2.7.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 19.8c5.2 0 9.4-3.5 9.4-7.8S17.2 4.2 12 4.2 2.6 7.7 2.6 12s4.2 7.8 9.4 7.8Z" stroke="currentColor" stroke-width="1.8"/>
            </svg>
          </div>
          <div>
            <strong>MercadoPago se abrirá en una nueva pestaña</strong>
            <p>Esta ventana volverá al formulario en <b id="mpCountdown">${remaining}</b> segundos.</p>
          </div>
        </div>

        <div class="mp-instructions">
          <p><strong>Paso 1:</strong> pagá o generá el cupón en MercadoPago.</p>
          <p><strong>Paso 2:</strong> volvé a esta pestaña.</p>
          <p><strong>Paso 3:</strong> completá tus datos de envío para enviar el pedido.</p>
        </div>

        <a class="mp-open-link" href="${STORE_CONFIG.MERCADOPAGO_CHECKOUT_URL}" target="_blank" rel="noopener" id="mpOpenLink">
          Abrir MercadoPago ahora
        </a>

        <button class="mp-return-btn" id="mpReturnBtn" type="button">
          Continuar al formulario de pedido
        </button>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true,
    width: "min(94vw, 720px)",
    padding: "18px",
    didOpen: () => {
      document.getElementById("mpReturnBtn")?.addEventListener("click", redirectToMercadoPagoForm);

      setTimeout(() => {
        window.open(STORE_CONFIG.MERCADOPAGO_CHECKOUT_URL, "_blank", "noopener");
      }, 250);

      intervalId = setInterval(() => {
        remaining -= 1;

        const counter = document.getElementById("mpCountdown");
        if (counter) counter.textContent = remaining;

        if (remaining <= 0) {
          clearInterval(intervalId);
          redirectToMercadoPagoForm();
        }
      }, 1000);
    },
    willClose: () => {
      if (intervalId) clearInterval(intervalId);
    }
  });
}

function redirectToMercadoPagoForm() {
  window.location.href = "checkout.html?method=mercadopago&paid=1";
}
