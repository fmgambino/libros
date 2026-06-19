document.addEventListener("DOMContentLoaded", () => {
  renderSummary();
  const bankCard = document.getElementById("bankCard");
  const mpCard = document.getElementById("mpCard");

  if (bankCard && getMethod() === "transferencia") bankCard.classList.add("is-visible");
  if (mpCard && getMethod() === "mercadopago") mpCard.classList.add("is-visible");
  document.getElementById("checkoutForm")?.addEventListener("submit", handleOrder);
});

function getMethod() {
  const params = new URLSearchParams(window.location.search);
  const method = params.get("method");
  return method === "mercadopago" ? "mercadopago" : "transferencia";
}

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

  return { book, shipping, mpFee, total: book + shipping + mpFee };
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

  const order = {
    libro: STORE_CONFIG.BOOK_TITLE,
    metodo: method === "mercadopago" ? "MercadoPago" : "Transferencia",
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
    title: "Pedido generado",
    html: method === "mercadopago"
      ? `
        <p>Primero se enviará el pedido por WhatsApp.</p>
        <p>Luego se abrirá el checkout seguro de MercadoPago.</p>
        <p>También se preparará una copia por email.</p>
      `
      : `
        <p>Se abrirá WhatsApp para enviar el pedido al vendedor.</p>
        <p>Luego podés enviar la copia por email.</p>
      `,
    icon: "success",
    confirmButtonText: method === "mercadopago" ? "Enviar pedido y pagar" : "Enviar pedido"
  }).then(() => {
    window.open(whatsappUrl, "_blank");

    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 800);

    if (method === "mercadopago" && STORE_CONFIG.MERCADOPAGO_CHECKOUT_URL) {
      setTimeout(() => {
        window.open(STORE_CONFIG.MERCADOPAGO_CHECKOUT_URL, "_blank");
      }, 1400);
    }
  });
}

function buildMessage(order, totals, method) {
  const paymentNote = method === "transferencia"
    ? `\nDatos de transferencia:\n${STORE_CONFIG.PAYMENT_TRANSFER_INFO}`
    : STORE_CONFIG.MERCADOPAGO_CHECKOUT_URL
      ? `\nCheckout MercadoPago:
${STORE_CONFIG.MERCADOPAGO_CHECKOUT_URL}`
      : "\nMercadoPago: link pendiente de configuración.";

  return `
NUEVO PEDIDO - ${STORE_CONFIG.BOOK_TITLE}

Libro: ${order.libro}
Medio de pago: ${order.metodo}

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
${paymentNote}
`.trim();
}
