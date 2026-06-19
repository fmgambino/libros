# Fix definitivo EmailJS: method is not defined

Se corrigió el error:

```txt
ReferenceError: method is not defined
```

Causa:
Dentro de `buildTemplateParams()` se usaba una variable `method` que no existía en ese alcance.

Solución:
Ahora se guarda el método en:

```js
order.method
```

y se evalúa así:

```js
const isMp = order.method === "mercadopago";
```

## También se corrigió

- "Taxes" → "Comisión MercadoPago".
- Logo público TAPIRBOOK.
- Leyenda MercadoPago:
  "Podés abonar hasta en 3 cuotas sin interés, solo con NX o Visa bancarizada."
- Cache busting:
  `?v=emailjs-methodfix-06`

## EmailJS

Tus templates pueden seguir usando:

```txt
To Email: {{email}}
```

El JS envía dinámicamente:
- Vendedor: `email = fernando.m.gambino@gmail.com`
- Comprador: `email = email del comprador`
