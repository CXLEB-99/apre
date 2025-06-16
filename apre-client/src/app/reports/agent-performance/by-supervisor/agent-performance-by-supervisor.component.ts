// src/app/reports/agent-performance/by-supervisor/agent-performance-by-supervisor.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { TableComponent } from '../../../shared/table/table.component';

@Component({
  selector: 'app-agent-performance-by-supervisor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableComponent],
  template: `
    <h1>Agent Performance by Supervisor</h1>
    <form [formGroup]="form" (ngSubmit)="fetchAgentPerformance()">
      <label for="supervisor">Select Supervisor:</label>
      <select id="supervisor" formControlName="supervisor" class="input">
        <option value="" disabled>Select a supervisor</option>
        <option *ngFor="let s of supervisors" [value]="s">{{ s }}</option>
      </select>
      <button type="submit" class="button button--primary" [disabled]="form.invalid">
        Fetch Data
      </button>
    </form>

    <app-table
      *ngIf="tableData.length > 0"
      [title]="'Agent Performance Results'"
      [headers]="tableHeaders"
      [data]="tableData"
      [sortableColumns]="tableHeaders"
      [recordsPerPage]="10"
      [headerBackground]="'primary'">
    </app-table>

    <div *ngIf="submitted && tableData.length === 0">
      <p>No results found for supervisor "{{ form.value.supervisor }}".</p>
    </div>
  `,
  styles: [`
    form { margin-bottom: 1rem; }
    .input { margin-right: 1rem; }
  `]
})
export class AgentPerformanceBySupervisorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  form!: FormGroup;
  supervisors: string[] = [];
  submitted = false;
  tableHeaders = ['Agent', 'Total Duration', 'Average Duration', 'Call Count'];
  // Average Duration may now be number or null
  tableData: Array<Record<string, string | number | null>> = [];

  ngOnInit(): void {
    this.form = this.fb.group({
      supervisor: [null, Validators.required]
    });

    this.http
      .get<string[]>(
        `${environment.apiBaseUrl}/reports/agent-performance/by-supervisor/available-supervisors`
      )
      .subscribe({
        next: list => this.supervisors = list,
        error: err => console.error('Error loading supervisors:', err)
      });
  }

  fetchAgentPerformance(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.tableData = [];
      return;
    }

    const sup = encodeURIComponent(this.form.value.supervisor as string);
    this.http
      .get<any[]>(
        `${environment.apiBaseUrl}/reports/agent-performance/by-supervisor?supervisor=${sup}`
      )
      .subscribe({
        next: data => {
          this.tableData = data.map(r => {
            const avg = r.averageDuration;
            return {
              Agent:                 r.agent,
              'Total Duration':      r.totalDuration,
              'Average Duration':    typeof avg === 'number'
                                      ? Number(avg.toFixed(2))
                                      : null,
              'Call Count':          r.callCount
            };
          });
        },
        error: err => {
          console.error('Error fetching performance:', err);
          this.tableData = [];
        }
      });
  }
}
