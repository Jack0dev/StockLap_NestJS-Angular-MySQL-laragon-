import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketService } from '../../../core/services/market.service';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="market-header">
      <h2>Danh sách theo dõi</h2>
      <p>Các cổ phiếu bạn đang quan tâm</p>
    </div>
    
    <div class="empty-state" *ngIf="watchlist.length === 0">
      Mục theo dõi của bạn đang trống. Hãy quay lại <a routerLink="/market/stocks">Thị trường</a> để thêm.
    </div>

    <div class="grid-container" *ngIf="watchlist.length > 0">
      <div class="stock-card" *ngFor="let item of watchlist" [routerLink]="['/market/stocks', item.stock.id]">
        <div class="card-header">
          <span class="symbol">{{ item.stock.symbol }}</span>
          <button class="remove-btn" (click)="removeStock(item.stock.id, $event)">✖</button>
        </div>
        <div class="card-body">
          <div class="price-info">
            <span class="price">{{ item.stock.currentPrice | number:'1.0-2' }} đ</span>
            <span class="change" [class.up]="item.stock.changePercent > 0" [class.down]="item.stock.changePercent < 0">
              {{ item.stock.changePercent > 0 ? '+' : '' }}{{ item.stock.changePercent }}%
            </span>
          </div>
          <p class="name">{{ item.stock.name }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .market-header { margin-bottom: 2rem; }
    .market-header h2 { font-size: 2rem; margin: 0 0 0.5rem; color: #fff; }
    .market-header p { color: #8a93a6; margin: 0; }
    .empty-state { padding: 3rem; text-align: center; color: #8a93a6; background: #131722; border-radius: 8px; border: 1px dashed #2a2e39; }
    .empty-state a { color: #2962ff; text-decoration: none; }
    .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .stock-card { background: #131722; border: 1px solid #2a2e39; border-radius: 8px; padding: 1.5rem; cursor: pointer; transition: transform 0.2s, border-color 0.2s; position: relative; }
    .stock-card:hover { transform: translateY(-4px); border-color: #2962ff; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .symbol { font-size: 1.5rem; font-weight: 700; color: #d1d4dc; }
    .remove-btn { background: transparent; border: none; color: #8a93a6; cursor: pointer; font-size: 1.2rem; }
    .remove-btn:hover { color: #f23645; }
    .price-info { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 0.5rem; }
    .price { font-size: 1.75rem; font-weight: 600; color: #fff; }
    .change { font-size: 1rem; font-weight: 500; }
    .change.up { color: #089981; }
    .change.down { color: #f23645; }
    .name { color: #8a93a6; font-size: 0.875rem; margin: 0; }
  `]
})
export default class WatchlistComponent implements OnInit {
  private marketService = inject(MarketService);
  watchlist: any[] = [];

  ngOnInit() {
    this.loadWatchlist();
  }

  loadWatchlist() {
    this.marketService.getWatchlist().subscribe({
      next: (res) => this.watchlist = res.data,
      error: (err) => console.error(err)
    });
  }

  removeStock(stockId: number, event: Event) {
    event.stopPropagation();
    this.marketService.removeFromWatchlist(stockId).subscribe(() => {
      this.loadWatchlist();
    });
  }
}
