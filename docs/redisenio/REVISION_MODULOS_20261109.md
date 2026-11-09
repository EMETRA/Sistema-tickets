# Revisión de aplicaciones del Panel — 9 de noviembre de 2026

La referencia visual de consulta de vehículos es P42 de la presentación aprobada
(revisión 3): parámetros y resultado en una tarjeta, resumen lateral y acciones.
Se sustituyeron las tarjetas de métricas por campos de lectura que se ajustan al
contenido. La consulta conserva los parámetros si SAT falla y muestra qué uso y
placa corresponden al resultado. Los datos de las capturas son ficticios.

## Correcciones verificadas

| Módulo | Hallazgo y ajuste |
| --- | --- |
| Vehículos SAT | Composición P42, campos agrupados, resumen, validación y reintento. El API decodifica entidades XML restantes en los textos de SAT, preservando ceros iniciales y sin interpretar HTML. |
| Visa de nómina | La ruta buscaba `response.data.visaNominaExportExcel`, aunque el cliente ya entregaba `response.visaNominaExportExcel`. Se corrigió la descarga y se retiraron las alertas de simulación. |
| Reporte general RRHH | Se corrigió el título que decía «Tareas completadas», se añadió reintento de catálogos y validación visible. Admite fechas opcionales en pareja, como el API. Los filtros y campos elegidos se conservan ante un error. |
| Funciones por usuario | Los hooks esperaban otro objeto alrededor de los catálogos/permisos y mostraban selectores vacíos. El botón Copiar solo simulaba éxito: ahora consulta/guarda/copia mediante las operaciones existentes del API, con confirmaciones y éxito únicamente tras respuesta confirmada. |
| Anulados | Se corrigieron los sobres de respuesta de tipos, consulta y Excel y los hooks que usaban `fetch` sin Bearer, causando 401. Ahora utilizan el cliente autenticado común. Se valida el orden de fechas antes de consultar. |
| Manuales | Se corrigió el sobre de respuesta de manual individual y lista disponible; agrupados/categorías ya usaban el contrato correcto. |
| Exportar reporte semanal | El botón solo escribía en consola. Ahora filtra reportes existentes y descarga el Excel de un reporte seleccionado, sin inventar un exportador por rango que el API no ofrece. |
| Reporte guardado | Un acceso directo mostraba éxito sin reporte y siempre pintaba VERDE. Ahora exige resultado confirmado, utiliza su estado real y las observaciones guardadas. |
| Procesos LPR | Los errores ya son visibles, conservando parámetros y evitando un segundo envío mientras el primero está en curso. |
| Notificar documento | El fallo de envío se muestra también en la vista previa; conserva datos/PDF, bloquea duplicados mientras está enviando y no registra el resultado privado en consola. |

Las rutas BFF de MOD01/04/05/06/07/08 devuelven errores correlacionados con una
referencia, conservan la distinción entre sesión expirada (401), falta de permiso
(403) y fallo de consulta (502), y no muestran SQL, respuestas internas ni stack.
Los diagnósticos del servidor usan `PANEL_MODULO_FALLIDO`, operación y códigos.

## Recorridos y límites

Se mantiene el manifiesto de 16 módulos. MOD01, los dashboards por proyecto y
colaborador, Comunicación y Juzgado conservan sus rutas e integraciones existentes.
La regresión general recorre los 16 módulos; las pruebas de CMS y Juzgado siguen
separadas. La revisión de contratos administrativos abarca 29 documentos GraphQL,
incluidas las dos operaciones de funciones incorporadas al formulario.

**MOD13 — búsqueda por nombre sigue pendiente de integración.** Su código anterior
devolvía un resultado ficticio y un supuesto diagnóstico Oracle. Se retiró esa
simulación y se ofrece la consulta SAT por placa. No se implementó una consulta
SQL contra tablas de multas sin su contrato real; este punto no está cerrado.

Las pruebas no consultan Oracle, SAT institucional, SMTP ni datos de empleados.
Por tanto, no certifican catálogos reales, privilegios Oracle, certificados o
disponibilidad de servicios en eme02. ADMINSIAF y los datos de empleados conservan
sus propietarios actuales. No se requiere crear o modificar tablas.

## Pruebas reproducibles

Con ambos repositorios disponibles, instalar sus dependencias de desarrollo y:

```bash
# En api-tickets: metadatos reales de Nest, sin iniciar servicios ni conectar DB.
node scripts/validar-contrato-panel.cjs --panel=../Sistema-tickets
npm test -- --runInBand
npm run build

# En Sistema-tickets:
npm run typecheck
node --test test/integracion/*.test.cjs
npm run build -- --webpack
node test/integracion/modulos-browser.cjs
node test/integracion/redisenio-browser.cjs
```

`modulos-browser.cjs` genera el esquema a partir del código de `api-tickets`,
valida consultas y variables contra ese esquema y utiliza servicios ficticios
con Next y sus BFF reales. Comprueba descargas de nóminas/RRHH/anulados/semanales,
catálogos y consulta/guardar/copiar permisos, dos confirmaciones administrativas,
manuales, fallos/reintentos y adaptación de SAT a 1440/1024/390 píxeles.
`TICKETS_API_SOURCE` permite indicar otra ubicación del repositorio del API.

## Configuración que debe conservarse en eme02

No se amplían permisos ni se activan bypass. RRHH valida perfiles autorizados por
`MOD05_ROLES_RRHH` / `MOD05_ROLES_RRHH_IDS`; las escrituras de permisos corporativos
validan `MOD06_ROLES_ADMIN` / `MOD06_ROLES_ADMIN_IDS`. Ser administrador del Panel
no sustituye automáticamente estas autorizaciones. Si se recibe 403, comprobar
estas listas con los responsables y conservar sus entradas existentes.

La auditoría de funciones utiliza la tabla existente de
`ADMEMETRAAUDITORIA.TB_BITACORA_FUNCIONES_USUARIO`. Guardar/copiar y su bitácora
usan la misma transacción y conexión: un fallo de auditoría revierte la escritura.
El API ya no devuelve éxito sin esa bitácora cuando está habilitada.

Integrar primero la PR del API hacia QA y después la del Panel hacia Dev; usar
el actualizador `scripts/actualizar-servicio-preservando.py` de cada repositorio
con el nombre real de su contenedor. La actualización de servicios debe conservar
los Compose, certificados, redes y montajes actuales. Estas PR no despliegan.
