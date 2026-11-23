# Formulario de revisión PMT

Ubicación: Aplicaciones PMT → Formularios → Revisión PMT de Avísame (`/home/pmt/formularios/pmt-avisame`). El catálogo y los permisos provienen de api-tickets. Preparar el catálogo/permisos y la estructura PMT antes de habilitarlo; el BFF mantiene el token Bearer, confirmaciones administrativas y respuestas privadas sin caché.

La bandeja filtra pendientes, en revisión, con multa y descartados; busca por prefijo del código o placa y pagina de 30. Un reporte muestra placa, fecha/hora/lugar declarados, referencia, observaciones y evidencias. El mapa externo recibe solo el punto; los archivos se descargan por BFF autenticado y se muestran con object URLs revocadas al salir. No se publica la URL privada del archivo ni la identidad del denunciante.

El agente toma una reserva de 15 minutos y puede renovarla o devolver el caso. Para decidir debe tener reserva propia vigente, confirmar cada evidencia y fundamentar la decisión. Imponer requiere además el permiso específico y configuración de emisor. El API controla concurrencia, versión, estado y autoridad; el navegador no envía identidad de empleado/agente.

El servidor puede habilitar la corrección de placa/infracción, conservando lo originalmente reportado. Si no está habilitada, esos datos no se envían como modificaciones. Una respuesta incierta conserva el fundamento, bloquea repetir la decisión e invita a consultar el estado actual. El recibo y requestId existentes evitan duplicar la multa. USER_ADMIN usa el mismo circuito de dos confirmaciones del resto de la plataforma.

La confirmación de multa aclara que entrará al procedimiento ordinario de notificación. La plantilla de correo y cédula PDF son las de las demás multas; las evidencias se agregan como adjuntos.

Prueba de navegador: `test/integracion/vivi-pmt-browser.cjs` con API/archivo ficticios, autorización previa, reserva, evidencia privada, decisión y recuperación de respuesta perdida sin duplicar; tamaños 1440, 1024 y 390. No conecta a Oracle, SAT ni SMTP. La aceptación institucional y decisiones de configuración quedan para QA.

El bootstrap comprueba `evidenciasConfiguradas`. Si es falso, se puede revisar/descartar, pero imponer queda bloqueado con un mensaje de almacenamiento pendiente. La respuesta de decisión y el expediente muestran `publicacionEvidencias` de forma separada: una multa MULTADA conserva su número aunque la copia siga PENDIENTE/EN_PROCESO. El API reintenta la copia con el mismo manifiesto; el botón Consultar estado actual solo lee el estado. PUBLICADO confirma la copia al archivo de la remisión; NO_PROGRAMADA solicita revisar un registro sin trabajo de copia. Ninguno de estos estados certifica entrega del correo.
