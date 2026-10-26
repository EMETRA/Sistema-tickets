"use client";

import { useState } from "react";
import { SettingsNavItem } from "@/components/client/molecules/SettingsNavItem";
import CreateAnalist from "@/components/client/organisms/CreateAnalist";
import AnalistsList from "@/components/client/organisms/AnalistsList";

import styles from "./AnalistsManagement.module.scss";

const AnalistsManagement: React.FC = () => {

    const [view, setView] = useState("createAnalist");

    const renderView = () => {
        switch (view) {
        case "createAnalist":
            return (
                <CreateAnalist />
            )
        case "analists":
            return (
                <AnalistsList />
            )
        }
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.sidebar}>

                <SettingsNavItem 
                    label="Crear analista"
                    iconName="user-add"
                    active={view === "createAnalist"}
                    onClick={() => setView("createAnalist")}
                />

                {/* <SettingsNavItem 
                    label="Analistas"
                    iconName="user-group-solid"
                    active={view === "analists"}
                    onClick={() => setView("analists")}
                /> */}

            </div>
            <div className={styles.content}>
                {renderView()}
            </div>
        </div>
    );

};

export default AnalistsManagement;