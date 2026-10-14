# Verificación de la primera versión

Se comprobó la interfaz construida con datos ficticios; la web comienza sin datos.

- Pruebas de dominio: sumas exactas con céntimos, saldo negativo, montos y fechas inválidos, rechazo de edición en períodos cerrados, respaldo válido y rechazo de duplicados.
- Prueba en Chrome: primer ingreso, gastos en las siete categorías, edición, eliminación, recarga, nuevo ingreso y descarga automática de PDF, historial cerrado de solo lectura, respaldo y restauración.
- Diseño: capturas de 390px y 1440px. Prueba sin desbordamiento horizontal a 320px con monto máximo y detalle largo.
- PDF: informe normal renderizado e inspeccionado; gráfico circular, siete categorías y total en una página. Informe de 85 gastos con detalles largos paginado en ocho páginas, última página inspeccionada.
- Datos corruptos: el contenido local original permanece disponible sin sobrescribirse.
- Producción: compilación de Vite, operación real con saldo negativo y descarga de PDF desde los archivos compilados.
- Auditoría de dependencias: sin vulnerabilidades reportadas por npm audit.
- Revisión de interfaz: dirección visual aprobada conservada; contraste de placeholders corregido a más de 4.5:1.
- Modo oscuro: teclado Enter/Espacio, foco conservado, `aria-pressed`, preferencia persistente, preferencia del sistema y encabezado a 320px.
- Auditoría automatizada axe: sin violaciones en las vistas y formularios probados en claro y oscuro, reglas WCAG 2 A/AA y 2.1 AA. Se espera al final de las transiciones antes de medir.

## Repetir las verificaciones

```sh
npm test
npm run build
```

Para el flujo en navegador, abre `npm run dev -- --port 5173` en otra terminal y ejecuta `npm run test:browser`. Requiere Google Chrome instalado. Los resultados se escriben en `qa/`, que no se sube al repositorio.

Para probar la compilación, abre `npm run preview -- --port 4173` y ejecuta `node tests/production.mjs`. Puede usarse `POCKETS_TEST_URL` para otra URL. Ese script crea datos de prueba en una sesión aislada del navegador.

Para modo oscuro y accesibilidad automatizada, con el servidor de desarrollo en 5173, ejecuta `npm run test:theme`.

Estas verificaciones cubren Chrome de escritorio y tamaños móviles emulados. No sustituyen pruebas físicas en iOS/Android ni una evaluación completa con lectores de pantalla.
