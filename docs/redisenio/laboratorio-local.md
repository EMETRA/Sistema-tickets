# Probar Sistema Tickets fuera de la oficina

El laboratorio ejecuta el **Panel real** contra un **API simulado local** con datos ficticios y persistencia en JSON. Solo necesita el repositorio Sistema-tickets y sus dependencias; las APIs de la oficina, Oracle, SMTP, SAT y Docker no son necesarios para este recorrido.

## Iniciar en tu Mac

Usar Node 24 y pnpm 8.15.0, como el proyecto. Con conexión a Internet, actualizar la rama e instalar las dependencias una vez:

```bash
cd Sistema-tickets
git fetch origin
git switch feat/redisenar_sistema_tickets
git pull --ff-only
pnpm install --frozen-lockfile
pnpm laboratorio
```

Abrir **http://127.0.0.1:3030/__laboratorio**. La primera compilación puede tardar unos segundos. Seleccionar uno de los siete perfiles; no se piden contraseñas institucionales. El selector crea una sesión ficticia para recorrer el Panel: **no verifica el inicio de sesión, JWT ni recuperación reales**.

Después de instalar, el laboratorio funciona sin conexión a la oficina. Para las pruebas no hace falta copiar un `.env` de producción ni certificados o credenciales. El iniciador dirige los contratos admitidos hacia loopback; las integraciones fuera de cobertura muestran un error explícito y el navegador restringe las conexiones externas. Abrir siempre la dirección impresa con `127.0.0.1`.

El laboratorio utiliza tres puertos consecutivos: 3030 para la entrada, 3031 para Next y 3032 para los mocks. Si alguno está ocupado:

```bash
TICKETS_LAB_PORT=3130 pnpm laboratorio
```

No detiene procesos ajenos. Para cerrarlo, pulsar **Ctrl+C** en su terminal. El código de control y sus rutas están en `scripts/laboratorio`; no se agregaron endpoints de acceso alternativo al producto desplegado.

## Perfiles y recorridos

Todos los usuarios, equipos, números de inventario y registros iniciales son ficticios. Las cuentas comparten el mismo archivo de datos para poder cambiar de rol y continuar un flujo.

| Perfil | Recorrido sugerido |
| --- | --- |
| Usuario / Analista | Crear un ticket sin adjuntos, consultar sus solicitudes y conversar en el mismo ticket. Consultar su calendario y operaciones ficticias en aplicaciones. |
| Secretaría | Abrir la bandeja de asignación y asignar el ticket al Técnico. Revisar ejemplos sin primera atención. |
| Técnico | Iniciar y resolver el ticket asignado. Registrar instalaciones, activos, visitas/mantenimientos, bajas/salidas. Revisar dispositivos, puertos, enlaces y guardar posiciones. |
| Jefatura | Revisar calendario y métricas de su equipo, crear actividades privadas/de equipo y registrar una solicitud de acceso o de cuenta nueva. |
| Administración | Aplicar las dos confirmaciones, revisar y aprobar solicitudes, gestionar perfiles/roles/permisos, copia de accesos, inventario y trazabilidad. |
| Desarrollador | Registrar aplicaciones, repositorios, despliegues e incidentes. Consultar objetos de un esquema simulado. |
| DevOps | Consultar recursos, contenedores y logs **simulados**. No se consulta Docker, SSH ni servidores reales. |

Los documentos de fichas técnicas admiten PDF/JPEG/PNG de hasta **2 MB** en este laboratorio. Se guardan únicamente en el archivo local y respetan el alcance del perfil de prueba. Los adjuntos del ticket heredado y sus etiquetas quedan fuera de esta simulación.

Las cuentas nuevas aprobadas son ficticias y muestran `SIMULADA_SIN_ENVIO` en la invitación. No se ejecuta SMTP ni se crea una cuenta en Auth. Las cifras de infraestructura, objetos Oracle y eventos iniciales también son ejemplos, identificados por la franja visible del laboratorio.

El catálogo de las aplicaciones institucionales permanece vacío en este entorno. Noticias, Juzgado y los procesos de los módulos heredados requieren sus servicios; no se devuelven resultados de publicación, notificación o resolución falsamente exitosos. Sus pruebas automáticas con contratos controlados siguen disponibles en `test/integracion`.

## Datos, reinicios y fallos simulados

Los cambios se guardan en **`.laboratorio/estado.json`**, excluido de Git. Detener y volver a iniciar conserva registros, archivos, conversaciones y el historial de esta simulación. Volver a seleccionar un perfil al iniciar una nueva sesión.

En la franja **LABORATORIO · DATOS FICTICIOS**, abrir **Cambiar perfil / controles**:

- Cambiar de usuario para seguir el mismo ticket o solicitud desde otra responsabilidad.
- Preparar un fallo 503 en la próxima lectura de fichas, métricas o tickets. El inicio también consulta esos recursos; permite comprobar su botón Actualizar.
- Restaurar los datos ficticios. Pide confirmación y reinicia únicamente este archivo local; cierra las sesiones del laboratorio.

No colocar información personal ni evidencias reales en los ejemplos. Los datos locales no se sincronizan con QA ni con producción. Solo ejecutar una instancia por copia del proyecto.

Next utiliza `.next-laboratorio` y `tsconfig.laboratorio.json`, separados del build habitual. El iniciador no cambia `.env`, Compose, montajes ni las variables de la terminal que lo llamó.

## Qué permite concluir una prueba

| Modalidad | Qué permite revisar | Qué queda pendiente |
| --- | --- | --- |
| Este laboratorio | UX, navegación, formularios, intercambio entre perfiles, mensajes, confirmaciones, persistencia de ejemplos y recorridos de tickets/recursos. | SQL, grants, Oracle, autenticación real, precisión de métricas de una fuente real y efectos externos. |
| APIs reales + Oracle Free en un contenedor aislado | DDL, restricciones, grants, consultas y transacciones contra Oracle, tras preparar sus esquemas y datos ficticios. | Conectividad y contratos de los servicios institucionales. |
| QA institucional | Integración final con cuentas, datos y servicios autorizados. | Validación operativa posterior al despliegue. |

Los mocks implementan una aproximación de los permisos y reglas para que el flujo tenga sentido. **Sus resultados no certifican la autorización ni las transacciones del API real.** Repetir un comando confirmado no duplica el ejemplo, se comprueban versiones y se conserva el historial local; esos mismos controles tienen sus pruebas independientes en api-tickets.

Un contenedor secundario de Oracle es viable, pero requiere preparar también los contratos legados de ADMAUTEMETRA, ADEMETRAEMPLEADO y RRHH que usan las dos APIs, además de las 29 tablas nuevas. Crear solamente las tablas nuevas deja incompleto el arranque. La imagen de Oracle debe ser compatible con la arquitectura de la Mac y los recursos disponibles. No reemplazarlo por SQLite/PostgreSQL para dar por validado el SQL Oracle. Ese contenedor todavía no forma parte de este laboratorio.

## Verificación automatizada

```bash
node --test test/integracion/laboratorio.test.cjs
pnpm typecheck
pnpm test:integracion
```

Las pruebas del adaptador comprueban persistencia, alcance, confirmaciones ligadas al contenido, idempotencia, conflictos de versión, asignación/atención/resolución, puertos, aprobación simulada, documentos y fallos. Para los recorridos completos del navegador se utiliza Next real con datos controlados.

Con el laboratorio iniciado y Chromium de Playwright disponible, `node test/integracion/laboratorio-browser.cjs` recorre creación/asignación/resolución entre perfiles, las 12 secciones, ambas confirmaciones y el alcance del calendario. Agrega ejemplos al archivo ficticio actual; no lo reinicia.
