// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
        ".next-laboratorio/**",
        ".next-oracle/**",
        "storybook-static/**",
    ]),
    ...storybook.configs["flat/recommended"],
    {
        // Scripts del laboratorio, despliegue y pruebas: CommonJS de Node.
        files: ["**/*.cjs"],
        languageOptions: { sourceType: "commonjs" },
        rules: {
            "@typescript-eslint/no-require-imports": "off",
            // En CommonJS `module` es el objeto del módulo, no un import de Next.
            "@next/next/no-assign-module-variable": "off",
        },
    },
    {
        // Parámetros y variables con «_» se ignoran a propósito (p. ej. _request).
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
            ],
        },
    },
    {
        // Sistema de diseño (Atomic Design): átomos, moléculas y organismos son
        // presentacionales y no dependen de las áreas de negocio (src/features).
        files: ["src/components/client/{atoms,molecules,organisms}/**/*.{ts,tsx}"],
        ignores: ["**/*.stories.tsx"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: ["@/features/*", "**/features/*"],
                            message:
                                "El sistema de diseño no importa áreas de negocio: mueve la lógica a src/features o recibe los datos por props.",
                        },
                    ],
                },
            ],
        },
    },
    // Prettier se encarga del formato; ESLint solo de errores y buenas prácticas.
    prettier,
]);

export default eslintConfig;
