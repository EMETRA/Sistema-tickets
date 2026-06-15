import { ModulesFormProps } from "./types";
import styles from "./ModulesForm.module.scss";
import classNames from "classnames";
import { TableHeader } from "../../molecules/TableHeader";
import { FormField } from "../../molecules/FormField";
import { Input } from "../../atoms/Input";
import { TextArea } from "../../atoms/TextArea";
import { FormActions } from "../../molecules/FormActions";
import { Button } from "../../atoms/Button";
import { useEffect, useState } from "react";

const ModulesForm: React.FC<ModulesFormProps> = ({
    onSubmit,
    onCancel,
    initialData,
    className
}) => {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || "");
        }
    },[initialData]);

    const handleSubmit = () => {
        onSubmit?.({name, description});
    };

    return (
        <div className={classNames(styles.ModulesForm, className)}>

            <TableHeader 
                iconName="layer-group-solid"
                label={initialData ? "Editar módulo" : "Crear nuevo módulo"}
            />

            <div className={styles.form}>
                <form onSubmit={handleSubmit}>
                    <FormField
                        label="Nombre del módulo"
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
                        label="Descripción del módulo"
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

export default ModulesForm;