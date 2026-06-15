import type { Meta } from "@storybook/nextjs-vite";
import { ProfileHeader } from "./index";
import { useState } from "react";

const meta: Meta<typeof ProfileHeader> = {
    title: "Organisms/ProfileHeader",
    component: ProfileHeader,
};

export default meta;

export const Default = () => {
    const [view, setView] = useState("perfil");

    return (
        <ProfileHeader 
            bannerSrc="/images/city.png"
            initials="G"
            name="Gildder Alberto Caceres Urizar"
            role="Administrador"
            switchOptions={[
                { label: "Perfil", value: "perfil" },
                { label: "Mantenimiento", value: "mantenimiento" }
            ]}
            switchValue={view}
            onSwitchChange={setView}
        />
    );
};