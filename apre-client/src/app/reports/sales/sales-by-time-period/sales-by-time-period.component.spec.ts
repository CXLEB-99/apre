//sales-by-time-period.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesByTimePeriodComponent } from './sales-by-time-period.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from '../../../shared/table/table.component';

describe('SalesByTimePeriodComponent', () => {
  let component: SalesByTimePeriodComponent;
  let fixture: ComponentFixture<SalesByTimePeriodComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule, TableComponent],
      declarations: [SalesByTimePeriodComponent]
    });

    fixture = TestBed.createComponent(SalesByTimePeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty salesData array', () => {
    expect(component.salesData).toEqual([]);
  });

  it('should validate form as invalid when fields are empty', () => {
    expect(component.timePeriodForm.valid).toBeFalsy();
  });
});
