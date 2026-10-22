"use client";

import { useState } from "react";
import { z } from "zod";
import { FormField } from '@/components/client/molecules/FormField';
import { Input } from '@/components/client/atoms/Input';
import { Button } from '@/components/client/atoms/Button';

import { FileDropzone } from '@/components/client/molecules/FileDropzone';
import { FileItem, FileItemProps } from '@/components/client/molecules/FileItem';
import { UploadedFile } from '@/views/MOD10/types';

import { createAnalistSchema } from './CreateAnalist.schema';
import styles from "./CreateAnalist.module.scss";

const CreateAnalist: React.FC = () => {
    const [formData, setFormData] = useState<z.infer<typeof createAnalistSchema>>({
        name: '',
        lastName: '',
        dpi: '',
        nit: '',
        email: '',
        password: '',
        phone: '',
        birthDate: '',
    });

    const [uploadedPicture, setUploadedPicture] = useState<UploadedFile>();
    const [rejectedPictures, setRejectedPictures] = useState<string[]>([]);
    const [uploadedDpi, setUploadedDpi] = useState<UploadedFile>();
    const [rejectedDpis, setRejectedDpis] = useState<string[]>([]);
    const ALLOWED_PICTURE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

    const handleFile = (file: File, type: 'picture' | 'dpi') => {
        if (type === 'picture') {
            setRejectedPictures([]);
        } else {
            setRejectedDpis([]);
        }

        if (!ALLOWED_PICTURE_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(`.${ext}`))) {
            if (type === 'picture') {
                setRejectedPictures(prev => [...prev, file.name]);
            } else {
                setRejectedDpis(prev => [...prev, file.name]);
            }
            return;
        }

        const newPicture: UploadedFile = {
            id: Date.now(),
            name: file.name,
            status: "ready",
            progress: 0,
            file,
        };

        if (type === 'picture') {
            setUploadedPicture(newPicture);
        } else {
            setUploadedDpi(newPicture);
        }
    };
    // Eliminar archivo
    const handleRemoveFile = (type: 'picture' | 'dpi') => {
        if (type === 'picture') {
            setUploadedPicture(undefined);
        } else {
            setUploadedDpi(undefined);
        }
    };

    const handleSubmit = () => {
        const result = createAnalistSchema.safeParse(formData);
        if (!result.success) {
            alert(result.error.issues.map(issue => issue.message).join('\n'));
            return;
        }
        if (!uploadedPicture) {
            alert("La foto de perfil es requerida");
            return;
        }
        if (!uploadedDpi) {
            alert("El DPI (ambas caras) es requerido");
            return;
        }
        alert(JSON.stringify(result.data));
        return;
    };

    
    return (
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>
                {/* Nombre */}
                <FormField label="Nombre" htmlFor="name" required className={styles.fieldName}>
                    <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ingresa el nombre del analista"
                        // state={loading ? "disabled" : "default"}
                        required
                    />
                </FormField>

                {/* Apellido */}
                <FormField label="Apellido" htmlFor="lastName" required className={styles.lastNameField}>
                    <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Ingresa el apellido del analista"
                        required
                    />
                </FormField>

                {/* DPI */}
                <FormField label="DPI" htmlFor="dpi" required className={styles.dpiField}>
                    <Input
                        id="dpi"
                        type="text"
                        value={formData.dpi}
                        onChange={(e) => setFormData({ ...formData, dpi: e.target.value })}
                        placeholder="Ingresa el DPI del analista"
                        required
                    />
                </FormField>

                {/* NIT */}
                <FormField label="NIT" htmlFor="nit" required className={styles.nitField}>
                    <Input
                        id="nit"
                        type="text"
                        value={formData.nit}
                        onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                        placeholder="Ingresa el NIT del analista"
                        required
                    />
                </FormField>

                {/* Email */}
                <FormField label="Email" htmlFor="email" required className={styles.emailField}>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Ingresa el email del analista"
                        required
                    />
                </FormField>

                {/* Contraseña */}
                <FormField label="Contraseña" htmlFor="password" required className={styles.passwordField}>
                    <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Ingresa la contraseña del analista"
                        required
                    />
                </FormField>

                {/* Teléfono */}
                <FormField label="Teléfono" htmlFor="phone" required className={styles.phoneField}>
                    <Input
                        id="phone"
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Ingresa el teléfono del analista"
                        required
                    />
                </FormField>

                {/* Fecha de nacimiento */}
                <FormField label="Fecha de nacimiento" htmlFor="birthDate" required className={styles.birthDateField}>
                    <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        placeholder="Ingresa la fecha de nacimiento del analista"
                        required
                    />
                </FormField>
            </div>

            <div className={styles.fileInputContainer}>
                {/* Foto de perfil */}
                <FormField label="Foto de perfil" htmlFor="profilePicture" required className={styles.profilePictureField}>
                    {uploadedPicture ? (
                        <FileItem
                            key={uploadedPicture.id}
                            name={uploadedPicture.name}
                            status={uploadedPicture.status}
                            progress={100}
                            onRemove={() => handleRemoveFile('picture')}
                        />
                    ) : (
                        <FileDropzone
                            onFiles={(file) => handleFile(file[0], 'picture')}
                            rejectedFiles={rejectedPictures}
                            title="Arrastra y suelta la foto de perfil del analista"
                            subtitle="La foto de perfil debe ser un archivo de imagen (JPG, JPEG, PNG, WEBP) y debe tener un tamaño máximo de 10MB"
                        />
                    )}
                </FormField>

                {/* DPI */}
                <FormField label="DPI (ambas caras)" htmlFor="dpi" required className={styles.dpiField}>
                    {uploadedDpi ? (
                        <FileItem
                            key={uploadedDpi.id}
                            name={uploadedDpi.name}
                            status={uploadedDpi.status}
                            progress={100}
                            onRemove={() => handleRemoveFile('dpi')}
                        />
                    ) : (
                        <FileDropzone
                            onFiles={(file) => handleFile(file[0], 'dpi')}
                            rejectedFiles={rejectedDpis}
                            title="Arrastra y suelta el DPI (ambas caras) del analista"
                            subtitle="El DPI (ambas caras) debe ser un archivo de imagen (JPG, JPEG, PNG, WEBP) y debe tener un tamaño máximo de 10MB"
                        />
                    )}
                </FormField>
            </div>

            {/* Botón de submit */}
            <Button type="submit" state="default" onClick={handleSubmit} className={styles.submitButton}>
                Crear analista
            </Button>
        </div>
    );
};

export default CreateAnalist;
