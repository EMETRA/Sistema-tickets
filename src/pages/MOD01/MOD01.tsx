"use client";

import React, { useState } from "react";
import { Title } from "@/components/client/atoms/Title";
import { Input } from "@/components/client/atoms/Input";
import { FormField } from "@/components/client/molecules/FormField";
import styles from "./MOD01.module.scss";
import { Select } from "@/components/client/atoms/Select";
import { TextArea } from "@/components/client/atoms/TextArea";
import { Button } from "@/components/client/atoms/Button";
import { useRouter } from "next/navigation";
import { Text } from "@/components/client/atoms/Text";

// interface TaskItem {
//     id: number;
//     descripcion: string;
//     fechaFinalizacion: string;
//     [key: string]: string | number; // extra fields
// }

interface ExtraField {
    key: string;
    label: string;
    type?: "text" | "date" | "select" | "number";
    options?: { label: string; value: string }[];
    placeholder?: string;
}

interface TaskSectionProps {
    title: string;
    addLabel: string;
    textAreaLabel: string;
    extraFields: ExtraField[];
    initialItem: Record<string, string>;
    onTasksChange?: (tasks: TaskRecord[]) => void; // 👈 add this

}

const estadoOptions = [
    { label: "Pendiente", value: "pendiente" },
    { label: "En Proceso", value: "en_proceso" },
    { label: "Finalizada", value: "finalizada" },
];
type TaskRecord = { id: number } & Record<string, string | number>;

const TaskSection: React.FC<TaskSectionProps> = ({
    title,
    addLabel,
    textAreaLabel,
    extraFields,
    initialItem,
    onTasksChange,
}) => {

    const [tasks, setTasks] = useState<TaskRecord[]>([
        { id: 1, ...initialItem }
    ]);
    const handleAdd = () => {
        const updated = [...tasks, { id: Date.now(), ...initialItem }];
        setTasks(updated);
        onTasksChange?.(updated);
    };

    const handleDelete = (id: number) => {
        const updated = tasks.filter(t => t.id !== id);
        setTasks(updated);
        onTasksChange?.(updated);
    };

    const handleChange = (id: number, field: string, value: string) => {
        const updated = tasks.map(t => t.id === id ? { ...t, [field]: value } : t);
        setTasks(updated);
        onTasksChange?.(updated);
    };

    return (
        <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
                <Title variant="mid" tag="h3" className={styles.sectionTitle}>{title}</Title>
                <Button variant="contained" color="success" onClick={handleAdd}>{addLabel}</Button>
            </div>

            {tasks.map((task, index) => (
                <div key={task.id} className={styles.tareaGroup}>
                    {index > 0 && (
                        <div className={styles.tareaHeader}>
                            <Button variant="outlined" color="danger" onClick={() => handleDelete(task.id)}>
                                Eliminar tarea
                            </Button>
                        </div>
                    )}

                    <FormField label={textAreaLabel} htmlFor={`desc-${title}-${task.id}`}>
                        <TextArea
                            id={`desc-${title}-${task.id}`}
                            value={task.descripcion}
                            onChange={(e) => handleChange(task.id, "descripcion", e.target.value)}
                            onInput={(e) => {
                                const el = e.currentTarget;
                                el.style.height = "auto";
                                el.style.height = `${el.scrollHeight}px`;
                            }}
                            className={styles.textarea}
                        />
                    </FormField>

                    <div className={styles.fieldsGrid}>
                        {extraFields.map(field => (
                            <FormField key={field.key} label={field.label} htmlFor={`${field.key}-${task.id}`}>
                                {field.type === "select" ? (
                                    <Select
                                        id={`${field.key}-${task.id}`}
                                        value={task[field.key] as string}
                                        onChange={(e) => handleChange(task.id, field.key, e.target.value)}
                                        options={field.options || []}
                                        placeholder={field.placeholder}
                                    />
                                ) : (
                                    <Input
                                        id={`${field.key}-${task.id}`}
                                        type={field.type || "text"}
                                        min={field.type === "number" ? 0 : undefined}
                                        value={task[field.key] as string}
                                        onChange={(e) => handleChange(task.id, field.key, e.target.value)}
                                    />
                                )}
                            </FormField>
                        ))}
                    </div>

                    {index < tasks.length - 1 && <hr className={styles.divider} />}
                </div>
            ))}
        </section>
    );
};

const MOD01: React.FC = () => {
    const router = useRouter();
    const [tareasPlanificadas, setTareasPlanificadas] = useState<TaskRecord[]>([]);
    const [tareasCompletadas, setTareasCompletadas] = useState<TaskRecord[]>([]);
    const [formData, setFormData] = useState({
        colaborador: "",
        cargo: "",
        proyecto: "",
        fechaInicio: "",
        fechaFin: "",
        jefe: "",
        avance: "",
        tareasPlanificadas: "",
        tareasCompletadas: "",
        tareasEnFecha: "",
        bloqueosActivos: "",
        horasEstimadas: "",
        horasReales: "",
        avancePlanificado: "",
        avanceReal: "",
        bloqueoDescripcion: "",
        bloqueoImpacto: "",
        bloqueoAccion: "",
        metricasObservaciones: "",
        planTarea: "",
        planHoras: "",
        planCompromiso: "",
    });

    const [errors, setErrors] = useState<string[]>([]);

    const validate = (): boolean => {
        const newErrors: string[] = [];

        // Información general
        if (!formData.colaborador) newErrors.push("Colaborador es requerido");
        if (!formData.cargo) newErrors.push("Cargo es requerido");
        if (!formData.proyecto) newErrors.push("Proyecto asignado es requerido");
        if (!formData.fechaInicio) newErrors.push("Fecha inicio es requerida");
        if (!formData.fechaFin) newErrors.push("Fecha fin es requerida");
        if (!formData.jefe) newErrors.push("Jefe inmediato es requerido");
        if (!formData.avance) newErrors.push("Porcentaje de avance general es requerido");

        // Indicadores base
        if (!formData.tareasPlanificadas) newErrors.push("Tareas planificadas es requerido");
        if (!formData.tareasCompletadas) newErrors.push("Tareas completadas es requerido");
        if (!formData.tareasEnFecha) newErrors.push("Tareas en fecha es requerido");
        if (!formData.bloqueosActivos) newErrors.push("Bloqueos activos es requerido");
        if (!formData.horasEstimadas) newErrors.push("Horas estimadas total es requerido");
        if (!formData.horasReales) newErrors.push("Horas reales total es requerido");
        if (!formData.avancePlanificado) newErrors.push("Avance planificado es requerido");
        if (!formData.avanceReal) newErrors.push("Avance real es requerido");

        // Plan próxima semana
        if (!formData.planTarea) newErrors.push("Tarea planificada (plan próxima semana) es requerida");
        if (!formData.planHoras) newErrors.push("Horas estimadas (plan próxima semana) es requerido");
        if (!formData.planCompromiso) newErrors.push("Fecha compromiso (plan próxima semana) es requerida");

        // At least one tareas planificadas filled
        const tpFilled = tareasPlanificadas.find(t =>
            t.descripcion && t.horasEstimadas && t.fechaCompromiso && t.estado
        );
        if (!tpFilled) newErrors.push("Debe completar al menos una tarea planificada");

        // At least one tareas completadas filled
        const tcFilled = tareasCompletadas.find(t =>
            t.descripcion && t.horasReales && t.fechaFinalizacion
        );
        if (!tcFilled) newErrors.push("Debe completar al menos una tarea completada");

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        router.push("/home/save-mod01");
    };

    

    const handleField = (field: string, value: string) =>
        setFormData(prev => ({ ...prev, [field]: value }));
    const collaboratorOptions = [
        { label: "Juan Pérez", value: "1" },
        { label: "María García", value: "2" },
        { label: "Carlos López", value: "3" },
    ];

    // TODO: replace dummy data with real query
    // const { data: collaborators } = useGetCollaborators();
    // const collaboratorOptions = collaborators?.map(c => ({ label: c.nombre, value: c.id })) || [];

    return (
        <div className={styles.mainContainer}>
            <div className={styles.card}>
                {/* Grupo 1 */}
                <section className={styles.formSection}>
                    <Title variant="mid" tag="h3" className={styles.sectionTitle}>
                        Información general
                    </Title>
                    <div className={styles.fieldsGrid}>
                        <FormField label="Colaborador" htmlFor="colaborador">
                            <Select
                                id="colaborador"
                                value={formData.colaborador}
                                onChange={(e) => handleField("colaborador", e.target.value)}
                                options={collaboratorOptions}
                                placeholder="Seleccionar colaborador"
                            />
                        </FormField>
                        <FormField label="Cargo" htmlFor="cargo">
                            <Input id="cargo" type="text" placeholder="Ingrese cargo" onChange={(e) => handleField("cargo", e.target.value)} />
                        </FormField>
                        <FormField label="Proyecto asignado" htmlFor="proyecto">
                            <Input id="proyecto" type="text" placeholder="Ingrese proyecto" onChange={(e) => handleField("proyecto", e.target.value)} />
                        </FormField>
                        <FormField label="Fecha inicio" htmlFor="fecha-inicio">
                            <Input id="fecha-inicio" type="date" state="default"  placeholder="Selecciona una fecha..." onChange={(e) => handleField("fechaInicio", e.target.value)}     />
                        </FormField>

                        <FormField label="Fecha fin" htmlFor="fecha-fin">
                            <Input id="fecha-fin" type="date" placeholder="Selecciona una fecha..." onChange={(e) => handleField("fechaFin", e.target.value)} />
                        </FormField>
                        <FormField label="Jefe inmediato" htmlFor="jefe">
                            <Input id="jefe" type="text" placeholder="Ingrese jefe inmediato" onChange={(e) => handleField("jefe", e.target.value)} />
                        </FormField>
                        <FormField label="Porcentaje de avance general" htmlFor="avance">
                            <Input id="avance" type="number" min={0} max={100} placeholder="Ingrese avance" onChange={(e) => handleField("avance", e.target.value)} />
                        </FormField>
                    </div>
                </section>

                <hr className={styles.divider} />

                <section className={styles.formSection}>
                    <Title variant="mid" tag="h3" className={styles.sectionTitle}>
                        Indicadores base
                    </Title>
                    <div className={styles.fieldsGrid}>
                        <FormField label="Tareas planificadas" htmlFor="tareas-planificadas">
                            <Input id="tareas-planificadas" type="number" min={0} placeholder="" onChange={(e) => handleField("tareasPlanificadas", e.target.value)} />
                        </FormField>
                        <FormField label="Tareas completadas" htmlFor="tareas-completadas">
                            <Input id="tareas-completadas" type="number" min={0} placeholder="" onChange={(e) => handleField("tareasCompletadas", e.target.value)} />
                        </FormField>
                        <FormField label="Tareas en fecha" htmlFor="tareas-en-fecha">
                            <Input id="tareas-en-fecha" type="number" min={0} placeholder="" onChange={(e) => handleField("tareasEnFecha", e.target.value)} />
                        </FormField>
                        <FormField label="Bloqueos activos" htmlFor="bloqueos-activos">
                            <Input id="bloqueos-activos" type="number" min={0} placeholder="" onChange={(e) => handleField("bloqueosActivos", e.target.value)} />
                        </FormField>
                        <FormField label="Horas estimadas total" htmlFor="horas-estimadas">
                            <Input id="horas-estimadas" type="number" min={0} placeholder="" onChange={(e) => handleField("horasEstimadas", e.target.value)} />
                        </FormField>
                        <FormField label="Horas reales total" htmlFor="horas-reales">
                            <Input id="horas-reales" type="number" min={0} placeholder="" onChange={(e) => handleField("horasReales", e.target.value)} />
                        </FormField>
                        <FormField label="Porcentaje de avance planificado" htmlFor="avance-planificado">
                            <Input id="avance-planificado" type="number" min={0} max={100} placeholder="" onChange={(e) => handleField("avancePlanificado", e.target.value)} />
                        </FormField>
                        <FormField label="Porcentaje de avance real" htmlFor="avance-real">
                            <Input id="avance-real" type="number" min={0} max={100} placeholder="" onChange={(e) => handleField("avanceReal", e.target.value)} />
                        </FormField>
                    </div>
                </section>

                <hr className={styles.divider} />
                <TaskSection
                    title="Tareas planificadas"
                    addLabel="Agregar tarea planificada"
                    textAreaLabel="Descripción técnica"
                    initialItem={{ descripcion: "", horasEstimadas: "", fechaCompromiso: "", estado: "" }}
                    extraFields={[
                        { key: "horasEstimadas", label: "Horas estimadas", type: "number" },
                        { key: "fechaCompromiso", label: "Fecha compromiso", type: "date" },
                        { key: "estado", label: "Estado", type: "select", options: estadoOptions, placeholder: "Seleccionar estado" },
                    ]}
                    onTasksChange={setTareasPlanificadas}
                />

                <hr className={styles.divider} />
                <TaskSection
                    title="Tareas completadas"
                    addLabel="Agregar tarea completada"
                    textAreaLabel="Descripción técnica completada"
                    initialItem={{ descripcion: "", horasReales: "", fechaFinalizacion: "" }}
                    extraFields={[
                        { key: "horasReales", label: "Horas reales invertidas", type: "number" },
                        { key: "fechaFinalizacion", label: "Fecha finalización", type: "date" },
                    ]}
                    onTasksChange={setTareasCompletadas}
                />

                <hr className={styles.divider} />

                {/* Bloqueos o riesgos */}
                <section className={styles.formSection}>
                    <Title variant="mid" tag="h3" className={styles.sectionTitle}>
                        Bloqueos o riesgos
                    </Title>
                    <FormField label="Descripción" htmlFor="bloqueo-descripcion">
                        <TextArea
                            id="bloqueo-descripcion"
                            onInput={(e) => {
                                const el = e.currentTarget;
                                el.style.height = "auto";
                                el.style.height = `${el.scrollHeight}px`;
                            }}
                            onChange={(e) => handleField("bloqueoDescripcion", e.target.value)}
                            className={styles.textarea}
                        />
                    </FormField>
                    <div className={`${styles.fieldsGrid} ${styles.fieldsGridTwo}`}>
                        <FormField label="Impacto" htmlFor="bloqueo-impacto">
                            <Input id="bloqueo-impacto" type="text" onChange={(e) => handleField("bloqueoImpacto", e.target.value)} />
                        </FormField>
                        <FormField label="Acción requerida" htmlFor="bloqueo-accion">
                            <Input id="bloqueo-accion" type="text" onChange={(e) => handleField("bloqueoAccion", e.target.value)} />
                        </FormField>
                    </div>
                </section>

                <hr className={styles.divider} />

                {/* Métricas semanales */}
                <section className={styles.formSection}>
                    <Title variant="mid" tag="h3" className={styles.sectionTitle}>
                        Métricas semanales
                    </Title>
                    <FormField label="Observaciones técnicas" htmlFor="metricas-observaciones">
                        <TextArea
                            id="metricas-observaciones"
                            onInput={(e) => {
                                const el = e.currentTarget;
                                el.style.height = "auto";
                                el.style.height = `${el.scrollHeight}px`;
                            }}
                            className={styles.textarea}
                            onChange={(e) => handleField("metricasObservaciones", e.target.value)}
                        />
                    </FormField>
                </section>

                <hr className={styles.divider} />

                {/* Plan próxima semana */}
                <section className={styles.formSection}>
                    <Title variant="mid" tag="h3" className={styles.sectionTitle}>
                        Plan próxima semana
                    </Title>
                    <FormField label="Tarea planificada" htmlFor="plan-tarea">
                        <TextArea
                            id="plan-tarea"
                            onInput={(e) => {
                                const el = e.currentTarget;
                                el.style.height = "auto";
                                el.style.height = `${el.scrollHeight}px`;
                            }}
                            className={styles.textarea}
                            onChange={(e) => handleField("planTarea", e.target.value)}
                        />
                    </FormField>
                    <div className={`${styles.fieldsGrid} ${styles.fieldsGridTwo}`}>
                        <FormField label="Horas estimadas" htmlFor="plan-horas">
                            <Input id="plan-horas" type="number" min={0} onChange={(e) => handleField("planHoras", e.target.value)} />
                        </FormField>
                        <FormField label="Fecha compromiso" htmlFor="plan-compromiso">
                            <Input id="plan-compromiso" type="date" placeholder="Selecciona una fecha..." onChange={(e) => handleField("planCompromiso", e.target.value)} />
                        </FormField>
                    </div>
                </section>
                <hr className={styles.divider} />
                {/* Buttons */}
                {errors.length > 0 && (
                    <div className={styles.errorList}>
                        {errors.map((e, i) => (
                            <Text key={i} className={styles.errorItem}>• {e}</Text>
                        ))}
                    </div>
                )}
                <div className={styles.formActions}>
                    <Button variant="contained" color="success" onClick={handleSave}>
                        Guardar reporte
                    </Button>
                    <Button variant="outlined" color="default" onClick={() => router.push("/home/exportmod01")}>
                        Exportación
                    </Button>
                </div>

                <hr className={styles.dividerS} />
                {/* Navegación */}
                <section className={styles.formSection}>
                    <Title variant="mid" tag="h3" className={styles.sectionTitle}>
                        Navegación
                    </Title>
                    <div className={styles.navActions}>
                        <Button variant="contained" color="success" onClick={() => router.push("/home/dashboard-proyectos")}>
                            Dashboard proyectos
                        </Button>
                        <Button variant="outlined" color="default" onClick={() => router.push("/home/dashboard-colaboradores")}>
                            Dashboard Colaboradores
                        </Button>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default MOD01;