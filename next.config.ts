import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // SOLO PARA DESARROLLO: Permitir imágenes desde cualquier origen (útil para pruebas con URLs externas)
    // En producción, se debería restringir esto a dominios específicos para mejorar la seguridad
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
                port: '',
                pathname: '/**', // Permite cualquier ruta dentro del dominio
            },
            { protocol: "http", hostname: "localhost", port: "3000", pathname: "/**" },
            { protocol: "http", hostname: "localhost", pathname: "/**" },
        ],
    },
};

export default nextConfig;
