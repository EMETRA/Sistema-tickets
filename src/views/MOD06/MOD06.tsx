"use client";

import React, { useState } from 'react';
import { Title } from '../../components/client/atoms/Title';
import { FormField } from '../../components/client/molecules/FormField';
import { Button } from '../../components/client/atoms/Button';
import { Select } from '../../components/client/atoms/Select';

import { SuccessModal } from '../../components/client/organisms/SucessModal';

import styles from './MOD06.module.scss';


// Dummy data - La data tiene que venir del back
const company = [
    { label: "Empresa 1", value: '1' },
    { label: "Empresa 2", value: '2' },
    { label: "Empresa 3", value: '3' },
];

const user = [
    { label: "Usuario 1", value: '1' },
    { label: "Usuario 2", value: '2' },
    { label: "Usuario 3", value: '3' },
];

const application = [
    { label: "Aplicación 1", value: '1' },
    { label: "Aplicación 2", value: '2' },
    { label: "Aplicación 3", value: '3' },
];

const userOrigin = [
    { label: "Usuario 1", value: '1' },
    { label: "Usuario 2", value: '2' },
    { label: "Usuario 3", value: '3' },
];

const userDestiny = [
    { label: "Usuario 1", value: '1' },
    { label: "Usuario 2", value: '2' },
    { label: "Usuario 3", value: '3' },
];

const MOD06: React.FC = () => {
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
                            options={company}
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
                            options={user}
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
                            options={application}
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
                            options={userOrigin}
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
                            options={userDestiny}
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
