# Aplicaciones y fuentes reales

El catálogo de aplicaciones se valida en el API para cada sesión. Una navegación de página/RSC usa la cookie de sesión; las llamadas del navegador al BFF pueden usar Authorization. Una cabecera inválida no se sustituye por una cookie de otra identidad. Las respuestas se mantienen privadas y sin caché compartida.

El fallo al abrir `/home/comunicacion` se producía porque la lectura del catálogo en servidor exigía exclusivamente Authorization. La navegación ahora transmite la sesión existente. Los errores de consulta se muestran con reintento; un fallo de red no se convierte en una denegación de acceso ni en un catálogo vacío. Las aplicaciones ausentes del catálogo siguen denegadas. La respuesta de error del BFF no devuelve errores internos del proveedor ni credenciales.

**Infraestructura** consulta las observaciones recibidas de cada servidor y refresca la vista cada minuto mientras esté abierta y visible. El Panel no ejecuta comandos de Docker ni SSH. **Sistemas → Estado de repositorios** consulta rama, commit, comprobaciones y PR abiertos hacia la rama del vínculo seleccionado. Un commit de GitHub no certifica la versión desplegada en un servidor.

Para habilitar las fuentes reales, integrar primero el cambio de **api-tickets** con `GET /platform/repositories/:id`, registrar servidores/aplicaciones/repositorios y seguir [la guía de instalación de las fuentes](https://github.com/EMETRA/api-tickets/blob/QA/docs/plataforma/FUENTES_REALES.md). Requiere:

- Observador local configurado/programado por separado en consultan y eme02, UUID del servidor, clave exclusiva y base HTTPS del API accesible desde ambas máquinas.
- Credencial GitHub de solo lectura configurada únicamente en api-tickets para los repositorios necesarios. El Panel recibe metadatos autorizados, nunca esa credencial.
- Mantener el endpoint y montajes existentes del despliegue del Panel y actualizar con su script de preservación.

No requiere tablas nuevas ni cambios en api-autenticacion. Sin fuentes conectadas se muestra ausencia de datos/conexión; no se simula un estado real.

```bash
pnpm typecheck
pnpm test:integracion
pnpm exec next build --webpack
node test/integracion/aplicaciones-fuentes-browser.cjs
```

El recorrido usa Next compilado y fuentes locales ficticias. Incluye navegación desde Aplicaciones hacia Comunicación/Noticias y entrada directa con cookies, denegación de rutas ajenas, lectura de repositorios con comprobación fallida, ausencia de credencial, adaptación a móvil y reintento después de un fallo deliberado. No consulta GitHub real, Oracle ni los servidores institucionales.
