# Fallos de estadísticas y actividad después del login

Las rutas `/api/my-stats` y `/api/my-activity` conservan los errores de sesión
y permisos (401/403). Un fallo de Tickets devuelve 502 con mensaje público y
referencia, sin SQL, variables, stack ni mensaje Oracle. El servidor registra
`PANEL_INICIO_FALLIDO`, operación, referencia y códigos ORA para correlacionar.

El inicio muestra el fallo y permite reintentar actividad/reporte, en lugar
de presentar un reporte vacío como si la consulta hubiese funcionado.
La actividad se consulta una vez desde su hook al montar el inicio y respeta
el límite pedido, entre 1 y 100. El resto del inicio conserva su diseño.

ORA-00942 sigue requiriendo resolver el objeto/esquema/grant real en Oracle.
Tickets usa DATABASE_SCHEMA (predeterminado ADEMETRAEMPLEADO) para sus
tablas TB_TICKET, historial, estados, categorías y prioridades. Ejecutar
`test/qa/diagnosticar-inicio.cjs` en el contenedor de Tickets; es solo lectura.
No sustituir el fallo por ceros ni crear tablas/roles de forma automática.

Validar con la sesión real después de corregir el acceso a Oracle. Las
pruebas locales del BFF verifican mensajes/estados, límite y reintento;
no demuestran que los objetos existan o sean accesibles en eme02.
