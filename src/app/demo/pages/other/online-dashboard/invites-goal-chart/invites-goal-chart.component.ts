import { Component, OnInit, inject } from '@angular/core';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AdminService } from 'src/app/@theme/services/admin.service';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  ApexChart,
  ApexStroke,
  ApexGrid,
  ApexPlotOptions
} from 'ng-apexcharts';

// votre nouveau type :
export type ChartOptions = {
  series: number[];
  chart: ApexChart;
  colors: string[];
  stroke: ApexStroke;
  grid: ApexGrid;
  plotOptions: ApexPlotOptions;
  labels?: string[];
};

@Component({
  selector: 'app-invites-goal-chart',
  imports: [SharedModule, NgApexchartsModule, MatMenuModule, CommonModule],
  templateUrl: './invites-goal-chart.component.html',
  styleUrls: ['./invites-goal-chart.component.scss']
})
export class InvitesGoalChartComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  chartOptions!: Partial<ChartOptions>;

  // Données dynamiques
  totalRequests = 0;
  processedRequests = 0;
  unprocessedRequests = 0;
  rejectedRequests = 0;
  todayRequests = 0;

  ngOnInit(): void {
    this.loadRequestStats();
  }

  private loadRequestStats() {
    this.adminService.getStatistics().subscribe({
      next: (response) => {
        const requestStats = response.data.requestStats;

        // Récupération des données
        this.totalRequests = requestStats.totalRequests;
        this.processedRequests = requestStats.statusDistribution.find(s => s.status === 'PROCESSED')?.count || 0;
        this.unprocessedRequests = requestStats.statusDistribution.find(s => s.status === 'UNPROCESSED')?.count || 0;
        this.rejectedRequests = requestStats.statusDistribution.find(s => s.status === 'REJECTED')?.count || 0;

        // Calcul des requêtes aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        this.todayRequests = requestStats.recentRequests.filter(req =>
          req.createdAt.split('T')[0] === today
        ).length;

        // Initialisation du graphique
        this.initChart();
      },
      error: (err) => console.error('Erreur lors du chargement des statistiques', err)
    });
  }

  private initChart() {
    

    this.chartOptions = {
      series: [0],
      chart: {
        type: 'radialBar',
        height: '345px',
        offsetY: -20,
        sparkline: { enabled: true }
      },
      colors: ['var(--primary-500)'],
      plotOptions: {
        radialBar: {
          startAngle: -95,
          endAngle: 95,
          hollow: {
            margin: 15,
            size: '50%'
          },
          track: {
            background: '#eaeaea',
            strokeWidth: '97%',
            margin: 20
          },
          dataLabels: {
            name: { show: false },
            value: {
              offsetY: 0,
              fontSize: '20px',
              formatter: (val: number) => `${val}%`
            }
          }
        }
      },
      grid: { padding: { top: 10 } },
      stroke: { lineCap: 'round' }
    };
  }

  navigateToKycAll() {
    this.router.navigate(['/kyc/kyc-all']);
  }
}
