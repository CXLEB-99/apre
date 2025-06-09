import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from '../../../shared/table/table.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-sales-by-time-period',
  standalone: true,
  imports: [ReactiveFormsModule, TableComponent],
  template: `
    <h1>Sales by Time Period</h1>
    <div class="sales-container">
      <form class="form" [formGroup]="timePeriodForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label for="startDate">Start Date:</label>
          <input class="input" type="date" formControlName="startDate" id="startDate" name="startDate">
        </div>

        <div class="form__group">
          <label for="endDate">End Date:</label>
          <input class="input" type="date" formControlName="endDate" id="endDate" name="endDate">
        </div>

        <div class="form__actions">
          <input type="submit" class="button button--primary" value="Generate Report" />
        </div>
      </form>

      @if (salesData.length > 0) {
        <div class="card chart-card">
          <app-table
            [title]="reportTitle"
            [data]="salesData"
            [headers]="['date','region','product','category','salesperson','channel','amount']">
          </app-table>
        </div>
      }
    </div>
  `,
  styles: ``
})
export class SalesByTimePeriodComponent {
  salesData: any[] = [];

  timePeriodForm = this.fb.group({
    startDate: [null, Validators.required],
    endDate: [null, Validators.required]
  });

  get reportTitle(): string {
    const startDate = this.timePeriodForm.controls['startDate'].value;
    const endDate = this.timePeriodForm.controls['endDate'].value;

    if (startDate && endDate) {
      return `Sales from ${startDate} to ${endDate}`;
    }

    return 'Sales by Time Period';
  }

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  onSubmit() {
    const { startDate, endDate } = this.timePeriodForm.value;

    this.http.get(`${environment.apiBaseUrl}/reports/sales/time-period?startDate=${startDate}&endDate=${endDate}`)
      .subscribe({
        next: (data) => { this.salesData = data as any[]; },
        error: (err) => { console.error('Error fetching sales data: ', err); }
      });
  }
}
