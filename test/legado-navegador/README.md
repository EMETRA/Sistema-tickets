# Pruebas de navegador del diseño anterior

Estos scripts verifican pantallas del diseño previo al «Panel institucional» (Inicio por rol con
«Control de Informática», «Acciones recientes», el interruptor `panel_propuesta`, etc.), que se
retiró cuando el nuevo diseño pasó a ser el único.

Se conservan como referencia de los flujos que cubrían, pero **no** se ejecutan: sus selectores
ya no existen. La cobertura equivalente del diseño actual está en `e2e/` (Playwright + axe):

| Script anterior | Cobertura actual |
| --- | --- |
| `fidelidad-browser.cjs` | `e2e/accesibilidad.spec.ts` (todas las pantallas, tema claro/oscuro) |
| `plataforma-browser.cjs`, `vistas-presentacion-browser.cjs` | `e2e/accesibilidad.spec.ts`, `e2e/experiencia.spec.ts` |
| `calendario-accesos-browser.cjs` | `e2e/experiencia.spec.ts` (calendario y reuniones virtuales) |
| `infraestructura-browser.cjs`, `aplicaciones-fuentes-browser.cjs` | `e2e/accesibilidad.spec.ts` (Activos, Red, Sistemas, Aplicaciones) |

Al migrar un flujo a `e2e/`, elimina aquí el script correspondiente.
