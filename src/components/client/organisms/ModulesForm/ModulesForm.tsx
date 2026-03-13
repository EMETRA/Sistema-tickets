import { ModulesFormProps } from "./types";
import styles from "./ModulesForm.module.scss";
import classNames from "classnames";
import { TableHeader } from "../../molecules/TableHeader";
import { FormField } from "../../molecules/FormField";
import { Input } from "../../atoms/Input";
import { TextArea } from "../../atoms/TextArea";
import { FormActions } from "../../molecules/FormActions";
import { Button } from "../../atoms/Button";

const ModulesForm: React.FC<ModulesFormProps> = ({
    onSubmit,
    onCancel,
    className
}) => {
    return (
        <div className={classNames(styles.ModulesForm, className)}>

            <TableHeader 
                iconName="layer-group-solid"
                label="Crear nuevo módulo"
            />

            <div className={styles.form}>
                <FormField
                    label="Nombre del módulo"
                    htmlFor="name"
                    required
                >
                    <Input id="name" />
                </FormField>

                <FormField
                    label="Descripción del módulo"
                    htmlFor="description"
                >
                    <TextArea id="description" />
                </FormField>

                <FormActions align="center">
                    <Button
                        color="cancel"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={onSubmit}
                    >
                        Grabar
                    </Button>
                </FormActions>
            </div>

        </div>
    );
};

export default ModulesForm;