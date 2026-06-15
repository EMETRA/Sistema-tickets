
import { CardSwitchProps } from "./types";
import styles from "./CardSwitch.module.scss";
import classNames from "classnames";
import { Button } from "../../atoms/Button";

export const CardSwitch = ({ 
    options, 
    value, 
    onChange, 
    className,
    fullWidth = false
}: CardSwitchProps) => {
    return (
        <div className={classNames(
            styles.cardSwitch, 
            { [styles.fullWidth]: fullWidth },
            className
        )}>
            {options.map((option) => {
                const isActive = value === option.value;
                
                return (
                    <Button
                        key={option.value}
                        variant={isActive ? "contained" : "outlined"}
                        color={isActive ? "default" : "cancel"} 
                        onClick={() => onChange(option.value)}
                        className={classNames(styles.switchButton, { [styles.active]: isActive })}
                        fullWidth={fullWidth}
                    >
                        {option.label}
                    </Button>
                );
            })}
        </div>
    );
};

export default CardSwitch;