# Actualización EmailJS - datos del comprador en email del vendedor

## Cambios incluidos

- Se agregaron variables completas del comprador al envío de EmailJS.
- Se agregaron alias en español para facilitar el uso en plantillas.
- Se corrigió el logo roto usando URL directa:
  `https://i.ibb.co/B2MSPZBb/TAPIRBOOK.png`
- Se actualizó la plantilla del vendedor con una card de **Datos del comprador**.

## Variables disponibles en EmailJS para el vendedor

Usar cualquiera de estas variables dentro de la plantilla:

```html
{{customer_name}}
{{customer_email}}
{{customer_whatsapp}}
{{customer_address}}
{{customer_neighborhood}}
{{customer_city}}
{{customer_province}}
{{customer_postal_code}}
```

También quedan disponibles en español:

```html
{{comprador_nombre}}
{{comprador_email}}
{{comprador_whatsapp}}
{{comprador_domicilio}}
{{comprador_barrio}}
{{comprador_ciudad}}
{{comprador_provincia}}
{{comprador_cp}}
```

## Qué plantilla pegar en EmailJS

Entrar a EmailJS → Templates → plantilla que recibe el vendedor:

**Confirmación Comprador / template_98w4xo7**

Borrar el HTML actual y pegar el contenido de:

```text
email/template-confirmacion-comprador-para-vendedor.html
```

En EmailJS, el campo **To Email** debe quedar así:

```text
{{email}}
```

El proyecto ya envía `{{email}}` como el correo del vendedor configurado en:

```js
assets/js/config.js
SELLER_EMAIL: "fernando.m.gambino@gmail.com"
```

## Importante

Para que el logo no salga roto, no usar:

```html
src="cid:logo.png"
```

Usar siempre:

```html
src="https://i.ibb.co/B2MSPZBb/TAPIRBOOK.png"
```
