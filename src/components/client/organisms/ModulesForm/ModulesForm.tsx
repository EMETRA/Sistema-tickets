import { ModulesFormProps } from "./types";
import styles from "./ModulesForm.module.scss";
import classNames from "classnames";
import { TableHeader } from "../../molecules/TableHeader";
import { FormField } from "../../molecules/FormField";
import { Input } from "../../atoms/Input";
import { TextArea } from "../../atoms/TextArea";
import { FormActions } from "../../molecules/FormActions";
import { Button } from "../../atoms/Button";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { texto } from "@/platform/forms";

const esquema = z.object({
    name: texto("Nombre del módulo", { requerido: true, max: 100 }),
    description: texto("Descripción del módulo", { max: 500 }),
});
type Valores = z.infer<typeof esquema>;

const ModulesForm: React.FC<ModulesFormProps> = ({ onSubmit, onCancel, initialData, className }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<Valores>({
        resolver: zodResolver(esquema),
        defaultValues: { name: "", description: "" },
    });

    // Al editar, el formulario toma los datos del módulo elegido.
    useEffect(() => {
        if (initialData) reset({ name: initialData.name, description: initialData.description || "" });
    }, [initialData, reset]);

    return (
        <div className={classNames(styles.ModulesForm, className)}>
            <TableHeader
                iconName="layer-group-solid"
                label={initialData ? "Editar módulo" : "Crear nuevo módulo"}
            />

            <div className={styles.form}>
                <form onSubmit={handleSubmit((values) => onSubmit?.(values))} noValidate>
                    <FormField label="Nombre del módulo" htmlFor="name" required>
                        <Input
                            id="name"
                            {...register("name")}
                            state={errors.name ? "error" : "default"}
                            errorMessage={errors.name?.message}
                            aria-invalid={!!errors.name}
                        />
                    </FormField>

                    <FormField label="Descripción del módulo" htmlFor="description">
                        <TextArea
                            id="description"
                            {...register("description")}
                            state={errors.description ? "error" : "default"}
                            errorMessage={errors.description?.message}
                        />
                    </FormField>

                    <FormActions align="center">
                        <Button color="cancel" onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button type="submit">{initialData ? "Editar" : "Grabar"}</Button>
                    </FormActions>
                </form>
            </div>
        </div>
    );
};

export default ModulesForm;
