# Accesibilidad verificada automáticamente

El Panel lo usan personas de todas las edades. Estas comprobaciones evitan que una pantalla nueva
pierda contraste, nombres accesibles o manejo con teclado.

## Pruebas de extremo a extremo (Playwright + axe)

```bash
pnpm e2e:instalar   # una vez: Chromium para Playwright
pnpm e2e            # levanta el laboratorio si hace falta y ejecuta e2e/
```

- `e2e/accesibilidad.spec.ts`: cada pantalla principal (Administración y Usuario) debe cumplir
  **WCAG 2.2 AA** en tema claro y oscuro, y con alto contraste + letra muy grande.
- `e2e/experiencia.spec.ts`: letra muy grande sin desbordes, modo oscuro sin destello al cargar,
  recorrido guiado con teclado, «Unirse a la reunión» y mensajes de validación.
- Excepción documentada: los huecos de «crear actividad» del calendario semanal (WCAG 2.5.8,
  «equivalente»: el botón «Crear actividad» hace lo mismo con un objetivo grande).

## Storybook

El complemento **Accessibility** (axe) muestra los problemas de cada historia. La barra permite
revisar Tema, Texto y Contraste. Hoy está en modo `todo` (avisa sin bloquear); cambiar a `error` en
`.storybook/preview.tsx` cuando las historias heredadas estén corregidas.

## Reglas que ya aplicamos

- Texto ≥ 4.5:1 sobre su fondo en ambos temas: `--tickets-text-muted` y `--tickets-text-secondary`
  se ajustaron; los fondos azules con texto blanco usan `--tickets-primary-fill`.
- Nada de `opacity` para «apagar» elementos con texto (actividades pasadas, sistemas sin monitoreo):
  se usan colores secundarios legibles.
- Iniciales de avatar en blanco u oscuro según el color de fondo (`avatarInk`).
- El tema y la letra se aplican antes del primer pintado y las transiciones se habilitan después
  (`ThemeAttributes`), para que el modo oscuro no «destelle».
- Nombres accesibles = texto visible (calendario semanal, mapa de red con `<desc>` para el tipo).
