import type { Preview } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../src/theme/tokens.css";
import "../src/theme/accessibility.css";

/**
 * Tema, tamaño del texto y contraste en la barra de Storybook: los mismos
 * atributos de <html> que aplica el panel (platform/theme.ts), para revisar
 * cada componente en claro, oscuro, letra grande y alto contraste.
 */
const preview: Preview = {
    globalTypes: {
        theme: {
            description: "Tema",
            toolbar: {
                title: "Tema",
                icon: "contrast",
                items: [
                    { value: "light", title: "Claro" },
                    { value: "dark", title: "Oscuro" },
                ],
                dynamicTitle: true,
            },
        },
        textSize: {
            description: "Tamaño del texto",
            toolbar: {
                title: "Texto",
                icon: "zoom",
                items: [
                    { value: "normal", title: "Normal" },
                    { value: "large", title: "Grande" },
                    { value: "xlarge", title: "Muy grande" },
                ],
                dynamicTitle: true,
            },
        },
        contrast: {
            description: "Contraste",
            toolbar: {
                title: "Contraste",
                icon: "eye",
                items: [
                    { value: "normal", title: "Normal" },
                    { value: "more", title: "Alto" },
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: { theme: "light", textSize: "normal", contrast: "normal" },
    decorators: [
        (Story, context) => {
            const root = document.documentElement;
            root.dataset.theme = context.globals.theme || "light";
            root.dataset.textSize = context.globals.textSize || "normal";
            root.dataset.contrast = context.globals.contrast || "normal";
            document.body.style.background = "var(--tickets-background)";
            document.body.style.color = "var(--tickets-text)";
            // Cada historia con su propia caché de consultas (TanStack Query), sin reintentos.
            const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
            return (
                <QueryClientProvider client={client}>
                    <Story />
                </QueryClientProvider>
            );
        },
    ],
    parameters: {
        // Panel «Accessibility» (axe) en cada historia; «todo» muestra los avisos sin bloquear.
        // Cambiar a "error" cuando todas las historias heredadas estén corregidas.
        a11y: { test: "todo" },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
