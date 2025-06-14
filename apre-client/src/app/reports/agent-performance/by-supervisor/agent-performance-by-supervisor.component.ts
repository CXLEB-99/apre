import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from '../../../shared/table/table.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-agent-performance-by-supervisor',
  standalone: true,
  imports: [ReactiveFormsModule, TableComponent],
  template: `
    <h1>Agent Performance by Supervisor</h1>
    <form class="form" [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form__group">
        <label for="supervisor">Select Supervisor:</label>
        <select class="select" formControlName="supervisor" id="supervisor">
          <option value="" disabled>Select a supervisor</option>
          <option *ngFor="let sup of supervisors" [value]="sup">{{ sup }}</option>
        </select>
      </div>
      <div class="form__actions">
        <input type="submit" class="button button--primary" value="Generate Report" />
      </div>
    </form>

    @if (agentData.length > 0) {
      <div class="card chart-card">
        <app-table
          [title]="'Performance Report for ' + selectedSupervisor"
          [data]="agentData"
          [headers]="['agent', 'callDuration']">
        </app-table>
      </div>
    }
  `,
  styles: ``
})
export class AgentPerformanceBySupervisorComponent {
  form = this.fb.group({
    supervisor: ['', Validators.required] // changed from `null` to empty string
  });

  supervisors: string[] = ['Smith', 'Johnson', 'Lee', 'Patel'];
  agentData: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  get selectedSupervisor(): string {
    return this.form.controls['supervisor'].value as string;
  }

  onSubmit(): void {
    const supervisor = this.selectedSupervisor;

    if (!supervisor) {
      alert('Please select a supervisor.');
      return;
    }

    this.http.get(`${environment.apiBaseUrl}/reports/agent-performance/by-supervisor?supervisor=${supervisor}`)
      .subscribe({
        next: (data: any) => this.agentData = data,
        error: (err: any) => console.error('Error fetching agent performance data: ', err)
      });
  }
}
