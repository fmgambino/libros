document.addEventListener("DOMContentLoaded", () => {
  renderSummary();
  renderPaymentStatus();

  const bankCard = document.getElementById("bankCard");
  const mpCard = document.getElementById("mpCard");

  if (bankCard && getMethod() === "transferencia") bankCard.classList.add("is-visible");
  if (mpCard && getMethod() === "mercadopago") mpCard.classList.add("is-visible");

  document.getElementById("checkoutForm")?.addEventListener("submit", handleOrder);
});

function getMethod() {
  const params = new URLSearchParams(window.location.search);
  return params.get("method") === "mercadopago" ? "mercadopago" : "transferencia";
}

function isPaidReturn() {
  return new URLSearchParams(window.location.search).get("paid") === "1";
}

function money(value) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
}

function getTotals(method) {
  const book = STORE_CONFIG.BOOK_PRICE;
  const shipping = STORE_CONFIG.SHIPPING_PRICE;
  const mpFee = method === "mercadopago" ? Math.round(book * STORE_CONFIG.MERCADOPAGO_PERCENT / 100) : 0;
  return { book, shipping, mpFee, total: book + shipping + mpFee };
}

function renderPaymentStatus() {
  const statusBox = document.getElementById("paymentStatus");
  if (!statusBox) return;

  const method = getMethod();

  if (method === "mercadopago" && isPaidReturn()) {
    statusBox.innerHTML = `<div class="status-card success"><strong>Continuar pedido MercadoPago</strong><p>Ahora completá tus datos de envío para enviar el pedido por WhatsApp y email.</p></div>`;
  } else if (method === "mercadopago") {
    statusBox.innerHTML = `<div class="status-card warning"><strong>MercadoPago seleccionado</strong><p>Completá tus datos de envío luego de abonar o generar el cupón.</p></div>`;
  }
}

function renderSummary() {
  const method = getMethod();
  const totals = getTotals(method);
  const summary = document.getElementById("orderSummary");

  summary.innerHTML = `
    <div class="summary-row"><span>Medio de pago</span><strong>${method === "mercadopago" ? "MercadoPago" : "Transferencia"}</strong></div>
    <div class="summary-row"><span>Libro</span><strong>${money(totals.book)}</strong></div>
    <div class="summary-row"><span>Envío Correo Argentino</span><strong>${money(totals.shipping)}</strong></div>
    ${totals.mpFee ? `<div class="summary-row"><span>Recargo MercadoPago 15%</span><strong>${money(totals.mpFee)}</strong></div>` : ""}
    <div class="summary-row"><span>Total</span><strong>${money(totals.total)}</strong></div>
  `;
}

function cleanPhone(value) {
  return value.replace(/[^\d+]/g, "");
}

function handleOrder(event) {
  event.preventDefault();

  const method = getMethod();
  const totals = getTotals(method);
  const form = new FormData(event.target);

  if (!form.get("acceptTerms")) {
    Swal.fire({
      title: "Confirmación requerida",
      text: "Debés aceptar los plazos de producción, despacho y transporte para continuar.",
      icon: "warning",
      confirmButtonText: "Entendido"
    });
    return;
  }

  const order = {
    libro: STORE_CONFIG.BOOK_TITLE,
    metodo: method === "mercadopago" ? "MercadoPago" : "Transferencia",
    estadoPago: method === "mercadopago" && isPaidReturn() ? "Cliente continuó desde MercadoPago" : "Pendiente de verificación",
    total: money(totals.total),
    nombre: form.get("fullName"),
    whatsapp: cleanPhone(form.get("whatsapp")),
    email: form.get("email"),
    domicilio: form.get("address"),
    altura: form.get("number"),
    ciudad: form.get("city"),
    provincia: form.get("province"),
    barrio: form.get("neighborhood"),
    cp: form.get("postalCode")
  };

  const message = buildMessage(order, totals, method);
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.SELLER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const mailtoUrl = `mailto:${STORE_CONFIG.SELLER_EMAIL}?subject=${encodeURIComponent("Nuevo pedido - Mateando entre Almas")}&body=${encodeURIComponent(message)}`;

  Swal.fire({
    title: "Pedido listo",
    html: `<p>Se abrirá WhatsApp para enviar el pedido al vendedor.</p><p>Luego se preparará una copia por email.</p>`,
    icon: "success",
    confirmButtonText: "Enviar pedido"
  }).then(() => {
    window.open(whatsappUrl, "_blank");
    setTimeout(() => { window.location.href = mailtoUrl; }, 900);
  });
}

function buildMessage(order, totals, method) {
  const paymentNote = method === "transferencia"
    ? `\nDatos de transferencia:\n${STORE_CONFIG.PAYMENT_TRANSFER_INFO}`
    : `\nPago MercadoPago:\nCheckout utilizado: ${STORE_CONFIG.MERCADOPAGO_CHECKOUT_URL}\nEstado: ${order.estadoPago}`;

  return `
NUEVO PEDIDO - ${STORE_CONFIG.BOOK_TITLE}

Libro: ${order.libro}
Medio de pago: ${order.metodo}
Estado de pago: ${order.estadoPago}
Plazos aceptados por el cliente: Sí

Importes:
- Libro: ${money(totals.book)}
- Envío Correo Argentino: ${money(totals.shipping)}
${totals.mpFee ? `- Recargo MercadoPago 15%: ${money(totals.mpFee)}\n` : ""}- TOTAL: ${money(totals.total)}

Datos del comprador:
- Nombre y apellido: ${order.nombre}
- WhatsApp: ${order.whatsapp}
- Email: ${order.email}
- Domicilio: ${order.domicilio} ${order.altura}
- Barrio: ${order.barrio}
- Ciudad: ${order.ciudad}
- Provincia: ${order.provincia}
- Código Postal: ${order.cp}

Plazos informados:
- Despacho dentro de los 7 días por plazos de producción.
- Transporte Correo Argentino: 7 a 10 días.
${paymentNote}
`.trim();
}
