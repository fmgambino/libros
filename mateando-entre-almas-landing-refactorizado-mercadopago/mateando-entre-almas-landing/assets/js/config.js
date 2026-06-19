/*
  CONFIGURACIÓN RÁPIDA
  1) Reemplazá BOOK_IMAGE_URL por la URL real de la imagen/portada del libro.
  2) Reemplazá MERCADOPAGO_CHECKOUT_URL por tu link de pago de MercadoPago.
     Si lo dejás vacío, el sistema igual genera el pedido por WhatsApp/email.
  3) En transferencia, completá PAYMENT_TRANSFER_INFO con tus datos bancarios.
*/

const STORE_CONFIG = {
  BOOK_TITLE: "Mateando entre Almas",
  AUTHOR: "F. M. Gambino",

  // 👉 COLOCAR AQUÍ LA URL DE LA IMAGEN DEL LIBRO
  BOOK_IMAGE_URL: "https://TU-DOMINIO.com/ruta/portada-mateando-entre-almas.jpg",

  BOOK_PRICE: 18000,
  SHIPPING_PRICE: 12000,
  MERCADOPAGO_PERCENT: 15,

  SELLER_EMAIL: "fernando.m.gambino@gmail.com",
  SELLER_WHATSAPP_NUMBER: "543816150488",

  // 👉 COLOCAR AQUÍ TU LINK DE PAGO DE MERCADOPAGO
  MERCADOPAGO_CHECKOUT_URL: "https://mpago.la/16pt2s3",

  PAYMENT_TRANSFER_INFO:
    "Banco ICBC\nAlias: FERNANDOMATA420YOYER\nTitular: Ing. Fernando M. Gambino\nCUIL: 20-34185420-4"
};
