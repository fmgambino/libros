# Landing Page - Mateando entre Almas

Landing mobile first creada con:

- HTML5
- CSS3
- JavaScript
- SweetAlert2

## Archivos

- `index.html`: landing principal.
- `checkout.html`: formulario de pedido.
- `assets/css/styles.css`: estilos.
- `assets/js/config.js`: configuración principal.
- `assets/js/main.js`: popup de compra.
- `assets/js/checkout.js`: checkout, WhatsApp y email.

## Dónde colocar la imagen del libro

Abrí:

```txt
assets/js/config.js
```

Y reemplazá:

```js
BOOK_IMAGE_URL: "https://TU-DOMINIO.com/ruta/portada-mateando-entre-almas.jpg",
```

por la URL real de la portada.

## Dónde colocar MercadoPago

En el mismo archivo:

```js
MERCADOPAGO_CHECKOUT_URL: "",
```

pegá tu link real de pago de MercadoPago.

## Datos de transferencia configurados

Banco ICBC  
Alias: FERNANDOMATA420YOYER  
Titular: Ing. Fernando M. Gambino  
CUIL: 20-34185420-4  

Estos datos están configurados en:

```txt
assets/js/config.js
```

También se muestran automáticamente en el checkout cuando el comprador elige Transferencia.

## Importante

Esta versión es 100% estática. Por seguridad, desde HTML/JS puro no se puede enviar un email SMTP automático sin backend.

Por eso el sistema:
1. Abre WhatsApp con todos los datos del pedido.
2. Abre el cliente de correo del comprador con el email prellenado para enviar copia a `fernando.m.gambino@gmail.com`.

Para envío automático real de emails, se debe agregar backend PHP con PHPMailer o una API como Brevo, Resend, Mailgun o similar.
