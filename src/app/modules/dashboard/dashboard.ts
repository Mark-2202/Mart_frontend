import { Component, OnInit, inject } from '@angular/core';
import { Dashboard, DashboardStats, RecentOrderItem, TopProductItem, SalesChartItem } from '../../core/services/dashboard';
import { Auth } from '../../core/services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  standalone: false
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(Dashboard);
  protected readonly auth = inject(Auth);
  private readonly toastr = inject(ToastrService);

  stats: DashboardStats | null = null;
  recentOrders: RecentOrderItem[] = [];
  topProducts: TopProductItem[] = [];
  salesData: SalesChartItem[] = [];

  isLoading = false;

  // Visual helper for charts
  maxSalesRevenue = 1;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load general stats
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: () => {
        this.toastr.error('Failed to load dashboard statistics', 'Error');
      }
    });

    // Load recent orders
    this.dashboardService.getRecentOrders(5).subscribe({
      next: (data) => {
        this.recentOrders = data;
      }
    });

    // Load top products
    this.dashboardService.getTopProducts(5).subscribe({
      next: (data) => {
        this.topProducts = data;
      }
    });

    // Load sales chart metrics
    this.dashboardService.getSalesChart(7).subscribe({
      next: (data) => {
        this.salesData = data;
        // Compute maximum revenue to scale the SVG chart bars
        this.maxSalesRevenue = Math.max(...data.map(item => item.revenue), 100);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getBarHeightPercentage(revenue: number): number {
    return (revenue / this.maxSalesRevenue) * 100;
  }
}
