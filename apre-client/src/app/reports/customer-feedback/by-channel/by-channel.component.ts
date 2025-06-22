// by-channel.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChartComponent } from '../../../shared/chart/chart.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-by-channel',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  template: `
    <div class="by-channel">
      <h1>Customer Feedback by Channel</h1>

      <div *ngIf="channels.length > 0; else noData">
        <app-chart
          [type]="'bar'"
          [label]="'Average Feedback Rating by Channel'"
          [data]="averageRatings"
          [labels]="channels">
        </app-chart>
      </div>

      <ng-template #noData>
        <p *ngIf="loaded" class="no-data">
          No feedback data available.
        </p>
      </ng-template>
    </div>
  `,
  styles: [`
    .by-channel {
      padding: 1rem;
    }
    .no-data {
      color: #777;
      font-style: italic;
      margin-top: 1rem;
    }
  `]
})
export class ByChannelComponent implements OnInit {
  private http = inject(HttpClient);

  /** Holds chart labels and values */
  channels: string[] = [];
  averageRatings: number[] = [];

  /** Track if data has been attempted to load */
  loaded = false;

  ngOnInit(): void {
    this.fetchFeedbackByChannel();
  }

  private fetchFeedbackByChannel(): void {
    this.http
      .get<{ channel: string; averageRating: number }[]>(
        `${environment.apiBaseUrl}/reports/customer-feedback/by-channel`
      )
      .subscribe({
        next: (data) => {
          if (Array.isArray(data) && data.length > 0) {
            this.channels = data.map(d => d.channel);
            this.averageRatings = data.map(d => d.averageRating);
          } else {
            this.channels = [];
            this.averageRatings = [];
          }
          this.loaded = true;
        },
        error: (err) => {
          console.error('Error fetching feedback by channel:', err);
          this.loaded = true;
        }
      });
  }
}
