import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';

@Component({
  selector: 'app-active-portfolio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="portfolio-container">
      <h2>Danh Mục Cổ Phiếu</h2>
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Khả dụng</th>
              <th>Chờ bán (Locked)</th>
              <th>Giá vốn</th>
              <th>Giá thị trường</th>
              <th>Lãi / Lỗ</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of portfolio">
              <td><strong>{{ p.stock.symbol }}</strong></td>
              <td>{{ p.quantity }}</td>
              <td>{{ p.lockedQty }}</td>
              <td>{{ p.avgBuyPrice | number:'1.2-2' }}</td>
              <td>{{ p.stock.currentPrice | number:'1.2-2' }}</td>
              <td [ngClass]="getPnLClass(p)">
                {{ getPnL(p) | number:'1.2-2' }}%
              </td>
            </tr>
            <tr *ngIf="portfolio.length === 0">
              <td colspan="6" class="text-center">Chưa có cổ phiếu nào trong danh mục.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./active-portfolio.component.css']
})
export class ActivePortfolioComponent implements OnInit {
  private portfolioService = inject(PortfolioService);
  portfolio: any[] = [];

  ngOnInit() {
    this.portfolioService.getActivePortfolio().subscribe(res => {
      this.portfolio = res;
    });
  }

  getPnL(p: any): number {
    const buyPrice = Number(p.avgBuyPrice);
    const cb = Number(p.stock.currentPrice);
    if (buyPrice === 0) return 0;
    return ((cb - buyPrice) / buyPrice) * 100;
  }

  getPnLClass(p: any): string {
    const pnl = this.getPnL(p);
    if (pnl > 0) return 'text-success';
    if (pnl < 0) return 'text-danger';
    return '';
  }
}
