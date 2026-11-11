# Casos y fuentes técnicas

La actualización coordinada de api-tickets/Panel admite búsquedas desde tres caracteres (incluidos seis o el código completo) para buscar casos. Los resultados muestran placa, código, estado y fecha en una tabla adaptada a móvil. El botón «Ver caso» abre únicamente el caso seleccionado, conservando el permiso judicial existente.

En «Aplicaciones y sistemas», administración puede buscar esquemas disponibles en Oracle y repositorios autorizados en GitHub, y vincularlos mediante el editor existente con dos confirmaciones. Los vínculos mantienen sus permisos y alcance; los catálogos globales de fuentes requieren `TICKETS_ADMINISTRAR` también en el API. No se requieren tablas nuevas ni cambios en api-autenticacion.

Actualizar **primero api-tickets** y después este frontend. GitHub necesita una credencial de lectura configurada en eme02; no se guarda en el navegador. La guía completa, comandos y permisos mínimos están en `api-tickets/docs/plataforma/CASOS_Y_FUENTES.md`. El asistente `scripts/plataforma/configurar-github.py` se ejecuta en ese repositorio y no necesita Node en el host.

Pruebas: permisos en API, proxy autenticado, filtros y límites de fuentes, configuración privada, validación de prefijos de tres/seis caracteres y código completo y navegadores con datos ficticios. La conectividad con la organización y la visibilidad institucional de Oracle deben confirmarse en el servidor después de configurar la credencial.

La búsqueda resalta el prefijo y muestra estados legibles. La recepción distingue carga, error y catálogo de juzgados vacío; solo muestra el formulario cuando existe un juzgado activo y selecciona el único disponible, sin guardar automáticamente. La confirmación identifica caso, placa, juzgado y referencia. La bitácora vacía ofrece una explicación y las actuaciones con datos se adaptan a móvil. «Actualizar estado» conserva la identidad de envíos inciertos.

Actualizar api-tickets antes del Panel para habilitar el mínimo de tres caracteres y el código público de búsqueda amplia. Validación local: compilación de producción y Chromium con API simulado, casos de tres/seis caracteres/código completo, vacío, límite, recepción, reintento con requestId estable, resolución y documento independientes.
