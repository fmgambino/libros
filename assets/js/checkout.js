document.addEventListener("DOMContentLoaded", () => {
  initEmailJS();
  renderSummary();
  renderPaymentStatus();

  const bankCard = document.getElementById("bankCard");
  const mpCard = document.getElementById("mpCard");

  if (bankCard && getMethod() === "transferencia") bankCard.classList.add("is-visible");
  if (mpCard && getMethod() === "mercadopago") mpCard.classList.add("is-visible");

  document.getElementById("checkoutForm")?.addEventListener("submit", handleOrder);
});

function initEmailJS() {
  if (!STORE_CONFIG.EMAILJS_ENABLED) return;
  if (!window.emailjs) {
    console.warn("EmailJS SDK no está cargado.");
    return;
  }
  if (!STORE_CONFIG.EMAILJS_PUBLIC_KEY || STORE_CONFIG.EMAILJS_PUBLIC_KEY.includes("PEGAR_")) {
    console.warn("EMAILJS_PUBLIC_KEY no configurada.");
    return;
  }

  emailjs.init({ publicKey: STORE_CONFIG.EMAILJS_PUBLIC_KEY });
}

function getMethod() {
  const params = new URLSearchParams(window.location.search);
  return params.get("method") === "mercadopago" ? "mercadopago" : "transferencia";
}

function isMercadoPago(method) {
  return method === "mercadopago";
}

function money(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(value);
}

function numberForEmail(value) {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0
  }).format(value);
}

function getTotals(method) {
  const book = STORE_CONFIG.BOOK_PRICE;
  const shipping = STORE_CONFIG.SHIPPING_PRICE;
  const mpFee = isMercadoPago(method)
    ? Math.round(book * STORE_CONFIG.MERCADOPAGO_PERCENT / 100)
    : 0;

  return { book, shipping, mpFee, total: book + shipping + mpFee };
}

function renderPaymentStatus() {
  const statusBox = document.getElementById("paymentStatus");
  if (!statusBox) return;

  if (isMercadoPago(getMethod())) {
    statusBox.innerHTML = `
      <div class="status-card success">
        <strong>MercadoPago seleccionado</strong>
        <p>Completá tus datos de envío. Al confirmar, se enviará el pedido por email y WhatsApp.</p>
        <p>Podés abonar hasta en 3 cuotas sin interés, solo con NX o Visa bancarizada.</p>
        <p>El vendedor verificará la acreditación antes del despacho.</p>
      </div>
    `;
  }
}

function renderSummary() {
  const method = getMethod();
  const totals = getTotals(method);
  const summary = document.getElementById("orderSummary");
  if (!summary) return;

  summary.innerHTML = `
    <div class="summary-row"><span>Medio de pago</span><strong>${isMercadoPago(method) ? "MercadoPago" : "Transferencia"}</strong></div>
    <div class="summary-row"><span>Libro</span><strong>${money(totals.book)}</strong></div>
    <div class="summary-row"><span>Envío Correo Argentino</span><strong>${money(totals.shipping)}</strong></div>
    ${totals.mpFee ? `<div class="summary-row"><span>Comisión MercadoPago</span><strong>${money(totals.mpFee)}</strong></div>` : ""}
    <div class="summary-row"><span>Total</span><strong>${money(totals.total)}</strong></div>
  `;
}

function cleanPhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function createOrderId() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `MEA-${y}${m}${d}-${rnd}`;
}

async function handleOrder(event) {
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
    orderId: createOrderId(),
    libro: STORE_CONFIG.BOOK_TITLE,
    method,
    metodo: isMercadoPago(method) ? "MercadoPago" : "Transferencia",
    estadoPago: isMercadoPago(method)
      ? "MercadoPago: pendiente de verificación"
      : "Transferencia: pendiente de verificación",
    bookPrice: money(totals.book),
    shippingPrice: money(totals.shipping),
    mpFee: totals.mpFee ? money(totals.mpFee) : "$0",
    total: money(totals.total),
    nombre: form.get("fullName"),
    whatsapp: cleanPhone(form.get("whatsapp")),
    email: form.get("email"),
    domicilio: form.get("address"),
    altura: form.get("number"),
    ciudad: form.get("city"),
    provincia: form.get("province"),
    barrio: form.get("neighborhood"),
    cp: form.get("postalCode"),
    createdAt: new Date().toLocaleString("es-AR")
  };

  const message = buildMessage(order, totals);
  localStorage.setItem("mateando_ultimo_pedido", JSON.stringify({ order, message }));

  Swal.fire({
    title: "Enviando pedido",
    html: "Enviando confirmación al comprador y aviso al vendedor...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  const emailResult = await sendEmailsWithEmailJS(order, totals, message);

  Swal.close();

  if (!emailResult.ok) {
    await Swal.fire({
      title: "EmailJS no pudo enviar",
      html: `
        <p>El pedido se enviará por WhatsApp igualmente.</p>
        <p><small>${emailResult.message}</small></p>
        <p><small>Revisá EmailJS → Email History para ver el estado exacto.</small></p>
      `,
      icon: "warning",
      confirmButtonText: "Continuar"
    });
  }

  await sendOrderByWhatsapp(message, emailResult.ok);
}

function buildTemplateParams(order, totals, recipientType) {
  const isVendor = recipientType === "vendor";
  const recipientEmail = isVendor ? STORE_CONFIG.SELLER_EMAIL : order.email;
  const isMp = order.method === "mercadopago";
  const mpInstallmentsNote = isMp
    ? "Podés abonar hasta en 3 cuotas sin interés, solo con NX o Visa bancarizada."
    : "";

  return {
    // Tus templates de EmailJS usan To Email: {{email}}
    email: recipientEmail,

    to_email: recipientEmail,
    vendor_email: STORE_CONFIG.SELLER_EMAIL,
    customer_to_email: order.email,
    customer_email: order.email,
    reply_to: isVendor ? order.email : STORE_CONFIG.SELLER_EMAIL,

    order_id: order.orderId,
    book_title: order.libro,
    payment_method: order.metodo,
    payment_status: order.estadoPago,
    order_date: order.createdAt,

    customer_name: order.nombre,
    customer_whatsapp: order.whatsapp,
    customer_address: `${order.domicilio} ${order.altura}`.trim(),
    customer_street: order.domicilio,
    customer_number: order.altura,
    customer_neighborhood: order.barrio,
    customer_city: order.ciudad,
    customer_province: order.provincia,
    customer_postal_code: order.cp,

    // Alias en español para usar más fácil en plantillas EmailJS
    comprador_nombre: order.nombre,
    comprador_email: order.email,
    comprador_whatsapp: order.whatsapp,
    comprador_domicilio: `${order.domicilio} ${order.altura}`.trim(),
    comprador_calle: order.domicilio,
    comprador_altura: order.altura,
    comprador_barrio: order.barrio,
    comprador_ciudad: order.ciudad,
    comprador_provincia: order.provincia,
    comprador_cp: order.cp,

    orders: [
      {
        name: order.libro,
        units: 1,
        price: numberForEmail(totals.book),
        image_url: STORE_CONFIG.BOOK_IMAGE_URL || ""
      }
    ],
    cost: {
      shipping: numberForEmail(totals.shipping),
      mp_commission: totals.mpFee ? numberForEmail(totals.mpFee) : "0",
      tax: totals.mpFee ? numberForEmail(totals.mpFee) : "0",
      total: numberForEmail(totals.total)
    },

    name: order.libro,
    units: 1,
    price: numberForEmail(totals.book),
    image_url: STORE_CONFIG.BOOK_IMAGE_URL || "",
    logo_url: STORE_CONFIG.LOGO_URL || "https://i.ibb.co/B2MSPZBb/TAPIRBOOK.png",

    shipping: numberForEmail(totals.shipping),
    tax: totals.mpFee ? numberForEmail(totals.mpFee) : "0",
    mp_commission: totals.mpFee ? numberForEmail(totals.mpFee) : "0",
    total: numberForEmail(totals.total),

    item_name: order.libro,
    item_units: 1,
    item_price: numberForEmail(totals.book),
    cost_shipping: numberForEmail(totals.shipping),
    cost_tax: totals.mpFee ? numberForEmail(totals.mpFee) : "0",
    cost_mp_commission: totals.mpFee ? numberForEmail(totals.mpFee) : "0",
    cost_total: numberForEmail(totals.total),

    mp_installments_note: mpInstallmentsNote,

// Mostrar bloque transferencia en EmailJS
is_bank_transfer: order.method === "transferencia",

// Datos bancarios
bank_holder: "Ing. Fernando M. Gambino",
bank_name: "ICBC",
bank_alias: "FERNANDOMATA420YOYER",
bank_cuil: "20-34185420-4",
bank_cbu: "0150518401000169400146",

order_message: buildMessage(order, totals)
  };
}

async function sendEmailsWithEmailJS(order, totals, message) {
  if (!STORE_CONFIG.EMAILJS_ENABLED) {
    return { ok: false, message: "EmailJS está desactivado en config.js." };
  }

  if (!window.emailjs) {
    return { ok: false, message: "No se cargó la librería EmailJS. Revisá CDN, conexión o bloqueadores." };
  }

  const required = [
    STORE_CONFIG.EMAILJS_PUBLIC_KEY,
    STORE_CONFIG.EMAILJS_SERVICE_ID,
    (STORE_CONFIG.EMAILJS_TEMPLATE_NUEVO_PEDIDO_ID || STORE_CONFIG.EMAILJS_CUSTOMER_TEMPLATE_ID),
    (STORE_CONFIG.EMAILJS_TEMPLATE_CONFIRMACION_COMPRADOR_ID || STORE_CONFIG.EMAILJS_VENDOR_TEMPLATE_ID)
  ];

  if (required.some(v => !v || String(v).includes("PEGAR_"))) {
    return {
      ok: false,
      message: "Faltan configurar PUBLIC_KEY, SERVICE_ID o TEMPLATE_ID en assets/js/config.js."
    };
  }

  try {
    const customerTemplateId = STORE_CONFIG.EMAILJS_TEMPLATE_NUEVO_PEDIDO_ID || STORE_CONFIG.EMAILJS_CUSTOMER_TEMPLATE_ID;
    const sellerTemplateId = STORE_CONFIG.EMAILJS_TEMPLATE_CONFIRMACION_COMPRADOR_ID || STORE_CONFIG.EMAILJS_VENDOR_TEMPLATE_ID;

    // CORRECCIÓN SOLICITADA:
    // Template "Nuevo Pedido" -> comprador
    // Template "Confirmación Comprador" -> vendedor
    const customerParams = buildTemplateParams(order, totals, "customer");

    console.group("EmailJS comprador - template Nuevo Pedido");
    console.log("Service:", STORE_CONFIG.EMAILJS_SERVICE_ID);
    console.log("Template:", customerTemplateId);
    console.log("Destino {{email}}:", customerParams.email);
    console.log(customerParams);
    console.groupEnd();

    const customerResult = await emailjs.send(
      STORE_CONFIG.EMAILJS_SERVICE_ID,
      customerTemplateId,
      customerParams
    );

    console.log("EmailJS comprador OK:", customerResult);

    await wait(1700);

    const vendorParams = buildTemplateParams(order, totals, "vendor");

    console.group("EmailJS vendedor - template Confirmación Comprador");
    console.log("Service:", STORE_CONFIG.EMAILJS_SERVICE_ID);
    console.log("Template:", sellerTemplateId);
    console.log("Destino {{email}}:", vendorParams.email);
    console.log(vendorParams);
    console.groupEnd();

    const vendorResult = await emailjs.send(
      STORE_CONFIG.EMAILJS_SERVICE_ID,
      sellerTemplateId,
      vendorParams
    );

    console.log("EmailJS vendedor OK:", vendorResult);

    return { ok: true, message: "Emails enviados correctamente.", customerResult, vendorResult };
  } catch (error) {
    console.error("EmailJS error:", error);

    const details = [
      error?.status ? `Status: ${error.status}` : "",
      error?.text ? `Detalle: ${error.text}` : "",
      error?.message ? `Mensaje: ${error.message}` : ""
    ].filter(Boolean).join(" | ");

    return { ok: false, message: details || "Error desconocido al enviar por EmailJS." };
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendOrderByWhatsapp(message, emailOk) {
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.SELLER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  await Swal.fire({
    title: "Pedido listo",
    html: emailOk
      ? `<p>Emails enviados correctamente.</p><p>Ahora se abrirá WhatsApp con el pedido.</p>`
      : `<p>Se abrirá WhatsApp con el pedido.</p>`,
    icon: "success",
    confirmButtonText: "Abrir WhatsApp"
  });

  window.open(whatsappUrl, "_blank");
}

function buildMessage(order, totals) {
  const paymentNote = order.method === "transferencia"
    ? `\nDatos de transferencia:\n${STORE_CONFIG.PAYMENT_TRANSFER_INFO}`
    : `\nPago MercadoPago:\nCheckout utilizado: ${STORE_CONFIG.MERCADOPAGO_CHECKOUT_URL}\nEstado: ${order.estadoPago}\nCuotas: hasta 3 cuotas sin interés solo con NX o Visa bancarizada.\nImportante: verificar acreditación/comprobante antes del despacho.`;

  return `
NUEVO PEDIDO - ${STORE_CONFIG.BOOK_TITLE}

Pedido: ${order.orderId}
Fecha: ${order.createdAt}

Libro: ${order.libro}
Medio de pago: ${order.metodo}
Estado de pago: ${order.estadoPago}
Plazos aceptados por el cliente: Sí

Importes:
- Libro: ${money(totals.book)}
- Envío Correo Argentino: ${money(totals.shipping)}
${totals.mpFee ? `- Comisión MercadoPago: ${money(totals.mpFee)}\n` : ""}- TOTAL: ${money(totals.total)}

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
