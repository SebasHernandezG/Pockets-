# Pockets

Una web sencilla para administrar ingresos y gastos en **colones costarricenses (CRC / ₡)**, pensada primero para celular.

## Qué hace

- Crea un registro independiente por cada ingreso: salario, beca u otro pago.
- Registra gastos de Transporte, Gustos, Comida, Alquiler, Deudas, Servicios y Ropa.
- Calcula el total gastado, saldo disponible y distribución por categoría. Trabaja con céntimos para evitar errores al sumar decimales.
- Permite editar o eliminar gastos del registro abierto.
- **Editar ingreso** permite actualizar el total recibido del registro abierto sin borrar sus gastos ni comenzar otro período. Por ejemplo, si tenías ₡157 000 y recibiste ₡30 000 más, escribe ₡187 000 como nuevo total. El saldo y los PDF se recalculan con ese monto.
- Al agregar un nuevo ingreso, cierra el anterior, descarga su PDF y conserva el historial.
- El PDF incluye mes de inicio, rango de fechas, ingreso, gráfico circular, montos por categoría, cada gasto, total y saldo. Los informes largos tienen varias páginas.
- Descarga y restaura respaldos JSON. Los registros cerrados se consultan sin modificarlos.
- Valida los respaldos y los datos antes de guardarlos; admite hasta 500 registros, 10 000 gastos en total y 2 MB de datos. Si se supera el límite, conserva lo anterior y muestra un error.
- Modo claro y oscuro desde el botón de la luna/sol. Respeta la preferencia del sistema al comenzar y recuerda la elección en este navegador. El botón anuncia su estado con `aria-pressed` y funciona con Enter o Espacio.

Cada ingreso inicia un período propio, aunque haya varios en el mismo mes. El saldo anterior **no se añade automáticamente** al nuevo ingreso. El PDF se identifica por el mes de inicio y muestra el rango completo de fechas.

## Ejecutar

Necesitas Node.js 22.12 o superior y npm.

```sh
npm ci
npm run dev
```

Abre la URL que aparece en la terminal. Para comprobar y compilar:

```sh
npm test
npm run build
npm run preview
```

## Publicar en Vercel

El archivo `vercel.json` configura Vite, `npm ci`, `npm run build` y salida `dist`.

1. En Vercel, elige **Add New → Project** y **Import** junto al repositorio `Pockets-`.
2. Framework: **Vite**. Root Directory: **./** (la raíz del repositorio).
3. Build Command: `npm run build`. Output Directory: `dist`. No necesita variables de entorno.
4. Pulsa **Deploy**. Los siguientes cambios en `main` se desplegarán automáticamente.

## Publicar en Netlify

El archivo `netlify.toml` ya configura `npm run build`, la carpeta de publicación `dist` y Node.js 22.

1. En Netlify, elige **Add new project → Import an existing project**.
2. Conecta GitHub y selecciona `SebasHernandezG/Pockets-`.
3. Usa la rama `main`, el directorio base vacío, comando `npm run build` y publicación `dist`.
4. Publica. Los siguientes cambios en la rama se desplegarán automáticamente.

También puedes ejecutar `npm run build` y subir **el contenido de `dist`** mediante Netlify Drop. El ZIP de publicación contiene esa compilación, lista para extraer y subir.

Documentación oficial: [importar un proyecto](https://docs.netlify.com/manage/projects/add-new-project/) y [despliegues manuales](https://docs.netlify.com/deploy/create-deploys/).

## Datos y privacidad

Los registros se guardan en `localStorage` del navegador. No hay cuentas ni servidor, y tus gastos no se envían a GitHub o Netlify. Las fuentes tipográficas y la librería de PDF están incluidas en la compilación.

Este almacenamiento y los respaldos JSON **no están cifrados**. Quien acceda a tu sesión del navegador o a un archivo de respaldo puede leerlos. No guardes contraseñas, números de tarjeta o cuentas bancarias en los detalles de gastos.

Vercel y Netlify tienen una política de seguridad que permite los scripts de esta web, bloquea scripts externos/inline y conexiones de red desde la aplicación, e impide incrustarla en otras páginas. Los estilos inline se permiten para el gráfico y los indicadores numéricos. El arranque del tema se sirve como archivo local para funcionar con esa política.

Los guardados comprueban la versión leída. Si otra pestaña cambia los registros mientras una operación espera, se rechaza el guardado antiguo en lugar de sobrescribirlos. En navegadores con Web Locks, las escrituras de Pockets se serializan; en los demás se mantiene la comprobación de versión, sin prometer exclusión atómica entre procesos.

**Descarga un respaldo periódicamente.** Borrar los datos del navegador, cambiar de dispositivo, usar modo privado o cambiar el dominio de la web puede hacer que los registros dejen de estar disponibles. Los datos de la vista local no se transfieren al dominio publicado: usa un respaldo para trasladarlos. El PDF es un informe; el JSON es el respaldo que se puede restaurar.

Si un registro local no puede leerse, la app lo conserva sin sobrescribirlo y permite descargarlo sin procesar desde Respaldos. Un fallo al guardar se muestra al usuario y no actualiza los saldos.

## Estructura preparada para crecer

- `src/model.js`: reglas, validación y cálculos, sin depender de la interfaz.
- `src/storage.js`: adaptador de persistencia. Puede sustituirse por una API con autenticación.
- `src/theme.js`: preferencia y persistencia del modo visual, independiente de los registros financieros.
- `src/report.js`: generación de PDF, cargada únicamente cuando se necesita.
- `src/app.js`: vistas y acciones.
- `src/style.css`: interfaz responsive, foco accesible y movimiento reducido.
- `tests/model.test.js`: cálculos y validación de datos.

La sincronización futura necesita autenticación, persistencia en servidor y un adaptador asíncrono de datos; esta versión no los simula.

## Seguridad y despliegues

Consulta `REVISION_SEGURIDAD.md` para el alcance, las correcciones y los límites de la revisión. `npm run test:security` sirve la compilación con las cabeceras de Vercel y prueba inyección de texto, CSP, descarga de PDF y guardados entre pestañas. Requiere antes `npm run build` y Google Chrome instalado.

Con el repositorio conectado a Vercel y `main` configurada como rama de producción, cada push dispara otro despliegue. Las cabeceras de `vercel.json` también se actualizan en ese despliegue. Es necesario esperar a que Vercel marque el nuevo commit como completado; el código antiguo sigue sirviéndose mientras se compila.
