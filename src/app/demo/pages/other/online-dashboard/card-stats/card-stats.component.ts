import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { AdminService } from 'src/app/@theme/services/admin.service';
import { CardStats, StatisticsResponse } from 'src/app/@theme/models/statistics';
import { ThemeLayoutService } from 'src/app/@theme/services/theme-layout.service';
import { DARK, LIGHT } from 'src/app/@theme/const';

@Component({
  selector: 'app-card-stats',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './card-stats.component.html',
  styleUrls: ['./card-stats.component.scss']
})
export class CardStatsComponent implements OnInit {
  private statsService = inject(AdminService);
  private themeService = inject(ThemeLayoutService);

  // Chart configurations
  statusChartOptions!: Partial<ApexOptions>;
  recentCardsChartOptions!: Partial<ApexOptions>;
  themeColors = ['#4680ff', '#faad14', '#ff4d4f'];

  // Data
  isLoading = false;
  stats!: CardStats;

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
      next: (response: StatisticsResponse) => {
        this.stats = response.data.cardStats;
        this.updateChartsData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading card stats:', error);
        this.isLoading = false;
      }
    });
  }

  initChartOptions(): void {
    // Status distribution chart
    this.statusChartOptions = {
      chart: {
        type: 'donut',
        height: 250,
        toolbar: { show: false }
      },
      labels: ['Actif', 'Inactif', 'Bloqué'],
      legend: { position: 'bottom' },
      dataLabels: { enabled: false },
      colors: this.themeColors
    };

    // Recent cards chart
    this.recentCardsChartOptions = {
      chart: {
        type: 'bar',
        height: 250,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 3
        }
      },
      dataLabels: { enabled: false },
      colors: [this.themeColors[0]]
    };
  }

  updateChartsData(): void {
    // Update status distribution chart
    if (this.stats?.statusDistribution) {
      this.statusChartOptions = {
        ...this.statusChartOptions,
        series: this.stats.statusDistribution.map(item => item.count),
        labels: this.stats.statusDistribution.map(item => this.translateStatus(item.status))
      };
    }

    // Update recent cards chart
    if (this.stats?.recentCards) {
      const recentCards: { cardName: string }[] = this.stats.recentCards.slice(0, 5);
      this.recentCardsChartOptions = {
        ...this.recentCardsChartOptions,
        series: [{
          name: 'Cartes',
          data: recentCards.map(() => 1)
        }],
        xaxis: {
          categories: recentCards.map(card => card.cardName)
        }
      };
    }
  }

  private isDarkTheme(isDark: string) {
    const tooltip = { theme: isDark === DARK ? DARK : LIGHT };
    this.statusChartOptions = { ...this.statusChartOptions, tooltip };
    this.recentCardsChartOptions = { ...this.recentCardsChartOptions, tooltip };
  }

  translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'Actif',
      'INACTIVE': 'Inactif',
      'BLOCKED': 'Bloqué',
      'PENDING': 'En attente'
    };
    return statusMap[status] || status;
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }
}
