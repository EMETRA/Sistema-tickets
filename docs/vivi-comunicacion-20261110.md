# Ajustes de VIVI en el Panel

El editor de noticias incorpora una referencia opcional y latitud/longitud pareadas. Primero ejecutar la migración `api-portal/sql/noticias/05_ubicacion_noticias.sql`, actualizar api-portal y api-tickets; después desplegar este frontend. No editar ubicación contra una versión anterior de esas APIs.

JUZ01 permite buscar desde seis caracteres del código y seleccionar entre coincidencias con placa antes de consultar el detalle. Se mantiene la comprobación de acceso al abrir el formulario y los permisos del servidor; nunca se elige un caso automáticamente por similitud.

Pruebas: tipos, integración, compilación y navegador con backends controlados para el CMS y el flujo judicial. La guía de aceptación en dispositivos/Oracle está en `api-vivi_v2/docs/CAMBIOS_GERENCIA_20261110.md`.
