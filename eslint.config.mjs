// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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
    ]),
    ...storybook.configs["flat/recommended"],
    {
        rules: {
            'indent': ['error', 4],
            'react/jsx-indent': ['error', 4],
            'react/jsx-indent-props': ['error', 4],
        }
    },
    {
        files: ['src/platform/**/*.{ts,tsx}', 'src/views/Platform/**/*.tsx', 'src/components/client/molecules/PlatformField/**/*.tsx', 'src/components/client/organisms/ResourceWorkspace/**/*.tsx'],
        // Prettier formats these modules; the core and JSX indentation fixers disagree on nested JSX.
        rules: {'indent':'off','react/jsx-indent':'off','react/jsx-indent-props':'off'}
    }
]);

export default eslintConfig;
