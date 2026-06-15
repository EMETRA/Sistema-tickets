export interface Enroll {
    id: number;
    name: string;
    department: string;
    employeeNumber: string;
    permission: string;
    status: string;
};

export interface EnrollTableProps {
    enroll: Enroll[];
    onApprove?: (id: number) => void;
    onApproveAll?: (ids: number[]) => void;
    className?: string;
};
