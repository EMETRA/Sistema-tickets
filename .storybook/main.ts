import path from "node:path";
import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
    stories: [
        "../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
        "../src/theme/**/*.stories.@(ts|tsx)",
        "../src/features/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    ],
    addons: ["@storybook/addon-a11y"],
    framework: "@storybook/nextjs-vite",
    staticDirs: ["../public"],
    // Mismo alias que tsconfig («@/…» → src/), para que las historias usen los imports del panel.
    viteFinal: async (viteConfig) => ({
        ...viteConfig,
        resolve: {
            ...viteConfig.resolve,
            alias: {
                ...(viteConfig.resolve?.alias as Record<string, string> | undefined),
                "@": path.resolve(process.cwd(), "src"),
            },
        },
    }),
};
export default config;
