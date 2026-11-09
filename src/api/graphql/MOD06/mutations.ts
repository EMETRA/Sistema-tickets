export const GUARDAR_FUNCIONES_MUTATION = `
  mutation GuardarFunciones($input: GuardarFuncionesPorUsuarioInput!) {
    guardarFuncionesPorUsuario(input: $input) { success message totalPermisos bitacoraId }
  }
`;
export const COPIAR_FUNCIONES_MUTATION = `
  mutation CopiarFunciones($input: CopiarFuncionesPorUsuarioInput!) {
    copiarFuncionesPorUsuario(input: $input) { success message filasInsertadas bitacoraId }
  }
`;
