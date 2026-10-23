import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Employee, EmployeePayload } from './employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/employees';

  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.endpoint);
  }

  create(employee: EmployeePayload): Observable<Employee> {
    return this.http.post<Employee>(this.endpoint, employee);
  }

  update(id: number, employee: EmployeePayload): Observable<Employee> {
    return this.http.put<Employee>(`${this.endpoint}/${id}`, { ...employee, id });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
