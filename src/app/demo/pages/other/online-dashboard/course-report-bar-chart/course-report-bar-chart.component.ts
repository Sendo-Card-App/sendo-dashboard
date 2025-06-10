import { Component, OnInit, effect, inject } from '@angular/core';
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { ThemeLayoutService } from 'src/app/@theme/services/theme-layout.service';
import { DARK, LIGHT } from 'src/app/@theme/const';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { AdminService } from 'src/app/@theme/services/admin.service';
import { SharedExpensesStats } from 'src/app/@theme/models/statistics';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-report-bar-chart',
  imports: [SharedModule, NgApexchartsModule, CommonModule],
  templateUrl: './course-report-bar-chart.component.html',
  styleUrls: ['./course-report-bar-chart.component.scss']
})
export class CourseReportBarChartComponent implements OnInit {
  private themeService = inject(ThemeLayoutService);
  private statsService = inject(AdminService);

  // Chart configurations
  statusChartOptions!: Partial<ApexOptions>;
  contributorsChartOptions!: Partial<ApexOptions>;
  recentExpensesChartOptions!: Partial<ApexOptions>;
  themeColors = ['#4680ff', '#faad14', '#ff4d4f'];

  // Data
  isLoading = false;
  stats!: SharedExpensesStats;

  constructor() {
    effect(() => {
      this.isDarkTheme(this.themeService.isDarkMode());
    });
  }

  ngOnInit(): void {
    this.loadStats();
    this.initChartOptions();
  }

  loadStats(): void {
    this.isLoading = true;
    this.statsService.getStatistics().subscribe({
      next: (response) => {
        this.stats = response.data.sharedExpenses;
        this.updateChartsData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.isLoading = false;
      }
    });
  }

  initChartOptions(): void {
    // Chart for status distribution
    this.statusChartOptions = {
      chart: {
        type: 'donut',
        height: 300,
        toolbar: { show: false }
      },
      labels: ['En attente', 'Complétées', 'Annulées'],
      legend: { position: 'bottom' },
      dataLabels: { enabled: false },
      colors: this.themeColors
    };

    // Chart for top contributors
    this.contributorsChartOptions = {
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 3
        }
      },
      dataLabels: { enabled: false },
      colors: [this.themeColors[0]]
    };

    // Chart for recent expenses
    this.recentExpensesChartOptions = {
      chart: {
        type: 'line',
        height: 300,
        toolbar: { show: false }
      },
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 5 },
      dataLabels: { enabled: false },
      colors: [this.themeColors[1]]
    };
  }

  updateChartsData(): void {
    // Update status distribution chart
    this.statusChartOptions = {
      ...this.statusChartOptions,
      series: this.stats.statusDistribution.map(item => item.count)
    };

    // Update top contributors chart
    this.contributorsChartOptions = {
      ...this.contributorsChartOptions,
      series: [{
        name: 'Montant contribué',
        data: this.stats.topContributors.map(c => c.totalContributed)
      }],
      xaxis: {
        categories: this.stats.topContributors.map(c => c.user.name)
      }
    };

    // Update recent expenses chart
    this.recentExpensesChartOptions = {
      ...this.recentExpensesChartOptions,
      series: [{
        name: 'Montant',
        data: this.stats.recentSharedExpenses.map(e => e.totalAmount)
      }],
      xaxis: {
        categories: this.stats.recentSharedExpenses.map(e =>
          new Date(e.createdAt).toLocaleDateString()
        )
      }
    };
  }

  private updateChartColors() {
    // Same as your existing implementation
    // ...
    this.themeColors = ['#4680ff', '#faad14', '#ff4d4f'];
    this.statusChartOptions = { ...this.statusChartOptions, colors: this.themeColors };
    this.contributorsChartOptions = { ...this.contributorsChartOptions, colors: [this.themeColors[0]] };
    this.recentExpensesChartOptions = { ...this.recentExpensesChartOptions, colors: [this.themeColors[1]] };
  }

  private isDarkTheme(isDark: string) {
    const tooltip = { theme: isDark === DARK ? DARK : LIGHT };
    this.statusChartOptions = { ...this.statusChartOptions, tooltip };
    this.contributorsChartOptions = { ...this.contributorsChartOptions, tooltip };
    this.recentExpensesChartOptions = { ...this.recentExpensesChartOptions, tooltip };
  }

  getStatusPercentage(status: string): number {
    const total = this.stats.statusDistribution.reduce((sum, item) => sum + item.count, 0);
    const item = this.stats.statusDistribution.find(s => s.status === status);
    return item ? Math.round((item.count / total) * 100) : 0;
  }
}
