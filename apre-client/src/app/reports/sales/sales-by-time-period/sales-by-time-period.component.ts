// sales-by-time-period.component.ts
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from '../../../shared/table/table.component';
import { environment } from '../../../../environments/environment';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales-by-time-period',
  standalone: true,
  imports: [ReactiveFormsModule, TableComponent, CommonModule],
  providers: [DatePipe],
  template: `
    <h1>Sales by Time Period</h1>
    <div class="sales-container">
      <form class="form" [formGroup]="timePeriodForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label for="startDate">Start Date:</label>
          <input class="input" type="date" formControlName="startDate" id="startDate" name="startDate" />
        </div>

        <div class="form__group">
          <label for="endDate">End Date:</label>
          <input class="input" type="date" formControlName="endDate" id="endDate" name="endDate" />
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
            [headers]="['date', 'region', 'product', 'category', 'salesperson', 'channel', 'amount']"
            [recordsPerPage]="10"
            [sortableColumns]="['date', 'region', 'product', 'category', 'salesperson', 'channel', 'amount']"
            [headerBackground]="'default'">
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
    const start = this.timePeriodForm.controls['startDate'].value;
    const end   = this.timePeriodForm.controls['endDate'].value;
    return start && end
      ? `Sales from ${this.datePipe.transform(start, 'MM/dd/yyyy')} to ${this.datePipe.transform(end, 'MM/dd/yyyy')}`
      : 'Sales by Time Period';
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private datePipe: DatePipe
  ) {}

  onSubmit(): void {
    if (this.timePeriodForm.invalid) {
      alert('Please select both a start and end date.');
      return;
    }
  
    const { startDate, endDate } = this.timePeriodForm.value;
    const timestamp = Date.now();
  
    this.http
      .get<any[]>(
        `${environment.apiBaseUrl}/reports/sales/time-period` +
        `?startDate=${startDate}&endDate=${endDate}&_=${timestamp}`
      )
      .subscribe({
        next: (data) => {
          // Format each entry's date before binding to the table
          this.salesData = data.map(entry => ({
            ...entry,
            date: this.datePipe.transform(entry.date, 'MM/dd/yyyy')
          }));
        },
        error: (err) => {
          console.error('Error fetching sales data:', err);
          alert('There was a problem retrieving the sales report.');
        }
      });
  }
}
