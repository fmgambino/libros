const STORE_CONFIG = {
  BOOK_TITLE: "Mateando entre Almas",
  AUTHOR: "F. M. Gambino",
  LOGO_URL: "https://i.ibb.co/B2MSPZBb/TAPIRBOOK.png",

  BOOK_IMAGE_URL: "https://tintalibre.com.ar/_admin/html/upload/libros/Mateando%20entre%20almas%20-%20Tapa%2004-12-25_02.%20Tapa.jpg",

  BOOK_PRICE: 18000,
  SHIPPING_PRICE: 12000,
  MERCADOPAGO_PERCENT: 15,

  SELLER_EMAIL: "fernando.m.gambino@gmail.com",
  SELLER_WHATSAPP_NUMBER: "543816150488",

  MERCADOPAGO_CHECKOUT_URL: "https://mpago.la/16pt2s3",

  EMAILJS_ENABLED: true,
  EMAILJS_PUBLIC_KEY: "OSgrCko1Un26bCaSh",
  EMAILJS_SERVICE_ID: "service_8z90ggm",
  // Configuración corregida según EmailJS:
  // - Template "Nuevo Pedido" -> se envía al COMPRADOR
  // - Template "Confirmación Comprador" -> se envía al VENDEDOR
  EMAILJS_TEMPLATE_NUEVO_PEDIDO_ID: "template_w75k5lb",
  EMAILJS_TEMPLATE_CONFIRMACION_COMPRADOR_ID: "template_98w4xo7",

  // Compatibilidad con versiones anteriores del proyecto
  EMAILJS_VENDOR_TEMPLATE_ID: "template_98w4xo7",
  EMAILJS_CUSTOMER_TEMPLATE_ID: "template_w75k5lb",

  PAYMENT_TRANSFER_INFO:
    "Banco ICBC\nAlias: FERNANDOMATA420YOYER\nTitular: Ing. Fernando M. Gambino\nCUIL: 20-34185420-4\nCBU: 0150518401000169400146",

  // Supabase: pegar los datos de tu proyecto para guardar pedidos y operar el panel /admin.
  // Supabase Dashboard → Project Settings → API.
  SUPABASE_ENABLED: false,
  SUPABASE_URL: "PEGAR_SUPABASE_URL",
  SUPABASE_ANON_KEY: "PEGAR_SUPABASE_ANON_KEY",

  // Template EmailJS opcional para avisar cambios de estado desde el panel admin.
  // Debe usar variables: {{email}}, {{customer_name}}, {{order_id}}, {{order_status}}, {{tracking_number}}, {{tracking_url}}, {{status_message}}.
  EMAILJS_TEMPLATE_CAMBIO_ESTADO_ID: "PEGAR_TEMPLATE_CAMBIO_ESTADO_ID"
};
