# Landing Page - Mateando entre Almas

## Corrección importante

MercadoPago rechaza la conexión dentro de un `iframe`, por eso no puede mostrarse embebido dentro del popup.

El flujo fue corregido así:

1. El cliente elige MercadoPago.
2. Se abre un popup informativo.
3. MercadoPago se abre en una nueva pestaña.
4. El popup muestra un contador.
5. Al terminar el contador, vuelve al formulario de pedido:

```txt
checkout.html?method=mercadopago&paid=1
```

## Dónde modificar el contador

Abrir:

```txt
assets/js/config.js
```

Modificar:

```js
MERCADOPAGO_WAIT_SECONDS: 10
```

## Checkout MercadoPago

```txt
https://mpago.la/16pt2s3
```

## Datos de transferencia

Banco ICBC  
Alias: FERNANDOMATA420YOYER  
Titular: Ing. Fernando M. Gambino  
CUIL: 20-34185420-4  

## Imagen del libro

Editar en:

```txt
assets/js/config.js
```

Variable:

```js
BOOK_IMAGE_URL
```


## Corrección CSP

Se eliminaron todos los eventos inline del tipo:

```html
onclick="..."
```

Ahora los botones del popup usan `addEventListener()` desde `assets/js/main.js`, evitando el bloqueo por Content Security Policy.

## Flujo corregido

1. El cliente elige MercadoPago.
2. Se abre MercadoPago en una nueva pestaña.
3. El popup conserva el contador.
4. Al terminar el contador redirige a:

```txt
checkout.html?method=mercadopago&paid=1
```


## Corrección de flujo formulario + MercadoPago

Se corrigió el problema de que, al completar el formulario, MercadoPago abría WhatsApp.

Nuevo comportamiento:

### Transferencia

Formulario → WhatsApp/email al vendedor.

### MercadoPago

Formulario → MercadoPago.

No abre WhatsApp automáticamente.

Los datos del pedido quedan guardados temporalmente en el navegador mediante:

```js
localStorage.setItem("mateando_ultimo_pedido", ...)
```

Esto evita que el comprador sea enviado a WhatsApp antes de pagar.

## Nota importante

Con un link simple de MercadoPago tipo:

```txt
https://mpago.la/16pt2s3
```

no se puede verificar automáticamente el pago ni disparar un email/backend real.

Para automatización profesional se necesita backend PHP + MercadoPago Checkout Pro/API + Webhooks.


## Corrección final del formulario

Se corrigió el comportamiento del formulario:

### Antes
Si el método era MercadoPago, al completar el formulario volvía a invitar a ir al checkout.

### Ahora
Al completar el formulario, siempre envía el pedido por WhatsApp y prepara email, tanto para:

- Transferencia
- MercadoPago

En MercadoPago, el mensaje indica:

```txt
MercadoPago: pago/cupón pendiente de verificación
```

De esta manera, el vendedor recibe los datos del comprador y puede verificar el pago/comprobante antes del despacho.


## Fix cache / GitHub Pages

Se agregaron parámetros de versión a los scripts:

```txt
?v=20260619-final-02
```

Esto fuerza al navegador a cargar el `checkout.js` nuevo y no usar una versión anterior en caché.

## Comportamiento final

Al confirmar el formulario:

- Transferencia: abre WhatsApp + prepara email.
- MercadoPago: abre WhatsApp + prepara email.
- Ya no vuelve a invitar a ir al checkout de MercadoPago.


# Integración EmailJS

Se agregó envío de email automático sin PHP ni MySQL mediante EmailJS.

## Archivos agregados

```txt
/email/vendor-nuevo-pedido.html
/email/comprador-confirmacion-pedido.html
/email/README-EMAILJS.md
```

## Configurar

Abrir:

```txt
/assets/js/config.js
```

Completar:

```js
EMAILJS_PUBLIC_KEY: "PEGAR_PUBLIC_KEY",
EMAILJS_SERVICE_ID: "PEGAR_SERVICE_ID",
EMAILJS_VENDOR_TEMPLATE_ID: "PEGAR_TEMPLATE_ID_VENDOR",
EMAILJS_CUSTOMER_TEMPLATE_ID: "PEGAR_TEMPLATE_ID_CUSTOMER",
```

## Flujo final

Al confirmar pedido:

1. Envía email al vendedor.
2. Envía email de confirmación al comprador.
3. Abre WhatsApp con el pedido.
4. Guarda una copia temporal en `localStorage`.

Si EmailJS no está configurado o falla, el sistema muestra aviso y continúa con WhatsApp.


## Refactor plantillas EmailJS tipo Order Confirmation

Se reemplazaron las plantillas anteriores por versiones basadas en el template de EmailJS que compartiste, adaptadas a Libros FMG:

- `/email/vendor-nuevo-pedido.html`
- `/email/comprador-confirmacion-pedido.html`

También se agregaron variantes sin bloques por compatibilidad:

- `/email/vendor-nuevo-pedido-sin-bloques.html`
- `/email/comprador-confirmacion-pedido-sin-bloques.html`

El JS ahora envía variables compatibles con:

```txt
{{#orders}}
{{name}}
{{units}}
{{price}}
{{image_url}}
{{/orders}}

{{cost.shipping}}
{{cost.tax}}
{{cost.total}}
```

y también variables planas de respaldo.
