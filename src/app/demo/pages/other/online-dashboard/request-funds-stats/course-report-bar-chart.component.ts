import { Component, OnInit, inject, effect } from '@angular/core';
import { ThemeLayoutService } from 'src/app/@theme/services/theme-layout.service';
import { AdminService } from 'src/app/@theme/services/admin.service';
import { DARK, LIGHT } from 'src/app/@theme/const';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { RequestFundsStats } from 'src/app/@theme/models/statistics';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-funds-chart',
  imports: [SharedModule, NgApexchartsModule, CommonModule],
  templateUrl: './course-report-bar-chart.component.html',
  styleUrls: ['./course-report-bar-chart.component.scss']
})
export class RequestFundsChartComponent implements OnInit {
  private themeService = inject(ThemeLayoutService);
  private statisticsService = inject(AdminService);

  chartOptions!: Partial<ApexOptions>;
  requestFundsStats?: RequestFundsStats;
  colors = ['#3F51B5', '#FFA726', '#66BB6A', '#EF5350'];

  ngOnInit() {
    this.statisticsService.getStatistics().subscribe({
      next: (res) => {
        this.requestFundsStats = res.data.requestFundsStats;
        console.log('Request Funds Stats:', this.requestFundsStats);
        this.initChartOptions();
      }
    });

    effect(() => {
      this.setChartTheme(this.themeService.isDarkMode());
    });
  }

 initChartOptions(): void {
  if (!this.requestFundsStats) return;

  // Regrouper les montants par date (ou utiliser directement recent)
  const dates = this.requestFundsStats.recent.map(r => r.createdAt.split('T')[0]);
  const amounts = this.requestFundsStats.recent.map(r => r.amount);

  this.chartOptions = {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false }
    },
    xaxis: {
      categories: dates,
      labels: { rotate: -45 }
    },
    series: [
      {
        name: 'Montant demandé',
        data: amounts
      }
    ],
    // colors: this.themeColors,
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    legend: { position: 'bottom' },
    tooltip: { enabled: true }
  };
}

  private setChartTheme(isDarkMode: string) {
    if (this.chartOptions && this.chartOptions.tooltip) {
      this.chartOptions = {
        ...this.chartOptions,
        tooltip: { ...this.chartOptions.tooltip, theme: isDarkMode === DARK ? DARK : LIGHT }
      };
    }
  }
}
