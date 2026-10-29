# JUZ01: consulta del caso y análisis IA

El detalle organiza placa, estado, código y fecha en un resumen; navegación por
denuncia, análisis, defensa y actuaciones; tarjetas diferenciadas y presentación
adaptable. Las acciones de recepción/resolución quedan después de las evidencias
y la defensa. Se conservan permisos, idempotencia y confirmación de resoluciones.

Las fotografías y videos se abren en un diálogo mediante la ruta autenticada
existente. No hay URL pública ni JWT en parámetros. Se revocan URL blob al cerrar,
se cancelan peticiones al desmontar y solo se previsualizan PNG/JPEG/MP4 con MIME
coincidente. También se permite descargar.

El análisis muestra el resultado guardado y aporte por archivo, limitaciones,
versión/modelo/fechas y modo de observación histórico. No vuelve a ejecutar IA,
no rellena criterios no evaluados ni convierte su clasificación en resolución.
La defensa y la denuncia siguen visibles si el análisis devuelve error de consulta.

## Despliegue

Primero actualizar api-vivi_v2, permisos de consulta y api-tickets según
`docs/ANALISIS_IA_JUZGADO_20261029.md` de api-tickets. Después, desde la carpeta
desplegada del Panel:

```bash
git pull --ff-only origin Dev
python3 /root/api-vivi_v2/scripts/actualizar-servicio-preservando.py sistema-tickets-web --comprobar
python3 /root/api-vivi_v2/scripts/actualizar-servicio-preservando.py sistema-tickets-web
```

La rama de integración de este repositorio es **Dev**; las APIs usan **QA**.
Usar el nombre real del contenedor si el despliegue lo cambió. El actualizador
conserva el proyecto, archivos Compose, montajes y redes/alias actuales. No usar
`down` ni eliminar volúmenes.

## Comprobaciones

Prueba en navegador con backend controlado: análisis V5 complementario, fotografía
privada, Bearer, permisos, recepción con error/reintento, resolución y PDF
independientes, escritorio y móvil. Typecheck, compilación Next e integración.
No se usó una cuenta real ni se modificó un expediente de eme02.
