export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  status: 'Activo' | 'Inactivo';
}

export type EmployeePayload = Omit<Employee, 'id'>;
