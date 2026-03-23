import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { UserRole } from '@/types/roles';
import { UsuarioPerfil } from '@/types/users';

interface AuthState {
    token: string | null;
    user: UsuarioPerfil | null;
    isHydrated: boolean;

    // Acciones (El "Set" y "Get")
    setAuth: (token: string, user: UsuarioPerfil) => void;
    logout: () => void;
    setHydrated: () => void;

    // RBAC: Helpers de Roles
    hasRole: (roles: UserRole | UserRole[]) => boolean;
    getRole: () => UserRole | null;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isHydrated: false,

            setAuth: (token, user) => {
                set({ token, user });
                // 1. Sincronización con Cookies para el Middleware
                // Usamos una cookie estándar (accesible por JS) para que tu compa no peleé
                Cookies.set('auth_token', token, { 
                    expires: 1, // 1 día
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict' 
                });
            },

            logout: () => {
                set({ token: null, user: null });
                // Limpiamos tanto la Cookie como el Storage
                Cookies.remove('auth_token');
                localStorage.removeItem('auth-storage');
                // Redirección forzada al login
                window.location.href = '/login';
            },

            setHydrated: () => set({ isHydrated: true }),

            getRole: () => (get().user?.rol as UserRole) || null,

            hasRole: (roles) => {
                const currentRole = get().user?.rol as UserRole;
                if (!currentRole) return false;
                return Array.isArray(roles) ? roles.includes(currentRole) : currentRole === roles;
            },
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