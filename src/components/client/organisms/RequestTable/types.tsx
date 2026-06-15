export interface Request {
    id: number;
    name: string;
    email: string;
    employeeNumber: string;
    budget: string;
    position: string;
    status: string;
};

export interface RequestTableProps {
    requests: Request[];
    onApproveAll?: (ids: number[]) => void;
    onApprove?: (id: number) => void;
    className?: string;
};
