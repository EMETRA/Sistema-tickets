export const codigosArchivo = [
  "ARCHIVO_ALMACENAMIENTO_NO_CONFIGURADO",
  "ARCHIVO_LECTURA_DENEGADA",
  "ARCHIVO_NO_DISPONIBLE",
  "ARCHIVO_TAMANO_INVALIDO",
  "ARCHIVO_INTEGRIDAD_INVALIDA",
] as const;
export class ArchivoJuzgadoError extends Error {
  constructor(
    public statusCode: number,
    public codigo?: string,
  ) {
    super(
      statusCode === 401
        ? "La sesión venció. Vuelve a iniciar sesión."
        : statusCode === 403
          ? "Tu sesión no tiene permiso para consultar este archivo."
          : statusCode === 404
            ? "No se encontró el archivo solicitado. Actualiza el caso para comprobar su estado."
            : codigo && (codigosArchivo as readonly string[]).includes(codigo)
              ? "El archivo está registrado, pero no está disponible para su lectura. Solicita revisar el almacenamiento del servicio."
              : "No fue posible recuperar el archivo del servicio. Puedes reintentar sin registrar otro aviso.",
    );
    this.name = "ArchivoJuzgadoError";
  }
}
