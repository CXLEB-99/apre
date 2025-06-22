// by-channel.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ByChannelComponent } from './by-channel.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChartComponent } from '../../../shared/chart/chart.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

describe('ByChannelComponent', () => {
  let fixture: ComponentFixture<ByChannelComponent>;
  let component: ByChannelComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        CommonModule,
        ChartComponent,
        ByChannelComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ByChannelComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch feedback and map data into channels and averageRatings, then render chart', () => {
    const mockResponse = [
      { channel: 'Email', averageRating: 4.2 },
      { channel: 'Phone', averageRating: 3.8 }
    ];

    fixture.detectChanges(); // triggers ngOnInit

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/customer-feedback/by-channel`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    fixture.detectChanges(); // apply data to view

    expect(component.channels).toEqual(['Email', 'Phone']);
    expect(component.averageRatings).toEqual([4.2, 3.8]);

    const compiled = fixture.nativeElement;
    const chart = compiled.querySelector('app-chart');
    expect(chart).toBeTruthy();
  });

  it('should show "No feedback data available." if API returns empty array', () => {
    fixture.detectChanges(); // triggers ngOnInit

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/customer-feedback/by-channel`);
    req.flush([]); // simulate empty response

    fixture.detectChanges(); // apply state

    const compiled = fixture.nativeElement;
    const noData = compiled.querySelector('.no-data');
    expect(noData).toBeTruthy();
    expect(noData.textContent).toContain('No feedback data available');
  });
});
