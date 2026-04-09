import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PortfolioService } from '../../../core/services/portfolio.service';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  template: `
    <div class="portfolio-container">
      <h2>Lịch Sử Giao Dịch</h2>
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Mã</th>
              <th>Giá khớp</th>
              <th>Khối lượng</th>
              <th>Chiều</th>
              <th>Tổng tiền</th>
              <th>Phí</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of transactions">
              <td>{{ t.executedAt | date:'dd/MM/yyyy HH:mm:ss' }}</td>
              <td><strong>{{ t.stockSymbol }}</strong></td>
              <td>{{ t.price | number:'1.2-2' }}</td>
              <td>{{ t.quantity }}</td>
              <td>
                <span [ngClass]="t.side === 'BUY' ? 'badge-buy' : 'badge-sell'">
                  {{ t.side }}
                </span>
              </td>
              <td>{{ t.totalValue | number:'1.2-2' }}</td>
              <td>{{ t.fee | number:'1.2-2' }}</td>
            </tr>
            <tr *ngIf="transactions.length === 0">
              <td colspan="7" class="text-center">Chưa có giao dịch nào.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['../active-portfolio/active-portfolio.component.css']
})
export class TransactionHistoryComponent implements OnInit {
  private portfolioService = inject(PortfolioService);
  transactions: any[] = [];

  ngOnInit() {
    this.portfolioService.getTransactionHistory().subscribe(res => {
      this.transactions = res;
    });
  }
}
