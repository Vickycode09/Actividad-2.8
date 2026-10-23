import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { App } from './app';
import { EmployeeService } from './employee.service';

describe('App', () => {
  let apiAvailable = true;

  beforeEach(async () => {
    apiAvailable = true;
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: EmployeeService,
          useValue: {
            getAll: () => (apiAvailable ? of([]) : throwError(() => new Error('API unavailable'))),
          },
        },
      ],
    }).compileComponents();
  });

  it('should render the employee directory', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Directorio del equipo');
  });

  it('allows retrying after the API becomes available', async () => {
    apiAvailable = false;
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudo conectar con la API.');

    apiAvailable = true;
    fixture.nativeElement.querySelector('.retry-button').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.notice')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Aún no hay empleados');
  });
});
