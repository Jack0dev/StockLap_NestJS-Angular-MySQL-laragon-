import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketService, Stock } from '../../../core/services/market.service';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="market-header">
      <h2>Thị trường chung</h2>
      <p>Danh sách các mã cổ phiếu đang niêm yết</p>
    </div>
    <div class="grid-container">
      <div class="stock-card" *ngFor="let stock of stocks" [routerLink]="['/market/stocks', stock.id]">
        <div class="card-header">
          <span class="symbol">{{ stock.symbol }}</span>
          <span class="status" [class.halted]="stock.isHalted">{{ stock.isHalted ? 'Tạm Ngưng' : 'Active' }}</span>
        </div>
        <div class="card-body">
          <div class="price-info">
            <span class="price">{{ stock.currentPrice | number:'1.0-2' }} đ</span>
            <span class="change" [class.up]="stock.changePercent > 0" [class.down]="stock.changePercent < 0">
              {{ stock.changePercent > 0 ? '+' : '' }}{{ stock.changePercent }}%
            </span>
          </div>
          <p class="name">{{ stock.name }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .market-header { margin-bottom: 2rem; }
    .market-header h2 { font-size: 2rem; margin: 0 0 0.5rem; color: #fff; }
    .market-header p { color: #8a93a6; margin: 0; }
    .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .stock-card { background: #131722; border: 1px solid #2a2e39; border-radius: 8px; padding: 1.5rem; cursor: pointer; transition: transform 0.2s, border-color 0.2s; }
    .stock-card:hover { transform: translateY(-4px); border-color: #2962ff; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .symbol { font-size: 1.5rem; font-weight: 700; color: #d1d4dc; }
    .status { font-size: 0.75rem; padding: 0.25rem 0.5rem; background: rgba(8,153,129,0.1); color: #089981; border-radius: 4px; }
    .status.halted { background: rgba(242,54,69,0.1); color: #f23645; }
    .price-info { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 0.5rem; }
    .price { font-size: 1.75rem; font-weight: 600; color: #fff; }
    .change { font-size: 1rem; font-weight: 500; }
    .change.up { color: #089981; }
    .change.down { color: #f23645; }
    .name { color: #8a93a6; font-size: 0.875rem; margin: 0; }
  `]
})
export default class StockListComponent implements OnInit {
  private marketService = inject(MarketService);
  stocks: Stock[] = [];

  ngOnInit() {
    this.marketService.getStocks().subscribe({
      next: (res) => this.stocks = res.data,
      error: (err) => console.error('Error fetching stocks', err)
    });
  }
}
