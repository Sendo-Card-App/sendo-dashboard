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
    try {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate >= cutoffDate;
    } catch (e) {
      console.error('Date invalide:',e, transaction.createdAt);
      return false;
    }
  });
}

 private prepareChartData(transactions: Transaction[]): void {
  // D'abord, on s'assure qu'on a bien toutes les transactions
  console.log('Transactions reçues:', transactions);

  // Ensuite, on filtre par période
  const filtered = this.filterTransactionsByPeriod(transactions, this.selectType);
  console.log('Transactions filtrées:', filtered);

  // On groupe correctement les données
  const groupedData = this.groupTransactionsByDateAndType(filtered);
  console.log('Données groupées:', groupedData);

  // Préparation des séries pour le graphique
  const series = [
    { name: 'Dépôts', data: [] as number[] },
    { name: 'Transferts', data: [] as number[] },
    { name: 'Paiements', data: [] as number[] }
  ];

  const categories: string[] = Object.keys(groupedData).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  categories.forEach(date => {
    series[0].data.push(groupedData[date].DEPOSIT || 0);
    series[1].data.push(groupedData[date].TRANSFER || 0);
    series[2].data.push(groupedData[date].PAYMENT || 0);
  });

  // Mise à jour des options du graphique
  this.chartOptions = {
    ...this.chartOptions,
    series,
    xaxis: {
      ...this.chartOptions.xaxis,
      categories
    }
  };
}

private groupTransactionsByDateAndType(transactions: Transaction[]): GroupedTransactions {
  const result: GroupedTransactions = {};

  transactions.forEach(transaction => {
    const date = this.formatTransactionDate(transaction.createdAt);

    if (!result[date]) {
      result[date] = { DEPOSIT: 0, TRANSFER: 0, PAYMENT: 0 };
    }

    // On s'assure que le type est valide avant d'incrémenter
    if (['DEPOSIT', 'TRANSFER', 'PAYMENT'].includes(transaction.type)) {
      result[date][transaction.type] += 1;
    }
  });

  return result;
}

private formatTransactionDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd MMM') || dateString;
  } catch (e) {
    console.error('Erreur de format de date:', dateString, e);
    return dateString;
  }
}

  // private fillMissingDates(
  //   transactions: Transaction[],
  //   period: '5days' | '7days'
  // ): FilledTransaction[] {
  //   const days = period === '5days' ? 5 : 7;
  //   const result: FilledTransaction[] = [];
  //   const now = new Date();

  //   for (let i = 0; i < days; i++) {
  //     const currentDate = subDays(now, i);
  //     const dateStr = this.formatTransactionDate(currentDate.toISOString());

  //     const existingData = transactions.find(t =>
  //       this.formatTransactionDate(t.createdAt) === dateStr
  //     );

  //     result.unshift({
  //       createdAt: currentDate.toISOString(),
  //       type: existingData?.type || null,
  //       ...existingData
  //     });
  //   }

  //   return result;
  // }



  private formatDateLabel(value: string): string {
    return value;
  }

  onOptionSelected(): void {
    this.loadTransactionData();
  }
}
