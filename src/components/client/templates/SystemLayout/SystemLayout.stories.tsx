import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SystemLayout } from "./index";
import { ProfileHeader } from "../../organisms/ProfileHeader";
import { UserPerformance } from "../../organisms/UserPerformance";

const meta: Meta<typeof SystemLayout> = {
    title: "Templates/SystemLayout",
    component: SystemLayout,
    parameters: {
        layout: "fullscreen",
        nextjs: {
        appDirectory: true,
        navigation: {
            pathname: '/dashboard', 
        },
    },
    },
};

export default meta;

export const LayoutPage: StoryObj<typeof SystemLayout> = {
    args: {
        // sidebarProps: {
        //     role: "admin",
        //     activePath: "/perfil",
        //     onNavigate: (path) => console.log(path),
        // },
        // topBarProps: {
        //     title: "Perfil",
        //     iconName: "user-solid",
        //     userName: "Gildder Caceres",
        //     userRole: "Administrador",
        //     userStatus: "online",
        // },
        children: (
            <>
                <div style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",    
                    justifyContent: "center"
                }}>
                    Hola
                </div>
            </>
        )
    }
};

export const ExamplePage: StoryObj<typeof SystemLayout> = {
    args: {
        // sidebarProps: {
        //     role: "admin",
        //     activePath: "/perfil",
        //     onNavigate: (path) => console.log(path),
        // },
        // topBarProps: {
        //     title: "Perfil",
        //     iconName: "user-solid",
        //     userName: "Gildder Caceres",
        //     userRole: "Administrador",
        //     userStatus: "online",
        // },
        children: (
            <>
                <ProfileHeader 
                    bannerSrc="/images/city.png"
                    initials="G"
                    name="Gildder Alberto Caceres Urizar"
                    role="Administrador"
                    switchOptions={[{label: 'Perfil', value: 'perfil'}]}
                    switchValue="perfil"
                    onSwitchChange={() => {}}
                />
                <div style={{ padding: '32px' }}>
                    <UserPerformance 
                        enteredTickets={150}
                        solvedTickets={120}
                        inProgressTickets={1}
                    />
                </div>
            </>
        )
    }
};