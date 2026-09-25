"use client";

import React from "react";
import { ButtonTab } from "../../atoms/ButtonTab";
import type { IconFilterTabsProps, FilterOption } from "./types";

const ALL_OPTION: FilterOption = {
    label: "Todos",
    value: "all",
    icon: "ticket-solid",
};

export const IconFilterTabs: React.FC<IconFilterTabsProps> = ({
    options = [],
    value,
    onChange,
    disabled = false,
    className,
}) => {
    return (
        <ButtonTab
            className={className}
            options={[ALL_OPTION, ...options]}
            value={value}
            onChange={onChange}
            disabled={disabled}
        />
    );
};

export default IconFilterTabs;
