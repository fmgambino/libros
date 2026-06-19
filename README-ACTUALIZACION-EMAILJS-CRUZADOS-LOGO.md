# Actualización EmailJS – logo y plantillas cruzadas

Correcciones aplicadas:

1. Logo corregido en templates HTML con URL fija:
   https://i.ibb.co/B2MSPZBb/TAPIRBOOK.png

2. Envío EmailJS corregido según la configuración solicitada:
   - Template **Nuevo Pedido** (`template_w75k5lb`) -> COMPRADOR (`order.email`).
   - Template **Confirmación Comprador** (`template_98w4xo7`) -> VENDEDOR (`fernando.m.gambino@gmail.com`).

3. `assets/js/config.js` ahora incluye nombres semánticos para evitar confusión:

```js
EMAILJS_TEMPLATE_NUEVO_PEDIDO_ID: "template_w75k5lb",
EMAILJS_TEMPLATE_CONFIRMACION_COMPRADOR_ID: "template_98w4xo7",
```

4. Archivos listos para copiar y pegar en EmailJS:
   - `email/template-nuevo-pedido-para-comprador.html`
   - `email/template-confirmacion-comprador-para-vendedor.html`

## Cómo actualizar en Hostinger

Subir y reemplazar estos archivos/carpetas:

- `assets/js/config.js`
- `assets/js/checkout.js`
- carpeta `email/` si necesitás copiar nuevamente los templates en EmailJS.

Luego borrar caché del navegador o abrir en modo incógnito.
