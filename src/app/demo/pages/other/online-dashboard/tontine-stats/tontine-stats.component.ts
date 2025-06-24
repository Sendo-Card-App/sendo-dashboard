import { Component, OnInit, inject } from '@angular/core';
import { AdminService } from 'src/app/@theme/services/admin.service';
import { TontineStats } from 'src/app/@theme/models/statistics';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-tontine-stats',
  standalone: true,
  imports: [CommonModule, SharedModule, NgApexchartsModule, CommonModule],
  templateUrl: './tontine-stats.component.html',
  styleUrls: ['./tontine-stats.component.scss']
})
export class TontineStatsComponent implements OnInit {
  private adminService = inject(AdminService);

  tontineStats?: TontineStats;
  chartOptions!: Partial<ApexOptions>;
  isLoading = false;
  themeColors = ['#3F51B5', '#FFA726', '#66BB6A', '#EF5350'];

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.adminService.getStatistics().subscribe({
      next: (response) => {
        this.tontineStats = response.data.tontineStats;
        this.initChartOptions();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stats tontine:', error);
        this.isLoading = false;
      }
    });
  }

  initChartOptions(): void {
    if (!this.tontineStats) return;
    this.chartOptions = {
      chart: {
        type: 'donut',
        height: 280,
        toolbar: { show: false }
      },
      labels: this.tontineStats.typeDistribution.map(t => t.type),
      series: this.tontineStats.typeDistribution.map(t => t.count),
      legend: { position: 'bottom' },
      dataLabels: { enabled: false },
      colors: this.themeColors,
      tooltip: { enabled: true }
    };
  }
}
