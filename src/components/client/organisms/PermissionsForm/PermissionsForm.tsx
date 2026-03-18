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
import { useEffect, useState } from "react";

const PermissionsForm: React.FC<PermissionsFormProps> = ({
    modules,
    initialData,
    onSubmit,
    onCancel,
    className
}) => {

    const [module, setModule] = useState(1);
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");

    const options = modules.map(item => 
    { return { label: item.name, value: item.id }}
    );

    useEffect(() => {
        if (initialData) {
            setModule(initialData.module);
            setName(initialData.name);
            setCode(initialData.code);
            setDescription(initialData.description || "");
        }
    }, [initialData])

    const handleSubmit = () => {
        onSubmit?.({module, name, code, description});
    };

    return (
        <div className={classNames(styles.PermissionsForm, className)}>

            <TableHeader 
                iconName="user-lock-solid"
                label={initialData ? "Editar permiso" : "Crear nuevo permiso"}
            />

            <div className={styles.form}>
                <form onSubmit={handleSubmit}>
                    <SelectField
                        label="Módulo"
                        htmlFor="module"
                        required
                    >
                        <Select 
                            id="module" 
                            options={options} 
                            value={module}
                            onChange={(e) => setModule(parseInt(e.target.value))}
                            required
                        />
                    </SelectField>

                    <FormField
                        label="Nombre del permiso"
                        htmlFor="name"
                        required
                    >
                        <Input 
                            id="name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </FormField>

                    <FormField
                        label="Código del permiso"
                        htmlFor="code"
                        required
                    >
                        <Input 
                            id="code" 
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </FormField>

                    <FormField
                        label="Descripción del permiso"
                        htmlFor="description"
                    >
                        <TextArea 
                            id="description" 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </FormField>

                    <FormActions align="center">
                        <Button
                            color="cancel"
                            onClick={onCancel}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                        >
                            {initialData ? "Editar" : "Grabar"}
                        </Button>
                    </FormActions>
                </form>
            </div>

        </div>
    );
};

export default PermissionsForm;