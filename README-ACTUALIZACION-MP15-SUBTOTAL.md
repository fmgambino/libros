# Actualización urgente - MercadoPago +15% sobre subtotal

## Corrección aplicada

Se corrigió el cálculo de la comisión de MercadoPago en:

- `assets/js/main.js`
- `assets/js/checkout.js`

Antes el sistema calculaba el 15% solo sobre el libro:

```text
$18.000 x 15% = $2.700
Total anterior: $32.700
```

Ahora calcula el 15% sobre el subtotal completo:

```text
Libro: $18.000
Envío: $12.000
Subtotal: $30.000
Comisión MercadoPago 15%: $4.500
Total correcto: $34.500
```

## Qué impacta esta corrección

La función `getTotals()` fue corregida en ambos archivos, por lo tanto el nuevo total impacta en:

- Popup inicial del botón Comprar.
- Checkout.
- Resumen del pedido.
- EmailJS comprador.
- EmailJS vendedor.
- Mensaje de WhatsApp.
- Variables usadas por las plantillas de EmailJS:
  - `{{cost.tax}}`
  - `{{cost.mp_commission}}`
  - `{{cost.total}}`
  - `{{cost_tax}}`
  - `{{cost_mp_commission}}`
  - `{{cost_total}}`

## Archivos a subir al hosting

Subir/reemplazar todo el proyecto o, como mínimo:

```text
assets/js/main.js
assets/js/checkout.js
```

## Importante sobre caché

Después de subir los archivos al hosting:

1. Borrar caché del navegador.
2. Abrir en modo incógnito.
3. Si usás Hostinger o CDN, purgar caché.
4. Verificar que el popup muestre MercadoPago +15% = $34.500.
5. Hacer un pedido de prueba y confirmar que los emails muestren:

```text
Comisión MercadoPago: $4.500
Total: $34.500
```
