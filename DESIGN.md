---
name: Pockets
description: "Interfaz sencilla aprobada para mantener tus cuentas claras."
colors:
  background: "#f6f7f2"
  surface: "#fff"
  green: "#254d40"
  green-hover: "#183a2f"
  text: "#253c34"
  muted: "#657168"
  line: "#e1e6dc"
  focus: "#8da99a"
  available: "#edf3e5"
  available-text: "#526444"
  danger-background: "#fff0e9"
  danger-text: "#9a3327"
  subtle: "#eef4e9"
  subtle-hover: "#dfead7"
  nav-active: "#edf3e9"
  nav-hover: "#f1f5ed"
  outline: "#cdd8cd"
  outline-hover: "#a4b9a6"
  input-border: "#cdd6c9"
  status: "#f0f2ed"
  status-open: "#e9f1df"
  status-open-text: "#3d592e"
  transporte: "#527eae"
  gustos: "#b56d94"
  comida: "#d79945"
  alquiler: "#38796a"
  deudas: "#c96653"
  servicios: "#8c7bb1"
  ropa: "#849254"
  dark-background: "#131c18"
  dark-surface: "#1d2923"
  dark-green: "#bed3a8"
  dark-green-hover: "#d1e2c0"
  dark-text: "#e4ede5"
  dark-muted: "#abb8ac"
  dark-line: "#354337"
  dark-hover: "#28392d"
  dark-active: "#314435"
  dark-subtle-hover: "#3c5240"
  dark-primary-text: "#17231b"
  dark-input: "#17231d"
  dark-outline: "#728573"
  dark-outline-hover: "#91aa8c"
  dark-available: "#283e2f"
  dark-available-text: "#b7cbb0"
  dark-available-amount: "#d8e9cd"
  dark-divider: "#98a895"
  dark-status: "#314036"
  dark-status-open-text: "#c6ddba"
  dark-danger-background: "#402923"
  dark-danger-text: "#ffb5a5"
  dark-toast: "#c5d9b2"
  dark-selection: "#456441"
  dark-selection-text: "#f0f5eb"
  dark-scrollbar: "#657b60"
typography:
  headline:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "clamp(1.7rem, 4vw, 2.4rem)"
    fontWeight: 650
    lineHeight: 1.16
    letterSpacing: "-.035em"
  title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "1.16rem"
    fontWeight: 650
    lineHeight: 1.35
    letterSpacing: "-.025em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "1rem"
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: ".83rem"
    fontWeight: 550
  button:
    fontFamily: "DM Sans, sans-serif"
    fontSize: ".86rem"
    fontWeight: 600
rounded:
  surface: "14px"
  button: "9px"
  field: "8px"
  notice: "10px"
  status: "6px"
spacing:
  field-gap: "8px"
  form-gap: "18px"
  workspace-gap: "24px"
  section-gap: "28px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "11px 18px"
  button-primary-hover:
    backgroundColor: "{colors.green-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.green}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "11px 18px"
  button-outline-hover:
    backgroundColor: "{colors.nav-active}"
  button-subtle:
    backgroundColor: "{colors.subtle}"
    textColor: "{colors.green}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "8px 10px"
  button-subtle-hover:
    backgroundColor: "{colors.subtle-hover}"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    padding: "11px 13px"
    height: "47px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.surface}"
    padding: "24px 20px"
  navigation-active:
    backgroundColor: "{colors.nav-active}"
    textColor: "{colors.green}"
    rounded: "{rounded.field}"
  theme-toggle:
    backgroundColor: "{colors.nav-hover}"
    textColor: "{colors.green}"
    rounded: "{rounded.field}"
    width: "44px"
    height: "44px"
  theme-toggle-dark:
    backgroundColor: "{colors.dark-active}"
    textColor: "{colors.dark-green}"
    rounded: "{rounded.field}"
    width: "44px"
    height: "44px"
  status:
    backgroundColor: "{colors.status}"
    textColor: "{colors.muted}"
    rounded: "{rounded.status}"
    padding: "5px 9px"
  status-open:
    backgroundColor: "{colors.status-open}"
    textColor: "{colors.status-open-text}"
---

# Design System: Pockets

## Overview

**Creative North Star: "Interfaz sencilla aprobada"**

La dirección aprobada es sencilla y moderna: fondo claro cálido, superficies blancas y verde profundo. La interfaz se construye directamente en código; la implementación existente es la autoridad visual.

La densidad permite registrar un gasto y entender el saldo desde el celular. Las categorías se leen como filas de una hoja de gastos; el color acompaña nombres, cantidades y una leyenda.

**Key Characteristics:**
- Fondo cálido, blanco y verde profundo.
- Filas legibles y cifras tabulares.
- Navegación y controles adaptados al celular.

## Colors

### Primary

Verde profundo para marca, acciones principales y saldo disponible; su variante más oscura aparece al pasar sobre una acción principal. Los tintes verdes claros distinguen navegación activa, acciones sutiles y saldo sin competir con las cantidades.

### Secondary

Los siete colores de categoría corresponden a Transporte, Gustos, Comida, Alquiler, Deudas, Servicios y Ropa. Son identificadores constantes en filas, movimientos y gráfico circular; no sustituyen los nombres.

### Neutral

El fondo claro cálido enmarca superficies blancas. El texto verde oscuro lleva el contenido, el texto secundario explica fechas y estados, y los separadores suaves organizan las filas. Los tokens de error distinguen saldo negativo y mensajes de validación. El token de foco señala el control activo.

**The Category Context Rule.** Cada color de categoría se presenta con texto o una leyenda; las cantidades siguen disponibles en la lista.

### Dark mode

Los tokens con prefijo dark son la paleta normativa del modo oscuro aprobado. Se aplican con `data-theme="dark"` y `color-scheme: dark`: fondo verde casi negro, superficies verdes oscuras, texto claro y acciones verde claro. El texto de acciones principales se vuelve oscuro; campos y bordes reciben valores propios. Saldo, errores, etiquetas, foco y aviso de guardado conservan su jerarquía con variantes contrastadas. Los siete colores de categoría y la composición permanecen constantes.

## Typography

DM Sans con fallback sans-serif; se sirve localmente mediante las hojas de pesos 400, 500, 600 y 700. Los pesos intermedios declarados en CSS forman parte del estilo observado y el navegador los resuelve con esas fuentes.

El titular usa el rol headline y los encabezados de sección el rol title. Los rótulos de campos usan label; los botones usan button. El texto de párrafo tiene interlineado 1.6 y el texto secundario suele reducirse a .9rem. Las cifras de importes, los valores de resumen y los inputs numéricos utilizan cifras tabulares. No se fija un ancho global de lectura: los textos auxiliares de formulario y respaldo tienen límites de 70ch y 65ch respectivamente.

## Layout

Diseño mobile first con ancho mínimo de 320px. El contenedor principal se limita a 1112px, con relleno lateral de 20px; el encabezado tiene límite de 1160px. El espacio entre categorías y gráfico es de 24px, y entre el resumen y la siguiente sección de 28px.

En móvil, el resumen distribuye ingreso y gastado en dos columnas, con saldo a todo el ancho debajo. La navegación fija inferior muestra Mi registro, Historial y Respaldos e incluye el espacio seguro del dispositivo. Desde 700px, la navegación pasa al encabezado, el resumen se divide en tres columnas, los formularios usan dos columnas y el historial también. Desde 930px, categorías y gráfico comparten dos columnas, con una columna de gráfico de 316px. Por debajo de 360px se reduce el relleno y se apila el encabezado de categorías.

## Elevation & Depth

Las superficies se separan por tono, bordes suaves y una sombra ambiental discreta. La sombra compartida de secciones, resumen y listas es `0 6px 24px #203c3407`. El aviso de guardado usa `0 8px 30px #19362b29` para distinguirse como elemento temporal superpuesto.

Las acciones declaran transiciones de .18s ease-out; cuando el tema está aplicado, se limita transition-property a opacity, transform y border-color para evitar interpolar colores al cambiar de modo. El medidor cambia escala en .45s con cubic-bezier(.16, 1, .3, 1); el aviso de guardado cambia opacidad y desplazamiento en .2s ease-out. Se eliminan las transiciones y el desplazamiento suave cuando el usuario solicita movimiento reducido.

## Shapes

Las secciones y listas comparten esquinas suaves del token surface. Los botones usan button; los campos, la navegación y los botones de icono usan field. Los avisos usan notice y las etiquetas de estado status. Los puntos de categoría son círculos de 8px y el gráfico circular tiene 196px de lado. El sistema usa separadores de 1px para conservar la lectura de filas.

## Components

### Buttons

Acciones claras y compactas. Los botones principales son verdes con texto blanco y cambian a verde más oscuro al pasar el cursor. Los secundarios conservan el fondo transparente y un borde tenue; las acciones sutiles usan un tinte verde claro. Botones principales y secundarios tienen altura mínima de 46px; los sutiles y botones de icono, 44px. El foco tiene un contorno de 3px y separación de 3px. Los botones deshabilitados usan opacidad .55 y cursor de espera.

### Cards / Containers

Superficies blancas con radio compartido y sombra ambiental. Categorías y gráfico usan relleno de 24px 20px en móvil y 28px desde 930px. Formularios e historial usan 24px; los respaldos usan 28px 24px. El resumen recorta su contenido al radio exterior y destaca el saldo con un tinte verde claro; cambia a los tokens de error cuando es negativo.

### Inputs / Fields

Campos blancos de 47px de alto, borde tenue y relleno de 11px 13px. El marcador de posición usa el mismo token muted que el texto secundario, con opacidad 1. Importes usan prefijo de colones y cifras tabulares. Los errores se leen junto al formulario; el foco comparte el contorno visible del sistema. El editor de gasto aparece dentro de la sección de categorías.

### Navigation

Tres destinos persistentes: Mi registro, Historial y Respaldos. Icono sobre rótulo en móvil; icono junto al rótulo desde 700px. El destino activo usa texto verde, fondo claro y peso 650, con aria-current. El hover usa un tinte claro.

### Theme toggle

El encabezado incluye un botón nativo de icono de 44px, con nombre accesible estable «Modo oscuro» y `aria-pressed` true en modo oscuro, false en claro. Enter y Espacio activan el botón. El icono muestra luna en claro y sol en oscuro; el título describe el modo de destino. El foco sigue el contorno visible del sistema; en oscuro usa dark-green-hover.

La preferencia explícita se guarda como light o dark en `pockets.theme`. Sin valor válido, se usa la preferencia del sistema al cargar. Un script temprano en el encabezado aplica el tema antes de montar la interfaz para evitar un destello del modo incorrecto. Si el navegador bloquea el almacenamiento, el cambio sigue disponible y el mensaje de estado informa que no se guardó la preferencia.

### Status

Las etiquetas del historial distinguen Cerrado y En curso. Usan tipografía pequeña, esquinas suaves y fondo neutro; En curso usa fondo y texto verdes específicos.

### Summary and chart

El resumen siempre hace explícitos ingreso, gastado y saldo. El saldo negativo añade texto y color de error. El gráfico circular mantiene los colores de las siete categorías y su leyenda; las categorías con gasto nulo conservan su fila. Sin gastos se muestra un círculo vacío con explicación, sin datos ficticios.

## Do's and Don'ts

### Do:

- Do conservar el fondo cálido, las superficies blancas y el verde profundo aprobados.
- Do acompañar el color de categoría con nombre y cantidad.
- Do mantener el foco visible, los controles táctiles y el movimiento reducido.
- Do reflejar los estados vacíos y negativos con texto explícito.

### Don't:

- Don't cambiar la identidad aprobada al agregar pantallas.
- Don't introducir datos ficticios en estados vacíos.
- Don't depender únicamente del color para explicar gastos o saldo.
