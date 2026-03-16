"use client";

import React, { useState } from "react";
import classNames from "classnames";
import { Title } from "../../atoms/Title";
import { FormField } from "../../molecules/FormField";
import { Input } from "../../atoms/Input";
import { Select } from "../../atoms/Select";
import { TextArea } from "../../atoms/TextArea";
import { FileDropzone } from "../../molecules/FileDropzone";
import { FileItem } from "../../molecules/FileItem";
import { FormActions } from "../../molecules/FormActions";
import { Button } from "../../atoms/Button";
import type { TicketCreationPanelProps, TicketFormData, UploadedFile } from "./types";
import styles from "./TicketCreationPanel.module.scss";

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
  initialValues,
  className,
}) => {
  // Estados del formulario
  const [subject, setSubject] = useState(initialValues?.subject || "");
  const [departmentId, setDepartmentId] = useState(initialValues?.departmentId?.toString() || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialValues?.files || []);

  // Manejar archivos desde el dropzone
  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      status: "uploading" as const,
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  // Eliminar archivo
  const handleRemoveFile = (fileId: string | number) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

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

  return (
    <div className={classNames(styles.TicketCreationPanel, className)}>
      <Title variant="mid" tag="h2" className={styles.title}>
        Detalles del ticket
      </Title>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldsRow}>
          {/* Asunto */}
          <FormField label="Asunto" htmlFor="subject" required className={styles.fieldAsunto}>
            <Input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ingresa el asunto"
              state={loading ? "disabled" : "default"}
              required
            />
          </FormField>

          {/* Departamento */}
          <FormField label="Departamento" htmlFor="department" required className={styles.fieldDepartamento}>
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

        {/* Descripción del problema */}
        <FormField label="Descripción del problema" htmlFor="description" required>
          <TextArea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el problema..."
            rows={4}
            state={loading ? "disabled" : "default"}
            required
          />
        </FormField>

        {/* Archivos */}
        <div className={styles.filesSection}>
          <FileDropzone onFiles={handleFiles} />

          {uploadedFiles.length > 0 && (
            <div className={styles.filesList}>
              {uploadedFiles.map(file => (
                <FileItem
                  key={file.id}
                  name={file.name}
                  status={file.status}
                  progress={file.progress}
                  onRemove={() => handleRemoveFile(file.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <FormActions align="center">
          <Button
            type="button"
            variant="contained"
            color="cancel"
            rounded
            onClick={handleCancel}
            state={loading ? "disabled" : "default"}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="default"
            rounded
            icon="arrow-right-solid"
            state={loading ? "loading" : "default"}
            loadingText="Enviando..."
          >
            Enviar
          </Button>
        </FormActions>
      </form>
    </div>
  );
};

export default TicketCreationPanel;
