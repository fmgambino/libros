# Plantillas EmailJS refactorizadas

Se integró el formato de orden de EmailJS, pero adaptado a:

- Español.
- Modo oscuro.
- Marca Libros FMG.
- Footer: © 2026 Libros FMG – Diseñado por Electrónica Gambino.
- Variables enviadas desde la landing.

## Archivos principales

```txt
/email/vendor-nuevo-pedido.html
/email/comprador-confirmacion-pedido.html
```

## Archivos alternativos sin bloques

Si EmailJS no interpreta correctamente:

```txt
{{#orders}}
...
{{/orders}}
```

usá estas versiones:

```txt
/email/vendor-nuevo-pedido-sin-bloques.html
/email/comprador-confirmacion-pedido-sin-bloques.html
```

Estas versiones usan variables simples:

```txt
{{item_name}}
{{item_units}}
{{item_price}}
{{cost_shipping}}
{{cost_tax}}
{{cost_total}}
```

## Variables principales

```txt
{{order_id}}
{{email}}
{{customer_name}}
{{customer_whatsapp}}
{{customer_email}}
{{customer_address}}
{{customer_neighborhood}}
{{customer_city}}
{{customer_province}}
{{customer_postal_code}}
{{payment_method}}
{{payment_status}}
{{book_title}}
{{book_price}}
{{shipping_price}}
{{mp_fee}}
{{total}}
{{order_message}}
{{vendor_email}}
{{to_email}}
{{customer_to_email}}
```

## Variables del template tipo orden

```txt
{{#orders}}
{{image_url}}
{{name}}
{{units}}
{{price}}
{{/orders}}

{{cost.shipping}}
{{cost.tax}}
{{cost.total}}
```

## Configuración EmailJS

En Template vendedor:

To Email:

```txt
{{to_email}}
```

Reply To:

```txt
{{reply_to}}
```

Subject:

```txt
[NUEVO PEDIDO] Mateando entre Almas - {{order_id}}
```

En Template comprador:

To Email:

```txt
{{customer_to_email}}
```

Reply To:

```txt
{{vendor_email}}
```

Subject:

```txt
Confirmación de pedido - Mateando entre Almas - {{order_id}}
```

## Claves en config.js

Completar en:

```txt
/assets/js/config.js
```

```js
EMAILJS_PUBLIC_KEY: "PEGAR_PUBLIC_KEY",
EMAILJS_SERVICE_ID: "PEGAR_SERVICE_ID",
EMAILJS_VENDOR_TEMPLATE_ID: "PEGAR_TEMPLATE_ID_VENDOR",
EMAILJS_CUSTOMER_TEMPLATE_ID: "PEGAR_TEMPLATE_ID_CUSTOMER",
```

## Logo

EmailJS usa:

```html
src="cid:logo.png"
```

Para que funcione, cargá el logo como attachment/imagen embebida en el editor de EmailJS, o reemplazá esa ruta por una URL pública de tu logo.
