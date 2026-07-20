"use client";

import React, { useState } from 'react';
import { Title } from '../../components/client/atoms/Title';
import { FormField } from '../../components/client/molecules/FormField';
import { Button } from '../../components/client/atoms/Button';
import { Select } from '../../components/client/atoms/Select';

import { SuccessModal } from '../../components/client/organisms/SucessModal';

import {
    useGetFuncionesPorUsuarioEmpresas,
    useGetFuncionesPorUsuarioUsuarios,
    useGetFuncionesPorUsuarioAplicaciones,
} from '@/api/hooks';

import styles from './MOD06.module.scss';

const MOD06: React.FC = () => {
    const { data: empresasData, loading: empresasLoading, error: empresasError } = useGetFuncionesPorUsuarioEmpresas();
    const { data: usuariosData, loading: usuariosLoading, error: usuariosError } = useGetFuncionesPorUsuarioUsuarios();
    const { data: aplicacionesData, loading: aplicacionesLoading, error: aplicacionesError } = useGetFuncionesPorUsuarioAplicaciones();

    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [selectedGeneralUser, setSelectedGeneralUser] = useState<string>('');
    const [selectedApplication, setSelectedApplication] = useState<string>('');
    const [selectedUserOrigin, setSelectedUserOrigin] = useState<string>('');
    const [selectedUserDestiny, setSelectedUserDestiny] = useState<string>('');

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const handleExecute = () => {
        if (selectedCompany === '' || selectedGeneralUser === '' || selectedApplication === '' || selectedUserOrigin === '' || selectedUserDestiny === '') {
            alert('Por favor, complete todos los campos antes de ejecutar el proceso.');
            return;
        }

        alert(`Ejecutando proceso con:\nEmpresa: ${selectedCompany}\nUsuario General: ${selectedGeneralUser}\nAplicación: ${selectedApplication}\nUsuario Origen: ${selectedUserOrigin}\nUsuario Destino: ${selectedUserDestiny}`);
        setIsModalOpen(true);
    };

    if (empresasLoading || usuariosLoading || aplicacionesLoading) {
        return <div className={styles.loadingContainer}>
            Cargando datos...
        </div>;
    }

    if (empresasError || usuariosError || aplicacionesError) {
        return <div className={styles.errorContainer}>
            Ocurrió un error al cargar los datos. Por favor, intente nuevamente.
        </div>;
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>

                <Title variant="mid" tag="h4" className={styles.title}>Información general</Title>
                <div className={styles.generalInfomationContainer}>
                    {/* Empresa */}
                    <FormField label="Empresa" htmlFor="company" required className={styles.fieldCompany}>
                        <Select
                            id="company"
                            value={selectedCompany}
                            onChange={(e) => {
                                setSelectedCompany(e.target.value);
                            }}
                            options={empresasData.map((item) => ({ label: item.nombre, value: item.empresa }))}
                            placeholder="Seleccionar empresa"
                        />
                    </FormField>

                    {/* Usuario General */}
                    <FormField label="Usuario General" htmlFor="generalUser" required className={styles.fieldGeneralUser}>
                        <Select
                            id="generalUser"
                            value={selectedGeneralUser}
                            onChange={(e) => {
                                setSelectedGeneralUser(e.target.value);
                            }}
                            options={usuariosData.map((item) => ({ label: item.usuario, value: item.asignaUsuario }))}
                            placeholder="Seleccionar usuario general"
                        />
                    </FormField>

                    {/* Aplicación */}
                    <FormField label="Aplicación" htmlFor="application" required className={styles.fieldApplication}>
                        <Select
                            id="application"
                            value={selectedApplication}
                            onChange={(e) => {
                                setSelectedApplication(e.target.value);
                            }}
                            options={aplicacionesData.map((item) => ({ label: item.nombre, value: item.aplicacion }))}
                            placeholder="Seleccionar aplicación"
                        />
                    </FormField>
                </div>

                <Title variant="mid" tag="h4" className={styles.title}>Copiar permisos</Title>
                <div className={styles.userPermissionsContainer}>
                    {/* Usuario Origen */}
                    <FormField label="Usuario Origen" htmlFor="userOrigin" required className={styles.fieldUserOrigin}>
                        <Select
                            id="userOrigin"
                            value={selectedUserOrigin}
                            onChange={(e) => {
                                setSelectedUserOrigin(e.target.value);
                            }}
                            options={usuariosData.map((item) => ({ label: item.usuario, value: item.asignaUsuario }))}
                            placeholder="Seleccionar usuario origen"
                        />
                    </FormField>

                    {/* Usuario Destino */}
                    <FormField label="Usuario Destino" htmlFor="userDestiny" required className={styles.fieldUserDestiny}>
                        <Select
                            id="userDestiny"
                            value={selectedUserDestiny}
                            onChange={(e) => {
                                setSelectedUserDestiny(e.target.value);
                            }}
                            options={usuariosData.map((item) => ({ label: item.usuario, value: item.asignaUsuario }))}
                            placeholder="Seleccionar usuario destino"
                        />
                    </FormField>

                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleExecute}
                        className={styles.executeButton}
                    >
                        Copiar
                    </Button>
                </div>
            </div>
            <SuccessModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                message="Cambios realizados exitosamente"
            />
        </div>
    )
}

export default MOD06;
