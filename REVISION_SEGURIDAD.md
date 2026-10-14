# Revisión de seguridad de Pockets

Revisión del 14 de octubre de 2026. Alcance: código del repositorio, dependencias instaladas, entrada de formularios, respaldos, almacenamiento local, generación de PDF, scripts/fuentes y configuración de Vercel/Netlify. Se prueban datos ficticios en sesiones aisladas de Chrome; no se accede a gastos personales ni se modifica la configuración de las cuentas.

## Resultado

No se encontró una inyección de código explotable en los campos revisados: el texto del usuario ya se escapaba al mostrarlo. No se encontraron credenciales en los archivos versionados ni solicitudes de la aplicación que envíen los gastos a servicios externos. `npm audit` no reportó vulnerabilidades conocidas. Esto no certifica ausencia de todos los problemas ni sustituye una revisión independiente.

## Qué se encontró y corrigió

### Protecciones del navegador incompletas en Vercel

Las cabeceras de Netlify no se aplicaban a Vercel. Además, no existía una política que limitara los scripts y conexiones de la aplicación. Si un cambio futuro introdujera una inyección, un script podría leer los gastos locales o enviarlos fuera de la web. No se demostró que ese ataque fuera posible con el código anterior; faltaba una defensa adicional.

Se añadieron a ambos proveedores reglas que permiten scripts/fuentes locales, bloquean scripts inline y externos y conexiones de red, prohíben mostrar la app dentro de otra página, reducen información del referente y deshabilitan permisos innecesarios de cámara, micrófono, ubicación, USB y pagos. El código de arranque del tema pasó a `public/theme-init.js` para cumplir la política sin permitir scripts inline. Los estilos inline del gráfico siguen permitidos y se generan únicamente desde categorías fijas y cantidades validadas.

### Posible pérdida de registros al guardar desde otra pestaña

El cierre de un período generaba el PDF de manera asíncrona usando una copia de los registros. Si otra pestaña guardaba durante esa espera, la copia antigua podía reemplazar sus cambios.

Cada operación conserva la versión que leyó y la compara justo antes de escribir. Si cambió, se detiene y pide recargar. Cuando el navegador ofrece Web Locks, también se serializan las escrituras de Pockets. Se comprobó con un guardado detenido mientras otra pestaña actualizaba los registros: el dato nuevo se conservó y el guardado antiguo fue rechazado. Navegadores sin Web Locks conservan la comparación, pero no ofrecen la misma garantía de exclusión entre procesos.

### Validación y límites distintos al importar y guardar

Los respaldos convertían algunos valores de tipos incorrectos a montos y admitían identificadores vacíos o arbitrarios. El guardado normal no comprobaba todos los límites del formato de respaldo, así que podía producir datos que después no se pudieran cargar. Importaciones muy grandes también podían consumir demasiada memoria al dibujar filas o generar un PDF.

Ahora se exige un monto numérico en los respaldos, identificadores acotados y sin caracteres de marcado, categorías/fechas válidas, unicidad de identificadores y un solo período abierto. Se descartan campos ajenos al formato. Se aplica la misma validación al guardar y leer. Los límites son 500 períodos, 10 000 gastos en total y 2 MB de datos; si se exceden o falla el almacenamiento, lo anterior no se reemplaza. Un contenido vacío o corrupto deja de confundirse con un archivo nuevo y permanece recuperable desde la opción de datos sin procesar.

## Lo que permanece y cómo cuidarlo

- Los gastos y respaldos JSON se almacenan sin cifrar. Usar un equipo compartido o entregar un respaldo permite que otra persona los lea. Guarda las copias en una ubicación privada y no escribas secretos, tarjetas o números de cuenta en los detalles.
- Esta app lleva un registro personal modificable por su dueño, no un libro contable inalterable. No hay cuentas ni autorización en servidor. Añadir sincronización exigiría autenticar usuarios y verificar propiedad/permisos en cada operación del servidor.
- El navegador no protege frente a una sesión del dispositivo ya comprometida o una extensión con acceso amplio. Mantén el navegador actualizado y evita extensiones que no necesites.
- Revisa las dependencias periódicamente, prueba antes de publicarlas y conserva el archivo de versiones. El análisis actual no reporta avisos, pero pueden aparecer nuevos después.
- Conserva un respaldo antes de cambiar de dispositivo, dominio o navegador. La revisión no elimina ni migra los datos personales.
- Revisa en GitHub/Vercel quién puede escribir en el repositorio y desplegar. No se auditaron permisos internos de esas cuentas ni se reactivó la conexión de Vercel retirada por el usuario.

## Pruebas

`npm test`: reglas monetarias, fechas, respaldos, tipos inválidos, tamaño, cuotas fallidas y rechazo de guardados antiguos.

`npm run build` y `npm run test:security`: app compilada con las cabeceras reales de `vercel.json`; texto de respaldo con etiquetas/eventos mostrado sin ejecutarse; intento de manejador inline bloqueado por CSP; tema oscuro y PDF funcionales bajo la política; conflicto de pestañas sin sobrescritura.

Las pruebas generales del registro y de accesibilidad se documentan en `VALIDACION.md`. Las auditorías automáticas cubren las vistas examinadas y no equivalen a una certificación completa.

## Vercel

GitHub registró un despliegue de producción completado por Vercel del commit `d281f1a`, lo que confirma la integración con el repositorio. La URL enviada por el usuario es el panel de administración, y la URL inmutable obtenida desde GitHub redirige al inicio de sesión de Vercel. No se confundieron esas cabeceras de inicio de sesión con las de Pockets ni se desactivó la protección.

Cuando se suben las correcciones a `main`, Vercel debe crear otro despliegue y aplicar el código y `vercel.json` juntos. No hay que editar la app otra vez en Vercel. El resultado del nuevo despliegue debe verificarse en los estados de GitHub; los cambios no están publicados hasta que termine correctamente. Si la integración se desvincula, se pausa o cambia la rama de producción, hará falta corregir esa configuración o desplegar manualmente.

Fuentes: [Vercel y GitHub](https://vercel.com/docs/git/vercel-for-github), [configuración de Vercel](https://vercel.com/docs/project-configuration/vercel-json), [protección contra incrustación en otras páginas](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors).
