import { PermissionsFormProps } from "./types";
import styles from "./PermissionsForm.module.scss";
import classNames from "classnames";
import { TableHeader } from "../../molecules/TableHeader";
import { FormField } from "../../molecules/FormField";
import { SelectField } from "../../molecules/SelectField";
import { Select } from "../../atoms/Select";
import { Input } from "../../atoms/Input";
import { TextArea } from "../../atoms/TextArea";
import { FormActions } from "../../molecules/FormActions";
import { Button } from "../../atoms/Button";

const PermissionsForm: React.FC<PermissionsFormProps> = ({
    modules,
    onSubmit,
    onCancel,
    className
}) => {
    return (
        <div className={classNames(styles.PermissionsForm, className)}>

            <TableHeader 
                iconName="user-lock-solid"
                label="Crear nuevo permiso"
            />

            <div className={styles.form}>

                <SelectField
                    label="Módulo"
                    htmlFor="module"
                    required
                >
                    <Select id="module" options={[]}/>
                </SelectField>

                <FormField
                    label="Nombre del permiso"
                    htmlFor="name"
                    required
                >
                    <Input id="name" />
                </FormField>

                <FormField
                    label="Código del permiso"
                    htmlFor="code"
                    required
                >
                    <Input id="code" />
                </FormField>

                <FormField
                    label="Descripción del permiso"
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

export default PermissionsForm;