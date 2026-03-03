import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./";

const meta = {
  title: "Atoms/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["contained", "outlined", "text"],
      description: "Variante visual del botón",
    },
    color: {
      control: "select",
      options: ["success", "danger", "default"],
      description: "Color del botón",
    },
    rounded: {
      control: "boolean",
      description: "Si el botón tiene bordes redondeados completos (solo para contained y outlined)",
    },
    state: {
      control: "select",
      options: ["default", "disabled", "loading"],
      description: "Estado del botón",
    },
    loadingText: {
      control: "text",
      description: "Texto mostrado durante el estado loading",
    },
    icon: {
      control: "text",
      description: "Nombre del icono a mostrar (opcional)",
    },
    left: {
      control: "boolean",
      description: "Si el icono se muestra a la izquierda del texto",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// CONTAINED BUTTONS
// ============================================

export const ContainedSuccess: Story = {
  args: {
    variant: "contained",
    color: "success",
    children: "Button Success",
  },
};

export const ContainedDanger: Story = {
  args: {
    variant: "contained",
    color: "danger",
    children: "Button Danger",
  },
};

export const ContainedCancel: Story = {
  args: {
    variant: "contained",
    color: "cancel",
    children: "Button Cancel",
  },
};

export const ContainedDefault: Story = {
  args: {
    variant: "contained",
    color: "default",
    children: "Button Default",
  },
};

export const ContainedRounded: Story = {
  args: {
    variant: "contained",
    color: "default",
    rounded: true,
    children: "Rounded Button",
  },
};

export const ContainedDisabled: Story = {
  args: {
    variant: "contained",
    color: "default",
    state: "disabled",
    children: "Disabled Button",
  },
};

export const ContainedLoading: Story = {
  args: {
    variant: "contained",
    color: "default",
    state: "loading",
    children: "Submit",
    loadingText: "Cargando...",
  },
};

// ============================================
// OUTLINED BUTTONS
// ============================================

export const OutlinedSuccess: Story = {
  args: {
    variant: "outlined",
    color: "success",
    children: "Button Success",
  },
};

export const OutlinedDanger: Story = {
  args: {
    variant: "outlined",
    color: "danger",
    children: "Button Danger",
  },
};

export const OutlinedCancel: Story = {
  args: {
    variant: "outlined",
    color: "cancel",
    children: "Button Cancel",
  },
};

export const OutlinedDefault: Story = {
  args: {
    variant: "outlined",
    color: "default",
    children: "Button Default",
  },
};

export const OutlinedRounded: Story = {
  args: {
    variant: "outlined",
    color: "default",
    rounded: true,
    children: "Rounded Button",
  },
};

export const OutlinedDisabled: Story = {
  args: {
    variant: "outlined",
    color: "default",
    state: "disabled",
    children: "Disabled Button",
  },
};

export const OutlinedLoading: Story = {
  args: {
    variant: "outlined",
    color: "default",
    state: "loading",
    children: "Submit",
    loadingText: "Procesando...",
  },
};

// ============================================
// TEXT BUTTONS
// ============================================

export const TextSuccess: Story = {
  args: {
    variant: "text",
    color: "success",
    children: "Button Success",
  },
};

export const TextDanger: Story = {
  args: {
    variant: "text",
    color: "danger",
    children: "Button Danger",
  },
};

export const TextCancel: Story = {
  args: {
    variant: "text",
    color: "cancel",
    children: "Button Cancel",
  },
};

export const TextDefault: Story = {
  args: {
    variant: "text",
    color: "default",
    children: "Button Default",
  },
};

export const TextDisabled: Story = {
  args: {
    variant: "text",
    color: "default",
    state: "disabled",
    children: "Disabled Button",
  },
};

export const TextLoading: Story = {
  args: {
    variant: "text",
    color: "default",
    state: "loading",
    children: "Submit",
    loadingText: "Cargando...",
  },
};

// ============================================
// BUTTONS WITH ICONS
// ============================================

export const ContainedWithIconRight: Story = {
  args: {
    variant: "contained",
    color: "success",
    children: "Guardar",
    icon: "arrow-right-solid",
  },
};

export const ContainedWithIconLeft: Story = {
  args: {
    variant: "contained",
    color: "default",
    children: "Agregar",
    icon: "hashtag-solid",
    left: true,
  },
};

export const OutlinedWithIconRight: Story = {
  args: {
    variant: "outlined",
    color: "danger",
    children: "Eliminar",
    icon: "trash-solid-full",
    left: true,
  },
};

export const OutlinedWithIconLeft: Story = {
  args: {
    variant: "outlined",
    color: "default",
    children: "Descargar",
    icon: "clipboard-solid",
    left: true,
  },
};

export const TextWithIconRight: Story = {
  args: {
    variant: "text",
    color: "default",
    children: "Ver más",
    icon: "arrow-right-solid",
  },
};

export const TextWithIconLeft: Story = {
  args: {
    variant: "text",
    color: "default",
    children: "Regresar",
    icon: "arrows-rotate-solid-full",
    left: true,
  },
};
