import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EmployeeService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('loads employees with GET', () => {
    service.getAll().subscribe();
    const request = httpTesting.expectOne('/api/employees');

    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('creates employees with POST', () => {
    const employee = {
      name: 'Ana López',
      email: 'ana@example.com',
      department: 'Diseño',
      position: 'Diseñadora',
      salary: 35000,
      status: 'Activo' as const,
    };
    service.create(employee).subscribe();
    const request = httpTesting.expectOne('/api/employees');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(employee);
    request.flush({ ...employee, id: 6 });
  });

  it('updates employees with PUT', () => {
    const employee = {
      name: 'Ana López',
      email: 'ana@example.com',
      department: 'Diseño',
      position: 'Diseñadora',
      salary: 35000,
      status: 'Activo' as const,
    };
    service.update(6, employee).subscribe();
    const request = httpTesting.expectOne('/api/employees/6');

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ ...employee, id: 6 });
    request.flush({ ...employee, id: 6 });
  });

  it('deletes employees with DELETE', () => {
    service.delete(6).subscribe();
    const request = httpTesting.expectOne('/api/employees/6');

    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
