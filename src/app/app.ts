import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee, EmployeePayload } from './employee.model';
import { EmployeeService } from './employee.service';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly employeeService = inject(EmployeeService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly employees = signal<Employee[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly formOpen = signal(false);
  protected readonly editingEmployee = signal<Employee | null>(null);
  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly notice = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  protected readonly filteredEmployees = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase();
    if (!query) return this.employees();

    return this.employees().filter((employee) =>
      [employee.name, employee.email, employee.department, employee.position]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query),
    );
  });
  protected readonly activeCount = computed(
    () => this.employees().filter((employee) => employee.status === 'Activo').length,
  );
  protected readonly averageSalary = computed(() => {
    const employees = this.employees();
    if (employees.length === 0) return 0;
    return employees.reduce((total, employee) => total + employee.salary, 0) / employees.length;
  });

  protected readonly employeeForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    department: ['', Validators.required],
    position: ['', [Validators.required, Validators.maxLength(80)]],
    salary: [0, [Validators.required, Validators.min(0)]],
    status: ['Activo' as Employee['status'], Validators.required],
  });

  constructor() {
    this.loadEmployees();
  }

  protected loadEmployees(): void {
    this.loading.set(true);
    this.notice.set(null);
    this.employeeService.getAll().subscribe({
      next: (employees) => {
        this.employees.set(employees);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showNotice(
          'error',
          'No se pudo conectar con la API. Inicia los servicios con npm start; si Angular ya está abierto, ejecuta npm run api. Después, vuelve a intentarlo.',
        );
      },
    });
  }

  protected setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  protected updateSearch(event: Event): void {
    this.setSearchTerm((event.target as HTMLInputElement).value);
  }

  protected dismissNotice(): void {
    this.notice.set(null);
  }

  protected openCreateForm(): void {
    this.editingEmployee.set(null);
    this.employeeForm.reset({
      name: '',
      email: '',
      department: '',
      position: '',
      salary: 0,
      status: 'Activo',
    });
    this.formOpen.set(true);
    this.notice.set(null);
  }

  protected openEditForm(employee: Employee): void {
    this.editingEmployee.set(employee);
    this.employeeForm.reset({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      salary: employee.salary,
      status: employee.status,
    });
    this.formOpen.set(true);
    this.notice.set(null);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editingEmployee.set(null);
  }

  protected submitForm(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const employee: EmployeePayload = this.employeeForm.getRawValue();
    const current = this.editingEmployee();
    this.saving.set(true);
    this.notice.set(null);

    const request = current
      ? this.employeeService.update(current.id, employee)
      : this.employeeService.create(employee);

    request.subscribe({
      next: (savedEmployee) => {
        this.employees.update((employees) =>
          current
            ? employees.map((item) => (item.id === current.id ? savedEmployee : item))
            : [savedEmployee, ...employees],
        );
        this.saving.set(false);
        this.closeForm();
        this.showNotice('success', current ? 'Los cambios se guardaron correctamente.' : 'El empleado se agregó correctamente.');
      },
      error: () => {
        this.saving.set(false);
        this.showNotice('error', 'No se pudo guardar el empleado. Inténtalo de nuevo.');
      },
    });
  }

  protected askToDelete(id: number): void {
    this.pendingDeleteId.set(id);
  }

  protected cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }

  protected deleteEmployee(employee: Employee): void {
    this.employeeService.delete(employee.id).subscribe({
      next: () => {
        this.employees.update((employees) => employees.filter((item) => item.id !== employee.id));
        this.pendingDeleteId.set(null);
        this.showNotice('success', `${employee.name} se eliminó correctamente.`);
      },
      error: () => {
        this.pendingDeleteId.set(null);
        this.showNotice('error', 'No se pudo eliminar el empleado. Inténtalo de nuevo.');
      },
    });
  }

  protected formatSalary(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  protected initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toLocaleUpperCase())
      .join('');
  }

  private showNotice(type: 'success' | 'error', text: string): void {
    this.notice.set({ type, text });
  }
}
