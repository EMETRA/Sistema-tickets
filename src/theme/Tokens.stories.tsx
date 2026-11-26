import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import tokens from "./tokens.json";

/**
 * Documentación viva de la fuente única de colores (src/theme/tokens.json).
 * Cambia Tema y Contraste en la barra de Storybook para ver cada variante.
 */
const meta: Meta = {
    title: "Sistema de diseño/Tokens",
    tags: ["autodocs"],
    parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

function Swatch({ name, value }: { name: string; value: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span
                aria-hidden="true"
                style={{
                    width: 40,
                    height: 40,
                    flex: "none",
                    borderRadius: 10,
                    background: value,
                    border: "1px solid var(--tickets-border)",
                }}
            />
            <span style={{ display: "grid", minWidth: 0 }}>
                <code style={{ fontSize: 12, color: "var(--tickets-text)" }}>{name}</code>
                <small style={{ fontSize: 11, color: "var(--tickets-text-muted)" }}>{value}</small>
            </span>
        </div>
    );
}

const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 14,
    marginBottom: 28,
};

export const Tema: Story = {
    render: () => (
        <div>
            <h2 style={{ color: "var(--tickets-text)" }}>Tokens del tema</h2>
            <p style={{ color: "var(--tickets-text-secondary)" }}>
                Se usan como <code>var(--tickets-…)</code>. Cambian con el modo oscuro y el alto contraste.
            </p>
            <div style={grid}>
                {Object.keys(tokens.tema.claro)
                    .filter((k) =>
                        /color|text|surface|background|border|divider|primary|success|danger|warning|info|neutral/.test(
                            k,
                        ),
                    )
                    .map((k) => (
                        <Swatch key={k} name={"--" + k} value={`var(--${k})`} />
                    ))}
            </div>
        </div>
    ),
};

export const Paleta: Story = {
    render: () => (
        <div>
            {Object.entries(tokens.paleta).map(([group, values]) => (
                <section key={group}>
                    <h3 style={{ color: "var(--tickets-text)", textTransform: "capitalize" }}>{group}</h3>
                    <div style={grid}>
                        {Array.isArray(values)
                            ? values.map((v, i) => (
                                  <Swatch key={i} name={`--paleta-${group}-${i + 1}`} value={v} />
                              ))
                            : Object.entries(values).map(([name, v]) => (
                                  <Swatch key={name} name={`--paleta-${name}`} value={v} />
                              ))}
                    </div>
                </section>
            ))}
        </div>
    ),
};
