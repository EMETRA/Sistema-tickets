import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { UsuarioPerfil } from '@/api/graphql/home/types';
import { UserRole } from '@/types/roles';
import {
    AUTH_COOKIE_NAME,
    AUTH_COOKIE_OPTIONS,
    AUTH_ROLE_COOKIE_NAME,
} from '@/auth/constants';
import { normalizeRole } from '@/auth/normalizeRole';

interface AuthState {
    token: string | null;
    user: UsuarioPerfil | null;
    userId: UsuarioPerfil['id_usuario'] | null;
    isHydrated: boolean;

    setAuth: (token: string, user: UsuarioPerfil) => void;
    logout: () => void;
    setHydrated: () => void;

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
                const role = normalizeRole(user.rol);
                set({
                    token,
                    user: { ...user, rol: role },
                    userId: user.id_usuario,
                });

                Cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
                Cookies.set(AUTH_ROLE_COOKIE_NAME, role, AUTH_COOKIE_OPTIONS);
            },

            logout: () => {
                set({ token: null, user: null, userId: null });
                Cookies.remove(AUTH_COOKIE_NAME);
                Cookies.remove(AUTH_ROLE_COOKIE_NAME);
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
            },

            setHydrated: () => set({ isHydrated: true }),

            getRole: () => normalizeRole(get().user?.rol),

            hasRole: (roles) => {
                const currentRole = get().getRole();
                return Array.isArray(roles) ? roles.includes(currentRole) : currentRole === roles;
            },

            getUserId: () => get().userId,
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (state?.token && state.user) {
                    const role = normalizeRole(state.user.rol);
                    Cookies.set(AUTH_COOKIE_NAME, state.token, AUTH_COOKIE_OPTIONS);
                    Cookies.set(AUTH_ROLE_COOKIE_NAME, role, AUTH_COOKIE_OPTIONS);
                }
                state?.setHydrated();
            },
        }
    )
);
