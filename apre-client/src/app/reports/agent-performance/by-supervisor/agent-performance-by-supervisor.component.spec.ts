import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentPerformanceBySupervisorComponent } from './agent-performance-by-supervisor.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from '../../../shared/table/table.component';
import { environment } from '../../../../environments/environment';

describe('AgentPerformanceBySupervisorComponent', () => {
  let component: AgentPerformanceBySupervisorComponent;
  let fixture: ComponentFixture<AgentPerformanceBySupervisorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, TableComponent],
      declarations: [AgentPerformanceBySupervisorComponent]
    });

    fixture = TestBed.createComponent(AgentPerformanceBySupervisorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should mark form as invalid if supervisor not selected', () => {
    component.form.controls['supervisor'].setValue(null);
    expect(component.form.valid).toBeFalse();
  });

  it('should fetch agent data on valid form submission', () => {
    const mockData = [{ agent: 'Agent A', callDuration: 100 }];
    component.form.controls['supervisor'].setValue('Smith');
    component.onSubmit();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/agent-performance/by-supervisor?supervisor=Smith`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);

    expect(component.agentData).toEqual(mockData);
  });
});
