# Panel judicial conectado a DEN09

JUZ01 conserva las vistas del Panel y consulta el caso real por código. Muestra
estados de caso/expediente, evidencias privadas, sede, actuaciones, resolución
y remisión institucional. Fechas UTC se presentan en America/Guatemala. No
inventa monto, pago ni identidades históricas: la bitácora identifica al actor.

Usa exclusivamente permisos VIVI_JUZGADO_CONSULTAR, RECIBIR y RESOLVER de
la sesión. Recepción exige sede activa y confirmación de papelería presencial;
actuación exige observación; resolución exige fundamento y confirmación.
Tickets obtiene actor, autoridad y fecha. Los inputs conservan requestId,
claveIdempotencia y versión ante respuesta incierta. Consultar estado actual
permite preparar otra solicitud después de leer el resultado autorizado.

El PDF tiene un reintento independiente de la resolución. La plantilla sigue
identificada como borrador técnico. El BFF `/api/JUZ01` permite solo rutas
judiciales conocidas, reenvía Bearer y no incluye tokens en URLs.

Un perfil fallido no establece la sesión. El formulario muestra una referencia
y el servidor registra PANEL_PERFIL_FALLIDO con estado/códigos ORA. Se conserva
el bloqueo de doble envío y la desactivación temporal de Turnstile acordada.

Validación local: contratos/adaptador/CMS, producción Next y navegador con
`node test/integracion/juzgado-browser.cjs`: perfil 502 sin sesión parcial,
recepción 503/reintento, doble clic, NO_ACOGIDA, PDF independiente, Bearer y
permisos vacíos. No prueba Oracle ni JWT real de eme02. Configurar Chromium
con QA_CHROMIUM_PATH y capturas con QA_SCREENSHOT_DIR. Las fixtures son QA.
