
import React, { useState } from "react";
import classNames from "classnames";
import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";
import { Icon } from "@/components/client/atoms/Icon";

import { DropdownMenuProps, DropdownMenuItem } from "./types";
import styles from "./DropdownMenu.module.scss";

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, onSelect, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState("");

    const selectedItem = items.find((item) => item.value === selectedValue)
    || items[0]
    || ({ label: "Seleccionar", value: "" } as DropdownMenuItem);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    }

    const handleSelect = (item: DropdownMenuItem) => {
        onSelect(item);
        setIsOpen(false);
        setSelectedValue(item.value);
    }

    return (
        <div className={classNames(styles.dropdownMenu, className)} onClick={handleToggle}>
            <Title variant="mid">{selectedItem.label}</Title>
            <Icon name="angle-down-solid" variant="status" className={classNames(styles.iconButton, { [styles.isOpen]: isOpen })} />
            {isOpen && (
                <ul className={styles.menu}>
                    {items.map((item) => (
                        <li key={item.value} className={styles.menuItem} onClick={() => handleSelect(item)}>
                            <Text>{item.label}</Text>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

}

export default DropdownMenu;
