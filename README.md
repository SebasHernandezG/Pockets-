# Pockets

Una web sencilla para administrar ingresos y gastos en **colones costarricenses (CRC / ₡)**, pensada primero para celular.

## Qué hace

- Crea un registro independiente por cada ingreso: salario, beca u otro pago.
- Registra gastos de Transporte, Gustos, Comida, Alquiler, Deudas, Servicios y Ropa.
- Calcula el total gastado, saldo disponible y distribución por categoría. Trabaja con céntimos para evitar errores al sumar decimales.
- Permite editar o eliminar gastos del registro abierto.
- Al agregar un nuevo ingreso, cierra el anterior, descarga su PDF y conserva el historial.
- El PDF incluye mes de inicio, rango de fechas, ingreso, gráfico circular, montos por categoría, cada gasto, total y saldo. Los informes largos tienen varias páginas.
- Descarga y restaura respaldos JSON. Los registros cerrados se consultan sin modificarlos.

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

**Descarga un respaldo periódicamente.** Borrar los datos del navegador, cambiar de dispositivo, usar modo privado o cambiar el dominio de la web puede hacer que los registros dejen de estar disponibles. Los datos de la vista local no se transfieren al dominio publicado: usa un respaldo para trasladarlos. El PDF es un informe; el JSON es el respaldo que se puede restaurar.

Si un registro local no puede leerse, la app lo conserva sin sobrescribirlo y permite descargarlo sin procesar desde Respaldos. Un fallo al guardar se muestra al usuario y no actualiza los saldos.

## Estructura preparada para crecer

- `src/model.js`: reglas, validación y cálculos, sin depender de la interfaz.
- `src/storage.js`: adaptador de persistencia. Puede sustituirse por una API con autenticación.
- `src/report.js`: generación de PDF, cargada únicamente cuando se necesita.
- `src/app.js`: vistas y acciones.
- `src/style.css`: interfaz responsive, foco accesible y movimiento reducido.
- `tests/model.test.js`: cálculos y validación de datos.

La sincronización futura necesita autenticación, persistencia en servidor y un adaptador asíncrono de datos; esta versión no los simula.
