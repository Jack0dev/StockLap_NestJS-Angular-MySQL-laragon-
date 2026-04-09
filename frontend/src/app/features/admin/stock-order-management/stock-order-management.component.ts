import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, StockItem, OrderItem, PaginatedOrders } from '../../../core/services/admin.service';

@Component({
  selector: 'app-stock-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './stock-order-management.component.html',
  styleUrl: './stock-order-management.component.css' // We can reuse styles from users
})
export default class StockOrderManagementComponent implements OnInit {
  activeTab = signal<'stocks' | 'orders'>('stocks');
  
  // Stocks State
  stocks = signal<StockItem[]>([]);
  stocksLoading = signal(true);
  
  // Orders State
  ordersPage = signal<PaginatedOrders | null>(null);
  ordersLoading = signal(false);
  currentOrderPage = signal(1);
  filterStatus = signal<string>('');
  filterSide = signal<string>('');
  filterStockId = signal<number | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStocks();
  }

  setTab(tab: 'stocks' | 'orders'): void {
    this.activeTab.set(tab);
    if (tab === 'orders' && !this.ordersPage()) {
      this.loadOrders();
    }
  }

  // --- Stocks ---
  loadStocks(): void {
    this.stocksLoading.set(true);
    this.adminService.getStocks().subscribe({
      next: (data) => {
        this.stocks.set(data);
        this.stocksLoading.set(false);
      },
      error: () => this.stocksLoading.set(false)
    });
  }

  toggleHaltStock(stock: StockItem): void {
    const action = stock.isHalted ? 'mở lại' : 'tạm ngừng';
    if (confirm(`Bạn có chắc muốn ${action} giao dịch mã ${stock.symbol}?`)) {
      if (stock.isHalted) {
        this.adminService.resumeStock(stock.id).subscribe(() => this.loadStocks());
      } else {
        this.adminService.haltStock(stock.id).subscribe(() => this.loadStocks());
      }
    }
  }

  // --- Orders ---
  loadOrders(): void {
    this.ordersLoading.set(true);
    this.adminService.getOrders(
      this.currentOrderPage(), 
      10, 
      this.filterStatus() || undefined,
      this.filterSide() || undefined,
      this.filterStockId() || undefined
    ).subscribe({
      next: (data) => {
        this.ordersPage.set(data);
        this.ordersLoading.set(false);
      },
      error: () => this.ordersLoading.set(false)
    });
  }

  applyOrderFilters(): void {
    this.currentOrderPage.set(1);
    this.loadOrders();
  }

  changeOrderPage(page: number): void {
    if (page < 1 || (this.ordersPage() && page > this.ordersPage()!.totalPages)) return;
    this.currentOrderPage.set(page);
    this.loadOrders();
  }

  cancelOrder(order: OrderItem): void {
    if (confirm(`Xác nhận cưỡng chế hủy lệnh ${order.side} ${order.stock?.symbol} của User #${order.userId}?`)) {
      this.adminService.forceCancelOrder(order.id).subscribe({
        next: () => this.loadOrders(),
        error: () => alert('Không thể hủy lệnh')
      });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }
}
