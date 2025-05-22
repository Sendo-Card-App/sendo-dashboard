import { Component, OnInit, inject, input } from '@angular/core';
import { SharedModule } from 'src/app/demo/shared/shared.module';
// import { ThemeLayoutService } from 'src/app/@theme/services/theme-layout.service';
import { AdminService } from 'src/app/@theme/services/admin.service';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { CommonModule, DatePipe } from '@angular/common';
import { subDays } from 'date-fns';

// Interfaces pour le typage fort
interface Transaction {
  transactionId: string;
  amount: number;
  currency: string;
  type: 'DEPOSIT' | 'TRANSFER' | 'PAYMENT';
  status: string;
  createdAt: string;
}

interface GroupedTransactions {
  [date: string]: {
    DEPOSIT: number;
    TRANSFER: number;
    PAYMENT: number;
  };
}

// 1) On définit d’abord TransactionType
type TransactionType = 'DEPOSIT' | 'TRANSFER' | 'PAYMENT';


export type FilledTransaction =
  Omit<Partial<Transaction>, 'type' | 'createdAt'> & {
    type: TransactionType | null;
    createdAt: string;
  };




@Component({
  selector: 'app-statistics-chart',
  standalone: true,
  imports: [SharedModule, NgApexchartsModule, CommonModule],
  templateUrl: './statistics-chart.component.html',
  styleUrls: ['./statistics-chart.component.scss'],
  providers: [DatePipe]
})
export class StatisticsChartComponent implements OnInit {
  // private themeService = inject(ThemeLayoutService);
  private statisticsService = inject(AdminService);
  private datePipe = inject(DatePipe);

  chartOptions!: Partial<ApexOptions>;
  selectType: '5days' | '7days' = '5days';
  chartColors = ['#4680ff', '#2ca87f', '#faad14'] as const;
  readonly height = input.required<number>();
  isLoading = true;

  ngOnInit(): void {
    this.initializeChart();
    this.loadTransactionData();
  }

  private initializeChart(): void {
    this.chartOptions = {
      chart: {
        type: 'bar',
        height: this.height(),
        stacked: true,
        toolbar: { show: false }
      },
      colors: [...this.chartColors],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
        },
      },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'top',
        markers: {}
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['#fff']
      },
      xaxis: {
        categories: [],
        labels: {
          formatter: (value: string) => this.formatDateLabel(value),
          hideOverlappingLabels: true
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        title: { text: "Nombre de transactions" }
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val} transactions`
        }
      },
      fill: {
        opacity: 1
      }
    };
  }

  private loadTransactionData(): void {
    this.isLoading = true;
    this.statisticsService.getStatistics().subscribe({
      next: (response) => {
        // On récupère brut
        const raw = response.data.transactionStats.recentTransactions;

        // On cast en Transaction[] (on fait confiance à l'API)
        const transactions = raw as Transaction[];

        const filteredTransactions = this.filterTransactionsByPeriod(
          transactions,
          this.selectType
        );
        this.prepareChartData(filteredTransactions);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des transactions', err);
        this.isLoading = false;
      }
    });
  }


  private filterTransactionsByPeriod(
    transactions: Transaction[],
    period: '5days' | '7days'
  ): Transaction[] {
    const now = new Date();
    const cutoffDate = subDays(now, period === '5days' ? 5 : 7);

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate >= cutoffDate;
    });
  }

  private prepareChartData(transactions: Transaction[]): void {
    const completeData = this.fillMissingDates(transactions, this.selectType);
    const groupedData = this.groupTransactionsByDateAndType(completeData);

    const series = [
      { name: 'Dépôts', data: [] as number[] },
      { name: 'Transferts', data: [] as number[] },
      { name: 'Paiements', data: [] as number[] }
    ];

    const categories: string[] = [];

    Object.keys(groupedData).forEach(date => {
      categories.push(date);
      series[0].data.push(groupedData[date].DEPOSIT);
      series[1].data.push(groupedData[date].TRANSFER);
      series[2].data.push(groupedData[date].PAYMENT);
    });

    this.chartOptions.series = series;
    this.chartOptions.xaxis = {
      ...this.chartOptions.xaxis,
      categories
    };
  }

  private fillMissingDates(
    transactions: Transaction[],
    period: '5days' | '7days'
  ): FilledTransaction[] {
    const days = period === '5days' ? 5 : 7;
    const result: FilledTransaction[] = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const currentDate = subDays(now, i);
      const dateStr = this.formatTransactionDate(currentDate.toISOString());

      const existingData = transactions.find(t =>
        this.formatTransactionDate(t.createdAt) === dateStr
      );

      result.unshift({
        createdAt: currentDate.toISOString(),
        type: existingData?.type || null,
        ...existingData
      });
    }

    return result;
  }

  private groupTransactionsByDateAndType(transactions: FilledTransaction[]): GroupedTransactions {
    return transactions.reduce((acc: GroupedTransactions, transaction) => {
      if (!transaction.type) return acc;

      const date = this.formatTransactionDate(transaction.createdAt);
      const type = transaction.type;

      if (!acc[date]) {
        acc[date] = { DEPOSIT: 0, TRANSFER: 0, PAYMENT: 0 };
      }

      acc[date][type] += 1;
      return acc;
    }, {} as GroupedTransactions);
  }

  private formatTransactionDate(dateString: string): string {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd MMM') || '';
  }

  private formatDateLabel(value: string): string {
    return value;
  }

  onOptionSelected(): void {
    this.loadTransactionData();
  }
}
