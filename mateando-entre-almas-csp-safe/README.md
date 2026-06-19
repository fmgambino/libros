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
