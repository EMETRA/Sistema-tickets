import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { UsuarioPerfil } from '@/api/graphql/home/types';

type UserRole = 'ADMIN' | 'TECH' | 'USER';

interface AuthState {
    token: string | null;
    user: UsuarioPerfil | null;
    userId: UsuarioPerfil['id_usuario'] | null;
    isHydrated: boolean;

    // Acciones (El "Set" y "Get")
    setAuth: (token: string, user: UsuarioPerfil) => void;
    logout: () => void;
    setHydrated: () => void;

    // RBAC: Helpers de Roles
    hasRole: (roles: UserRole | UserRole[]) => boolean;
    getRole: () => UserRole;
    getUserId: () => UsuarioPerfil['id_usuario'] | null;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            userId: null,
            isHydrated: false,

            setAuth: (token, user) => {
                set({ token, user, userId: user.id_usuario });
                // 1. Sincronización con Cookies para el Middleware
                // Usamos una cookie estándar (accesible por JS) para que tu compa no peleé
                Cookies.set('auth_token', token, { 
                    expires: 1, // 1 día
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict' 
                });
            },

            logout: () => {
                set({ token: null, user: null, userId: null });
                // Limpiamos tanto la Cookie como el Storage
                Cookies.remove('auth_token');
                localStorage.removeItem('auth-storage');
                // Redirección forzada al login
                window.location.href = '/login';
            },

            setHydrated: () => set({ isHydrated: true }),

            /**
             * Obtener el rol del usuario normalizado a mayúsculas
             * Si no existe rol o es inválido, retorna 'USER' como default
             */
            getRole: () => {
                const user = get().user;
                if (!user?.rol) return 'USER';
                
                const roleUpper = user.rol.toUpperCase();
                
                // Validar que sea un rol válido
                if (['ADMIN', 'TECH', 'USER'].includes(roleUpper)) {
                    return roleUpper as UserRole;
                }
                
                // Default a USER si no es válido
                return 'USER';
            },

            hasRole: (roles) => {
                const currentRole = get().getRole();
                return Array.isArray(roles) ? roles.includes(currentRole) : currentRole === roles;
            },

            getUserId: () => get().userId,
        }),
        {
            name: 'auth-storage', // Nombre en LocalStorage
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            },
        }
    )
);