"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { mensajes, texto } from "@/platform/forms";
import classNames from "classnames";
import { Title } from "@/components/client/atoms/Title";
import { FormField } from "@/components/client/molecules/FormField";
import { Input } from "@/components/client/atoms/Input";
import { Select } from "@/components/client/atoms/Select";
import { FileDropzone } from "@/components/client/molecules/FileDropzone";
import { FileItem } from "@/components/client/molecules/FileItem";
import { FormActions } from "@/components/client/molecules/FormActions";
import { Button } from "@/components/client/atoms/Button";
import type { TicketCreationPanelProps, TicketFormData, UploadedFile } from "./types";
import styles from "./TicketCreationPanel.module.scss";
import { RichTextField } from "@/components/client/molecules/RichTextField";

/** Texto visible de la descripción (el editor guarda HTML). */
const plainText = (html: string) =>
    html
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .trim();
const ticketSchema = z.object({
    subject: texto("Asunto", { requerido: true, max: 150 }),
    departmentId: z.string().min(1, mensajes.opcion("Área que atiende")),
    description: z
        .string()
        .max(24000, mensajes.maximo("Descripción del problema", 24000))
        .refine((v) => plainText(v).length > 0, mensajes.requerido("Descripción del problema")),
});
type TicketValues = z.infer<typeof ticketSchema>;

/**
 * Componente TicketCreationPanel - Formulario completo para crear un ticket
 *
 * @param {TicketCreationPanelProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente TicketCreationPanel renderizado
 */
export const TicketCreationPanel: React.FC<TicketCreationPanelProps> = ({
    departments,
    onSubmit,
    onCancel,
    loading = false,
    uploadProgress = 0,
    initialValues,
    className,
    variant = "page",
}) => {
    // Campos validados con las mismas reglas del API (asunto ≤ 150, descripción con texto ≤ 24 000).
    const {
        control,
        setValue,
        handleSubmit: validate,
        formState: { errors, isSubmitted },
    } = useForm<TicketValues>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            subject: initialValues?.subject || "",
            departmentId: initialValues?.departmentId?.toString() || "",
            description: initialValues?.description || "",
        },
    });
    const [subject, departmentId, description] = useWatch({
        control,
        name: ["subject", "departmentId", "description"],
    });
    // Después del primer intento, cada cambio vuelve a validar y quita el mensaje al corregir.
    const update = (name: keyof TicketValues, value: string) =>
        setValue(name, value, { shouldValidate: isSubmitted, shouldDirty: true });
    const setSubject = (value: string) => update("subject", value);
    const setDepartmentId = (value: string) => update("departmentId", value);
    const setDescription = (value: string) => update("description", value);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialValues?.files || []);
    const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
    const ALLOWED_EXTENSIONS = [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "csv",
        "ppt",
        "pptx",
        "jpg",
        "jpeg",
        "png",
        "gif",
    ];

    const handleFiles = (files: File[]) => {
        const rejected: string[] = [];

        const validFiles = files.filter((file) => {
            const ext = file.name.split(".").pop()?.toLowerCase();
            if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
                rejected.push(file.name);
                return false;
            }
            return true;
        });

        setRejectedFiles(rejected);

        if (validFiles.length === 0) return;

        const newFiles: UploadedFile[] = validFiles.map((file, index) => ({
            id: Date.now() + index,
            name: file.name,
            status: "ready" as const,
            progress: 0,
            file,
        }));

        setUploadedFiles((prev) => [...prev, ...newFiles]);
    };
    // Eliminar archivo
    const handleRemoveFile = (fileId: string | number) => {
        setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    };

    // Manejar envío del formulario
    const handleSubmit = validate((values) => {
        if (loading) return;
        const formData: TicketFormData = {
            subject: values.subject.trim(),
            departmentId: values.departmentId,
            description: values.description,
            files: uploadedFiles,
        };
        onSubmit?.(formData);
    });

    // Manejar cancelación
    const handleCancel = () => {
        onCancel?.();
    };

    const department = departments.find((option) => String(option.value) === departmentId)?.label;
    const filesList = uploadedFiles.length > 0 && (
        <div className={styles.filesList}>
            {uploadedFiles.map((file) => (
                <FileItem
                    key={file.id}
                    name={file.name}
                    status={loading ? "uploading" : "ready"}
                    progress={loading ? uploadProgress : 0}
                    description={loading ? undefined : "Seleccionado · se enviará al guardar"}
                    onRemove={loading ? undefined : () => handleRemoveFile(file.id)}
                />
            ))}
        </div>
    );
    if (variant === "dialog")
        return (
            <form
                onSubmit={handleSubmit}
                noValidate
                className={classNames(styles.dialogForm, className)}
                aria-label="Nuevo ticket"
            >
                <div className={styles.dialogBody}>
                    <div className={styles.fieldsRow}>
                        <FormField
                            label="Asunto"
                            htmlFor="subject"
                            required
                            className={styles.fieldAsunto}
                            error={errors.subject?.message}
                        >
                            <Input
                                id="subject"
                                maxLength={150}
                                type="text"
                                value={subject}
                                autoFocus
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Ej. La impresora de recepción no imprime"
                                state={loading ? "disabled" : "default"}
                                required
                            />
                        </FormField>
                        <FormField
                            label="Área que atiende"
                            htmlFor="department"
                            required
                            error={errors.departmentId?.message}
                            className={styles.fieldDepartamento}
                        >
                            <Select
                                id="department"
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                                options={departments}
                                placeholder="Selecciona un área"
                                state={loading ? "disabled" : "default"}
                                required
                            />
                        </FormField>
                    </div>
                    <FormField
                        label="Descripción del problema"
                        htmlFor="description"
                        required
                        error={errors.description?.message}
                    >
                        <RichTextField
                            id="description"
                            readOnly={loading}
                            value={description}
                            onChange={setDescription}
                            placeholder="Qué ocurre, desde cuándo y qué ya intentaste…"
                        />
                    </FormField>
                    <div className={styles.dialogFiles}>
                        <span className={styles.dialogLabel}>
                            Archivos adjuntos <small>· opcional</small>
                        </span>
                        <FileDropzone
                            subtitle="PDF, Office o imágenes. Se envían al crear el ticket."
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                            onFiles={loading ? () => {} : handleFiles}
                            rejectedFiles={rejectedFiles}
                        />
                        {filesList}
                    </div>
                </div>
                <footer className={styles.dialogFooter}>
                    <p className={styles.help}>
                        {department ? `Lo recibirá ${department}` : "Los campos con * son obligatorios."}
                        {uploadedFiles.length > 0 &&
                            ` · ${uploadedFiles.length} ${uploadedFiles.length === 1 ? "adjunto" : "adjuntos"}`}
                    </p>
                    <div className={styles.dialogActions}>
                        <Button
                            type="button"
                            variant="outlined"
                            color="cancel"
                            onClick={handleCancel}
                            state={loading ? "disabled" : "default"}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="default"
                            state={loading ? "loading" : "default"}
                            loadingText="Enviando..."
                        >
                            Crear ticket
                        </Button>
                    </div>
                </footer>
            </form>
        );
    return (
        <div className={classNames(styles.TicketCreationPanel, className)}>
            <form onSubmit={handleSubmit} noValidate className={styles.form}>
                <section className={styles.details} aria-labelledby="ticket-details-title">
                    <Title variant="mid" tag="h2" id="ticket-details-title" className={styles.title}>
                        Detalles del ticket
                    </Title>
                    <p className={styles.help}>Los campos con * son obligatorios.</p>
                    <div className={styles.fieldsRow}>
                        <FormField
                            label="Asunto"
                            htmlFor="subject"
                            required
                            className={styles.fieldAsunto}
                            error={errors.subject?.message}
                        >
                            <Input
                                id="subject"
                                maxLength={150}
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Ingresa el asunto"
                                state={loading ? "disabled" : "default"}
                                required
                            />
                        </FormField>
                        <FormField
                            label="Departamento"
                            htmlFor="department"
                            required
                            error={errors.departmentId?.message}
                            className={styles.fieldDepartamento}
                        >
                            <Select
                                id="department"
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                                options={departments}
                                placeholder="Selecciona un departamento"
                                state={loading ? "disabled" : "default"}
                                required
                            />
                        </FormField>
                    </div>
                    <FormField
                        label="Descripción del problema"
                        htmlFor="description"
                        required
                        error={errors.description?.message}
                    >
                        <RichTextField
                            id="description"
                            readOnly={loading}
                            value={description}
                            onChange={setDescription}
                            placeholder="Describe el problema detalladamente..."
                        />
                    </FormField>
                </section>
                <section className={styles.filesSection} aria-labelledby="ticket-files-title">
                    <Title variant="mid" tag="h2" id="ticket-files-title">
                        Archivos adjuntos
                    </Title>
                    <FileDropzone
                        subtitle="PDF, documentos de Office e imágenes. Se enviarán al guardar."
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                        onFiles={loading ? () => {} : handleFiles}
                        rejectedFiles={rejectedFiles}
                    />
                    {filesList}
                </section>
                <aside className={styles.summary} aria-labelledby="ticket-summary-title">
                    <Title variant="mid" tag="h2" id="ticket-summary-title">
                        Resumen de la solicitud
                    </Title>
                    <p className={styles.help}>Verifica los datos antes de crear el ticket.</p>
                    <dl>
                        <div>
                            <dt>Departamento</dt>
                            <dd>{department || "Sin seleccionar"}</dd>
                        </div>
                        <div>
                            <dt>Asunto</dt>
                            <dd>{subject.trim() || "Sin asunto"}</dd>
                        </div>
                        <div>
                            <dt>Archivos</dt>
                            <dd>
                                {uploadedFiles.length} {uploadedFiles.length === 1 ? "adjunto" : "adjuntos"}
                            </dd>
                        </div>
                    </dl>
                </aside>
                <FormActions align="right" className={styles.formActions}>
                    <Button
                        type="button"
                        variant="outlined"
                        color="cancel"
                        onClick={handleCancel}
                        state={loading ? "disabled" : "default"}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="default"
                        icon="plus-solid"
                        state={loading ? "loading" : "default"}
                        loadingText="Enviando..."
                    >
                        Crear ticket
                    </Button>
                </FormActions>
            </form>
        </div>
    );
};
export default TicketCreationPanel;
