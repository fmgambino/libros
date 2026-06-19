# Panel Administrador - Mateando entre Almas

Directorio agregado: `/admin`.

## Acceso inicial

- URL local: `http://127.0.0.1:5502/admin/` o `http://localhost/.../admin/`
- Usuario: `fmgambino`
- Contraseña: `Jamboree0342$$`

Luego cambiar contraseña desde **Mi Perfil**.

## Configuración Supabase

1. Crear proyecto en Supabase.
2. Ir a **SQL Editor**.
3. Ejecutar el archivo:

```txt
/admin/sql/supabase-schema.sql
```

4. Ir a **Project Settings → API**.
5. Copiar `Project URL` y `anon public key`.
6. Editar:

```txt
/assets/js/config.js
```

Y completar:

```js
SUPABASE_ENABLED: true,
SUPABASE_URL: "https://TU-PROYECTO.supabase.co",
SUPABASE_ANON_KEY: "TU_ANON_KEY",
```

## Guardado de pedidos

El `checkout.js` fue actualizado para insertar automáticamente cada pedido en Supabase en la tabla `orders`.

Si Supabase está desactivado, el checkout sigue funcionando con EmailJS y WhatsApp.

## EmailJS para cambios de estado

Para enviar email cuando cambias estado o agregas número de seguimiento desde el panel:

1. Crear un template nuevo en EmailJS.
2. Usar estas variables:

```txt
{{email}}
{{customer_name}}
{{order_id}}
{{order_status}}
{{tracking_number}}
{{tracking_url}}
{{status_message}}
```

3. En `assets/js/config.js`, completar:

```js
EMAILJS_TEMPLATE_CAMBIO_ESTADO_ID: "template_xxxxxxx"
```

## Módulos incluidos

- Login de administrador.
- Cambio de contraseña.
- Dashboard general.
- Pedidos con estados y número de seguimiento.
- Edición / eliminación individual.
- Selección múltiple.
- Eliminación masiva.
- Cambio masivo de estado.
- Exportación CSV.
- Exportación PDF con título, fecha/hora y usuario solicitante.
- Usuarios.
- Roles y permisos con checkbox.
- Crear perfiles.
- Mi Perfil.
- Modo claro/oscuro.
- Pantalla completa.
- Menú lateral colapsable.
- Foto de perfil.

## Seguridad

Este panel es estático y usa Supabase desde frontend. Para producción crítica conviene migrar login y permisos a Supabase Auth + Edge Functions. Para el alcance pedido, se entrega funcional y listo para probar sobre hosting estático.
