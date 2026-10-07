/**
 * Query GraphQL (api-tickets) con los permisos del usuario de la sesión.
 * README "Noticias CMS" (2026-10-07), sección 2: `usuario` devuelve `permisos`, con los mismos
 * códigos que exige el backend. Sirve solo para mostrar u ocultar botones: el backend vuelve a
 * verificar en cada operación.
 *
 * Pide únicamente `permisos` para no depender de los demás campos de `usuario` (el README los
 * muestra como `id`/`correo` y el login usa `id_usuario`/`email`; pendiente con backend).
 */
export const GET_PERMISOS_NOTICIAS_QUERY = `
  query PermisosNoticias {
    usuario {
      permisos
    }
  }
`;
