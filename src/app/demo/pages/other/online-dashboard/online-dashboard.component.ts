import { AuthenticationService } from './../../../../@theme/services/authentication.service';
// angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { StatisticsChartComponent } from '../../../pages/apex-chart/statistics-chart/statistics-chart.component';
import { InvitesGoalChartComponent } from './invites-goal-chart/invites-goal-chart.component';
// import { TotalRevenueLineChartComponent } from './total-revenue-line-chart/total-revenue-line-chart.component';
import { StudentStatesChartComponent } from './student-states-chart/student-states-chart.component';
// import { ActivityLineChartComponent } from './activity-line-chart/activity-line-chart.component';
import { activityData } from 'src/app/fake-data/activity_data';
// import { VisitorsBarChartComponent } from './visitors-bar-chart/visitors-bar-chart.component';
// import { EarningCoursesLineChartComponent } from './earning-courses-line-chart/earning-courses-line-chart.component';
import { CourseReportBarChartComponent } from './course-report-bar-chart/course-report-bar-chart.component';
import { RequestFundsChartComponent } from './request-funds-stats/course-report-bar-chart.component';
import { TontineStatsComponent } from './tontine-stats/tontine-stats.component';
import { courseStatesData } from 'src/app/fake-data/courseStates_data';
import { AdminService } from 'src/app/@theme/services/admin.service'; // Importez votre service
import { DashboardSummaryItem, StatisticsData, StatisticsResponse, WalletStats, WalletTop } from 'src/app/@theme/models/statistics'; // Importez votre interface
import { CardStatsComponent } from './card-stats/card-stats.component';

export interface activity_Data {
  image: string;
  name: string;
  qualification: string;
  rating: string;
}

export interface courseStates_data {
  name: string;
  teacher: string;
  rating: number;
  earning: string;
  sale: string;
}

const activity_Data = activityData;
const courseStates_data = courseStatesData;

@Component({
  selector: 'app-online-dashboard',
  imports: [
    SharedModule,
    CommonModule,
    StatisticsChartComponent,
    InvitesGoalChartComponent,
    CourseReportBarChartComponent,
    StudentStatesChartComponent,
    CardStatsComponent,
    // ActivityLineChartComponent,
    // VisitorsBarChartComponent,
    // EarningCoursesLineChartComponent,
    RouterModule,
    RequestFundsChartComponent,
    TontineStatsComponent
  ],
  templateUrl: './online-dashboard.component.html',
  styleUrls: ['./online-dashboard.component.scss']
})
export class OnlineDashboardComponent implements OnInit {

  // public props
  selected: Date | null;

  activity: string[] = ['Name', 'Qualification', 'Rating'];
  activitySource = activity_Data;

  courseStates: string[] = ['Name', 'Teacher', 'Rating', 'Earning', 'Sale', 'Action'];
  courseSource = courseStates_data;
   dashboard_summary: DashboardSummaryItem[] = [];
    walletStats: WalletStats;
  topWallets: WalletTop[] = [];
  currencySymbol = 'XAF';

  constructor(
    private statisticsService: AdminService, // Injectez le service dans le constructeur
    private Auth: AuthenticationService
  ) {
    this.selected = new Date();
  }

  ngOnInit(): void {
     this.loadStatistics();
     this.loadWalletData();
  }

 // Dans votre composant.ts
loadStatistics(): void {
    this.statisticsService.getStatistics().subscribe({
      next: (response: StatisticsResponse) => {
        this.updateDashboardSummary(response.data);
        // Vous pouvez aussi mettre à jour d'autres parties du dashboard ici

        // console.log('Statistics loaded:', response.data);
      },
      error: (err) => {
        if (err === "Token invalide") {
          this.Auth.clearSession();
          window.location.reload();
        }
      }
    });
  }

    private loadWalletData() {
    this.statisticsService.getStatistics().subscribe({
      next: (response) => {
        this.walletStats = response.data.walletStats;
        this.topWallets = this.walletStats.topWallets.map((wallet: WalletTop) => ({
          ...wallet,
          formattedBalance: this.formatCurrency(wallet.balance)
        }));
      },
      error: (err) => console.error('Failed to load wallet data', err)
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: this.currencySymbol,
      minimumFractionDigits: 0
    }).format(amount);
  }

  getFormattedTotalBalance(): string {
    return this.formatCurrency(this.walletStats?.totalBalance || 0);
  }

  getFormattedAverageBalance(): string {
    return this.formatCurrency(this.walletStats?.averageBalance || 0);
  }

  private updateDashboardSummary(data: StatisticsData): void {
    this.dashboard_summary = [
      {
        icon: '#custom-profile-2user-outline',
        background: 'bg-primary-50 text-primary-500',
        title: 'Total Users',
        value: `${data.userStats.totalUsers}`,
        percentage: this.calculateUserGrowth(data.userStats.dailyRegistrations),
        color: 'text-success'
      },
      {
        icon: '#custom-card',
        background: 'bg-warning-50 text-warning-500',
        title: 'Total Wallets',
        value: `${data.walletStats.totalWallets}`,
        percentage: this.calculateWalletGrowth(),
        color: 'text-warning-500'
      },
      {
        icon: '#custom-eye',
        background: 'bg-success-50 text-success-500',
        title: 'Total Transactions',
        value: `${data.transactionStats.totalTransactions}`,
        percentage: this.calculateTransactionGrowth(),
        color: 'text-success-500'
      },
      {
        icon: '#book',
        background: 'bg-warn-50 text-warn-500',
        title: 'Total Requests',
        value: `${data.requestStats.totalRequests}`,
        percentage: this.calculateRequestGrowth(),
        color: 'text-warn-500'
      }
    ];
  }

  private calculateUserGrowth(dailyRegistrations: { date: string; count: number }[]): string {
    if (!dailyRegistrations || dailyRegistrations.length < 2) return '0%';

    const recent = dailyRegistrations[dailyRegistrations.length - 1].count;
    const previous = dailyRegistrations[dailyRegistrations.length - 2].count;

    return this.calculateGrowthPercentage(recent, previous);
  }

  private calculateWalletGrowth(): string {

    return '12.5%'; // Remplacez par votre logique réelle
  }

  private calculateTransactionGrowth(): string {

    // const total = transactionStats.totalTransactions;
    // const avg = transactionStats.averageAmount;
    return '8.3%'; // Remplacez par votre logique réelle
  }

  private calculateRequestGrowth(): string {

    return '5.2%'; // Remplacez par votre logique réelle
  }

  private calculateGrowthPercentage(current: number, previous: number): string {
    if (previous === 0) return '100%';
    const growth = ((current - previous) / previous) * 100;
    return `${growth.toFixed(1)}%`;
  }

  course_list = [
    {
      title: 'Bootstrap 5 Beginner Course',
      image: 'assets/images/admin/img-bootstrap.svg'
    },
    {
      title: 'PHP Training Course',
      image: 'assets/images/admin/img-php.svg'
    },
    {
      title: 'UI/UX Training Course',
      image: 'assets/images/admin/img-ux.svg'
    },
    {
      title: 'Web Designing Course',
      image: 'assets/images/admin/img-web.svg'
    }
  ];

  queriesList = [
    {
      image: 'assets/images/user/avatar-2.png',
      title: 'Python $ Data Manage'
    },
    {
      image: 'assets/images/user/avatar-1.png',
      title: 'Website Error'
    },
    {
      image: 'assets/images/user/avatar-3.png',
      title: 'How to Illustrate'
    },
    {
      image: 'assets/images/user/avatar-4.jpg',
      title: 'PHP Learning'
    }
  ];

  trendingCourse = [
    {
      image: 'assets/images/admin/img-bootstrap.svg',
      title: 'Bootstrap 5 Beginner Course'
    },
    {
      image: 'assets/images/admin/img-php.svg',
      title: 'PHP Training Course'
    },
    {
      image: 'assets/images/admin/img-ux.svg',
      title: 'UI/UX Training Course'
    },
    {
      image: 'assets/images/admin/img-web.svg',
      title: 'Web Designing Course'
    },
    {
      image: 'assets/images/admin/img-c.svg',
      title: 'C Training Course'
    }
  ];

  notificationList = [
    {
      image: 'assets/images/user/avatar-1.png',
      title: 'Report Successfully',
      time: 'Today | 9:00 AM'
    },
    {
      image: 'assets/images/user/avatar-5.jpg',
      title: 'Reminder: Test time',
      time: 'Yesterday | 6:30 PM'
    },
    {
      image: 'assets/images/user/avatar-3.png',
      title: 'Send course pdf',
      time: '05 Feb | 3:45 PM'
    },
    {
      image: 'assets/images/user/avatar-2.png',
      title: 'Report Successfully',
      time: '05 Feb | 4:00 PM'
    }
  ];
}
