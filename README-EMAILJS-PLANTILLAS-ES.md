# Plantillas EmailJS en español

Se corrigieron:

- Textos en español.
- Logo roto reemplazado por URL pública:
  https://i.ibb.co/B2MSPZBb/TAPIRBOOK.png
- "Taxes" reemplazado por "Comisión MercadoPago".
- Leyenda para MercadoPago:
  "Podés abonar hasta en 3 cuotas sin interés, solo con NX o Visa bancarizada."

## Plantillas

Copiar en EmailJS:

```txt
/email/vendor-nuevo-pedido.html
/email/comprador-confirmacion-pedido.html
```

## Configuración recomendada en EmailJS

Como tus templates tienen:

```txt
To Email: {{email}}
```

el código envía dinámicamente:

- vendedor: `email = fernando.m.gambino@gmail.com`
- comprador: `email = email del comprador`

## Variables nuevas

```txt
{{cost.mp_commission}}
{{mp_installments_note}}
```

## Importante

Si seguís viendo la plantilla anterior en Gmail, en EmailJS presioná:

```txt
Apply Changes
Save
```

en cada template.
