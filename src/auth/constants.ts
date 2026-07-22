export const AUTH_COOKIE_NAME = "auth_token";
export const AUTH_ROLE_COOKIE_NAME = "auth_role";
export const AUTH_DEPARTAMENTO_COOKIE_NAME = "auth_departamento";

export const AUTH_COOKIE_OPTIONS = {
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
};
