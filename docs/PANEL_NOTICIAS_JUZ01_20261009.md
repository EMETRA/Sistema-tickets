# Noticias y JUZ-01 — 9 de octubre de 2026

Actualizar primero api-portal/QA y api-tickets/QA, después Sistema-tickets/Dev.
El Panel ya no utiliza `API_PORTAL_URL`: lecturas, subidas y vistas previas de
Noticias usan el mismo backend de `GRAPHQL_ENDPOINT`. Tickets contacta Portal,
que conserva la creación CMS, fotos y volumen persistente.

El backend comprueba sesión y permisos de ADMAUTEMETRA. La clave interna de
Portal se configura solo entre APIs y nunca se envía al navegador.

JUZ-01 busca por código de denuncia, como `QA-E0910D-PDF_P`. Si no hay juzgados
activos, muestra un aviso y bloquea la recepción. Un fallo del catálogo permite
reintentarlo sin ocultar el caso. La sede elegida muestra dirección/horario y
el expediente recibido muestra esos datos y su referencia interna.

La referencia interna es opcional: la asigna el juzgado al expediente físico.
Puede quedar vacía si todavía no existe. El código del caso sigue siendo el
identificador para la búsqueda.

Procedimiento, certificados y SQL de sedes:
[documentación de api-tickets](https://github.com/EMETRA/api-tickets/blob/QA/docs/PANEL_CERTS_NOTICIAS_JUZ01_20261009.md).

Pruebas locales después del build, con backends controlados:

```bash
node test/integracion/cms.test.cjs
node test/integracion/juzgado.test.cjs
node test/integracion/cms-bff-browser.cjs
node test/integracion/juzgado-browser.cjs
```

No prueban la PDB ni los certificados reales del servidor.
