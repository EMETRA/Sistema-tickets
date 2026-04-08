export interface UsuarioPerfil {
    idUsuario: string;
    nombre: string;
    email: string;
    rol: string | null;
    departamento: string | null;
    avatar: string | null;
}