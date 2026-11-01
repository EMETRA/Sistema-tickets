"use client";

import React, { useState } from "react";
import classNames from "classnames";
import { Title } from "../../atoms/Title";
import { FormField } from "../../molecules/FormField";
import { Input } from "../../atoms/Input";
import { Select } from "../../atoms/Select";
import { FileDropzone } from "../../molecules/FileDropzone";
import { FileItem } from "../../molecules/FileItem";
import { FormActions } from "../../molecules/FormActions";
import { Button } from "../../atoms/Button";
import type {
    TicketCreationPanelProps,
    TicketFormData,
    UploadedFile,
} from "./types";
import styles from "./TicketCreationPanel.module.scss";
import { RichTextField } from "../../molecules/RichTextField";

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
}) => {
    // Estados del formulario
    const [subject, setSubject] = useState(initialValues?.subject || "");
    const [departmentId, setDepartmentId] = useState(
        initialValues?.departmentId?.toString() || "",
    );
    const [description, setDescription] = useState(
        initialValues?.description || "",
    );
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
        initialValues?.files || [],
    );
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
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (loading) return;
        const formData: TicketFormData = {
            subject,
            departmentId,
            description,
            files: uploadedFiles,
        };

        onSubmit?.(formData);
    };

    // Manejar cancelación
    const handleCancel = () => {
        onCancel?.();
    };

    const department = departments.find(option => String(option.value) === departmentId)?.label;
    return (
        <div className={classNames(styles.TicketCreationPanel, className)}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <section className={styles.details} aria-labelledby="ticket-details-title">
                    <Title variant="mid" tag="h2" id="ticket-details-title" className={styles.title}>Detalles del ticket</Title>
                    <p className={styles.help}>Los campos con * son obligatorios.</p>
                    <div className={styles.fieldsRow}>
                        <FormField label="Asunto" htmlFor="subject" required className={styles.fieldAsunto}>
                            <Input id="subject" maxLength={150} type="text" value={subject}
                                onChange={(e) => setSubject(e.target.value)} placeholder="Ingresa el asunto"
                                state={loading ? "disabled" : "default"} required />
                        </FormField>
                        <FormField label="Departamento" htmlFor="department" required className={styles.fieldDepartamento}>
                            <Select id="department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
                                options={departments} placeholder="Selecciona un departamento"
                                state={loading ? "disabled" : "default"} required />
                        </FormField>
                    </div>
                    <FormField label="Descripción del problema" htmlFor="description" required>
                        <RichTextField id="description" readOnly={loading} value={description} onChange={setDescription} placeholder="Describe el problema detalladamente..." />
                    </FormField>
                </section>
                <section className={styles.filesSection} aria-labelledby="ticket-files-title">
                    <Title variant="mid" tag="h2" id="ticket-files-title">Archivos adjuntos</Title>
                    <p className={styles.help}>Los archivos se enviarán al crear la solicitud.</p>
                    <FileDropzone subtitle="PDF, documentos de Office e imágenes. Se enviarán al guardar." accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.gif" onFiles={loading ? () => {} : handleFiles} rejectedFiles={rejectedFiles} />
                    {uploadedFiles.length > 0 && <div className={styles.filesList}>
                        {uploadedFiles.map(file => <FileItem key={file.id} name={file.name}
                            status={loading ? "uploading" : "ready"} progress={loading ? uploadProgress : 0}
                            description={loading ? undefined : "Seleccionado · se enviará al guardar"}
                            onRemove={loading ? undefined : () => handleRemoveFile(file.id)} />)}
                    </div>}
                </section>
                <aside className={styles.summary} aria-labelledby="ticket-summary-title">
                    <Title variant="mid" tag="h2" id="ticket-summary-title">Resumen de la solicitud</Title>
                    <p className={styles.help}>Verifica los datos antes de crear el ticket.</p>
                    <dl>
                        <div><dt>Departamento</dt><dd>{department || "Sin seleccionar"}</dd></div>
                        <div><dt>Asunto</dt><dd>{subject.trim() || "Sin asunto"}</dd></div>
                        <div><dt>Archivos</dt><dd>{uploadedFiles.length} {uploadedFiles.length === 1 ? "adjunto" : "adjuntos"}</dd></div>
                    </dl>
                    <p className={styles.summaryHint}>Consulta el estado de tu solicitud desde Mis tickets.</p>
                </aside>
                <FormActions align="right" className={styles.formActions}>
                    <p>La solicitud se creará al confirmar.</p>
                    <Button type="button" variant="outlined" color="cancel" onClick={handleCancel}
                        state={loading ? "disabled" : "default"}>Cancelar</Button>
                    <Button type="submit" variant="contained" color="default" icon="plus-solid"
                        state={loading ? "loading" : "default"} loadingText="Enviando...">Crear ticket</Button>
                </FormActions>
            </form>
        </div>
    );
};
export default TicketCreationPanel;
