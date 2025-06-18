// agent-performance-by-supervisor.component.spec.ts  
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentPerformanceBySupervisorComponent } from './agent-performance-by-supervisor.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from '../../../shared/table/table.component';
import { environment } from '../../../../environments/environment';

describe('AgentPerformanceBySupervisorComponent', () => {
  let fixture: ComponentFixture<AgentPerformanceBySupervisorComponent>;
  let component: AgentPerformanceBySupervisorComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        TableComponent,
        AgentPerformanceBySupervisorComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgentPerformanceBySupervisorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/agent-performance/by-supervisor/available-supervisors`
    );
    expect(req.request.method).toBe('GET');
    req.flush(['jsmith', 'ldavis']);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load only supervisor usernames on init', () => {
    expect(component.supervisors).toEqual(['jsmith', 'ldavis']);
  });

  it('should fetch and map agent performance into tableData with formatted averageDuration', () => {
    component.form.setValue({ supervisor: 'jsmith' });
    component.fetchAgentPerformance();

    const perfReq = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/agent-performance/by-supervisor?supervisor=jsmith`
    );
    expect(perfReq.request.method).toBe('GET');

    const mock = [
      { agent: 'Agent A', totalDuration: 120, averageDuration: 32.456, callCount: 4 },
      { agent: 'Agent B', totalDuration: 90, averageDuration: null, callCount: 2 }
    ];
    perfReq.flush(mock);

    expect(component.tableData).toEqual([
      {
        Agent: 'Agent A',
        'Total Duration': 120,
        'Average Duration': 32.46,
        'Call Count': 4
      },
      {
        Agent: 'Agent B',
        'Total Duration': 90,
        'Average Duration': null,
        'Call Count': 2
      }
    ]);
        
  });
});
