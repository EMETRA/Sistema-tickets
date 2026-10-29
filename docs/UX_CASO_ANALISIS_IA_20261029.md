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

Primero actualizar api-vivi_v2, permisos de consulta y api-tickets en el servidor
del backend. El servidor del front no necesita una copia de esos repositorios.
El actualizador se incluye en este repositorio, en
`scripts/actualizar-servicio-preservando.py`, y solo usa la biblioteca estándar
de Python 3.6 o posterior y Docker Compose v2 instalados en el servidor del front.

Desde la carpeta desplegada de **Sistema-tickets en el servidor del front**:

```bash
git pull --ff-only origin Dev
python3 scripts/actualizar-servicio-preservando.py sistema-tickets-web --comprobar
```

Si devuelve `CONFIGURACION_Y_MONTAJES_OK`, reconstruir y levantar el servicio:

```bash
python3 scripts/actualizar-servicio-preservando.py sistema-tickets-web
```

La confirmación final es `SERVICIO_ACTUALIZADO; montajes y redes conservados`.
La rama de integración de este repositorio es **Dev**; las APIs usan **QA**.
Usar el nombre real del contenedor si el despliegue lo cambió. El actualizador
conserva el proyecto, archivos Compose, montajes y redes/alias actuales. No usar
`down` ni eliminar volúmenes.

El script obtiene el proyecto, el servicio y todos los archivos Compose de las
etiquetas del contenedor existente; no necesita conocer las rutas del backend.
Si las rutas de los montajes resueltas por Compose difieren de las actuales,
se detiene antes de reconstruir o recrear. Corregir la configuración indicada
antes de volver a ejecutar. No cambiar al Compose base para evitar ese control.

Pruebas del actualizador, con Docker simulado y sin desplegar contenedores:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s test/despliegue -p '*_test.py' -v
```

## Comprobaciones

Prueba en navegador con backend controlado: análisis V5 complementario, fotografía
privada, Bearer, permisos, recepción con error/reintento, resolución y PDF
independientes, escritorio y móvil. Typecheck, compilación Next e integración.
No se usó una cuenta real ni se modificó un expediente de eme02.
