import { Component, OnInit, effect, inject } from '@angular/core';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { ThemeLayoutService } from 'src/app/@theme/services/theme-layout.service';
import { AdminService } from 'src/app/@theme/services/admin.service';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import { UserStats } from 'src/app/@theme/models/statistics';

@Component({
  selector: 'app-student-states-chart',
  imports: [SharedModule, NgApexchartsModule, CommonModule],
  templateUrl: './student-states-chart.component.html',
  styleUrls: ['./student-states-chart.component.scss']
})
export class StudentStatesChartComponent implements OnInit {
  private themeService = inject(ThemeLayoutService);
  private adminService = inject(AdminService);

  chartOptions!: Partial<ApexOptions>;
  isLoading = true;

  constructor() {
    effect(() => {
      this.updateChartColors(this.themeService.color());
    });
  }

  ngOnInit() {
    this.loadUserStats();
  }

  private loadUserStats() {
    this.adminService.getStatistics().subscribe({
      next: (response) => {
        const userStats = response.data.userStats;
        this.initChart(userStats);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load user statistics', err);
        this.isLoading = false;
      }
    });
  }

  private initChart(userStats: UserStats) {
  const totalUsers      = userStats.totalUsers;
  // Ici, on précise que s est un objet { status: string; count: number }
  const activeUsers     = userStats.statusDistribution
    .find((s: { status: string; count: number }) => s.status === 'ACTIVE')
    ?.count || 0;

  const verifiedUsers   = userStats.verificationStats.kyc;

  this.chartOptions = {
    chart: { height: 275, type: 'donut' },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Utilisateurs',
              formatter: () => totalUsers.toString()
            }
          }
        }
      }
    },
    labels: ['Utilisateurs Actifs', 'KYC Vérifiés'],
    series: [activeUsers, verifiedUsers],
    legend: {
      show: true,
      position: 'bottom',
      // Donnons aussi un type à opts
      formatter: (seriesName: string, opts: { seriesIndex: number }) => {
        // opts.seriesIndex nous permet de récupérer la bonne valeur dans series
        const val = this.chartOptions.series?.[opts.seriesIndex] ?? 0;
        return `${seriesName}: ${val}`;
      }
    },
    fill: { opacity: [1, 0.7] },
    colors: ['#4680ff', '#2ca87f']
  };
}


  private updateChartColors(theme: string) {
    // Conservez votre logique existante ou adaptez-la
    switch (theme) {
      case 'blue-theme':
      default:
        this.chartOptions.colors = ['#4680ff', '#2ca87f'];
        break;
      // ... autres thèmes
    }
  }
}
