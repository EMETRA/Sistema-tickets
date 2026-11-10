# Personal de RRHH y acceso previo a formularios

Requiere el API con `GET /platform/module-access/:id` y la nueva respuesta de `organization/preview`. Actualizar primero api-tickets y después este Panel, conservando sus montajes. No requiere tablas nuevas ni concede permisos automáticamente.

## Equipos y responsables

En `/espacio/organizacion`, Informática usa **Preparar desde RRHH**. La vista previa incluye todo el personal activo aunque aún no tenga cuenta de Tickets. El listado permite buscar por nombre, código, puesto o unidad; filtrar personas sin cuenta o con unidad pendiente, y paginar de 25 en 25. Los nombres y puestos proceden de RRHH.

Si falta una unidad, muestra su código y **Nombre pendiente**, conserva las asignaciones anteriores de esa persona y permite revisar el resto. Un nombre de puesto no concede permisos ni crea una cuenta. Para que una persona se incorpore como miembro necesita una cuenta habilitada vinculada por empresa y código de empleado. Se avisa si la cuenta que consulta no tiene ese vínculo.

La generación conserva sus dos confirmaciones, la comprobación de la huella y el historial. Un cambio en RRHH entre preparación y confirmación devuelve conflicto; se conserva la vista previa para revisarla y prepararla nuevamente.

En la base QA comprobada, la asignación programática devuelve 11 códigos de unidad de 2026 para 1,142 empleados; el catálogo de nombres de la empresa 97 solo tiene años hasta 2018. Falta obtener el catálogo vigente, previsto para la siguiente revisión. Mientras tanto, el personal se puede consultar con unidad pendiente; no se inventan equipos ni se copian nombres históricos. El API incluye `sql/tickets/qa/diagnostico_equipos_rrhh.sql`, de solo lectura, para comprobar la cobertura después de la carga. No se requiere migrar empleados de ADMINSIAF.

## Formularios y acciones

La página no monta el formulario ni sus peticiones de catálogos hasta comprobar acceso con el API. Presenta espera, falta de permiso o un reintento si no pudo verificarlo. Las rutas directas también pasan por esa comprobación; la API continúa validando cada operación.

En **Personas y accesos → Funciones corporativas**, quien solo puede consultar no ve las opciones de guardar/copiar ni puede cambiar casillas. El catálogo del API filtra los módulos con la misma política. Los procesos que necesitan registrar exigen INSERTAR al entrar; ya no se ofrece un formulario que solo fallaría al ejecutarlo.

## Verificación local

```bash
npm run typecheck
npm run test:integracion
npm run build
node test/integracion/acceso-formularios-browser.cjs
node test/integracion/equipos-rrhh-browser.cjs
node test/integracion/modulos-browser.cjs
```

Los recorridos usan Next/BFF compilados, servicios y datos ficticios en loopback. Chromium comprueba acceso denegado antes de mostrar campos o llamar a catálogos, fallo de comprobación y reintento, revocación, solo lectura, personal sin cuenta, paginación, tamaños de pantalla y las dos confirmaciones de generación. No conectan a Oracle ni a los servidores institucionales.
