# EmailJS corregido para tus templates actuales

Detecté que en ambos templates tenés:

```txt
To Email: {{email}}
```

Por eso el código ahora funciona así:

- Template vendedor: envía `email = fernando.m.gambino@gmail.com`
- Template comprador: envía `email = email ingresado por el comprador`

Así no necesitás cambiar el campo "To Email".

## Configuración esperada en EmailJS

### Template Nuevo Pedido

Subject:

```txt
Nuevo Pedido #{{order_id}}
```

To Email:

```txt
{{email}}
```

Reply To:

```txt
fernando.m.gambino@gmail.com
```

o mejor:

```txt
{{reply_to}}
```

### Template Order Confirmation / Comprador

Subject:

```txt
Confirmación Comprador #{{order_id}}
```

To Email:

```txt
{{email}}
```

Reply To:

```txt
fernando.m.gambino@gmail.com
```

## Variables que el código envía

Para tu template tipo orden:

```txt
{{order_id}}
{{email}}
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

También envía datos extra:

```txt
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
{{order_message}}
```

## Solución aplicada

Se agregó:

```js
buildTemplateParams(order, totals, message, "vendor")
buildTemplateParams(order, totals, message, "customer")
```

Para cambiar dinámicamente el destinatario según el template.

También se agregó espera de 1.6 segundos entre emails para evitar rate limit de EmailJS Free.

## Verificación

Después de probar, revisar:

```txt
EmailJS → Email History
```

Si aparece `200 OK`, el problema puede estar en Spam/Promociones.

Si aparece `failed`, copiar el error exacto.
