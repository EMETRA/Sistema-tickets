"use client";

import React, { createContext, useContext } from "react";
import { UserRole } from "@/config/navigation";

interface RoleContextType {
    role: UserRole;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ role, children }: { role: UserRole; children: React.ReactNode }) => (
    <RoleContext.Provider value={{ role }}>{children}</RoleContext.Provider>
);

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) throw new Error("useRole debe usarse dentro de un RoleProvider");
    return context;
};