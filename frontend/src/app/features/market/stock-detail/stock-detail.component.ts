import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MarketService, Stock, StockPriceHistory } from '../../../core/services/market.service';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';

@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="breadcrumb">
      <a routerLink="/market/stocks">Thị trường</a> > <span>{{ stock?.symbol }}</span>
    </div>
    
    <div class="detail-container" *ngIf="stock">
      <div class="stock-header">
        <div class="main-info">
          <h1>{{ stock.symbol }}</h1>
          <h2>{{ stock.name }}</h2>
        </div>
        <div class="price-section">
          <div class="current-price">{{ stock.currentPrice | number:'1.0-2' }} đ</div>
          <div class="change" [class.up]="stock.changePercent > 0" [class.down]="stock.changePercent < 0">
            {{ stock.changePercent > 0 ? '+' : '' }}{{ stock.changePercent }}%
          </div>
        </div>
        <div class="actions">
          <button class="watchlist-btn" (click)="toggleWatchlist()">
            {{ inWatchlist ? 'Hủy theo dõi' : '♡ Thêm vào Watchlist' }}
          </button>
        </div>
      </div>
      
      <div class="chart-wrapper">
        <div class="chart-container" #chartContainer></div>
      </div>
    </div>
  `,
  styles: [`
    .breadcrumb { margin-bottom: 2rem; color: #8a93a6; font-size: 0.875rem; }
    .breadcrumb a { color: #2962ff; text-decoration: none; }
    .stock-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; background: #131722; padding: 1.5rem; border-radius: 8px; border: 1px solid #2a2e39; }
    h1 { font-size: 2.5rem; margin: 0 0 0.5rem; color: #d1d4dc; }
    h2 { font-size: 1rem; margin: 0; color: #8a93a6; font-weight: normal; }
    .price-section { text-align: right; }
    .current-price { font-size: 2.5rem; font-weight: 700; color: #fff; line-height: 1; margin-bottom: 0.5rem;}
    .change { font-size: 1.25rem; font-weight: 500; }
    .change.up { color: #089981; }
    .change.down { color: #f23645; }
    .watchlist-btn { padding: 0.75rem 1.5rem; background: #2962ff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; font-weight: 500; transition: background 0.2s; }
    .watchlist-btn:hover { background: #1e4ed8; }
    .chart-wrapper { width: 100%; height: 500px; background: #131722; border-radius: 8px; border: 1px solid #2a2e39; overflow: hidden; padding: 1rem; }
    .chart-container { width: 100%; height: 100%; }
  `]
})
export default class StockDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  
  private route = inject(ActivatedRoute);
  private marketService = inject(MarketService);
  
  stock: Stock | null = null;
  chart!: IChartApi;
  candlestickSeries!: any;
  inWatchlist = false;

  ngOnInit() {
    this.checkWatchlist();
  }

  checkWatchlist() {
    this.marketService.getWatchlist().subscribe({
      next: (res) => {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          const exists = res.data.find(item => item.stockId === +id);
          this.inWatchlist = !!exists;
        }
      }
    });
  }

  ngAfterViewInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.marketService.getStockDetail(+id).subscribe({
        next: (res) => {
          this.stock = res;
          this.initChart();
        },
        error: (err) => console.error(err)
      });
    }
  }

  initChart() {
    if (!this.chartContainer) return;
    
    this.chart = createChart(this.chartContainer.nativeElement, {
      layout: {
        background: { color: '#131722' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2a2e39' },
        horzLines: { color: '#2a2e39' },
      },
      crosshair: {
        mode: 1, // Magnet
      },
      timeScale: {
        borderColor: '#2a2e39',
        timeVisible: true,
      },
    });

    this.candlestickSeries = this.chart.addCandlestickSeries({
      upColor: '#089981',
      downColor: '#f23645',
      borderVisible: false,
      wickUpColor: '#089981',
      wickDownColor: '#f23645',
    });

    if (this.stock?.history && this.stock.history.length > 0) {
      const formattedData = this.stock.history.map(h => {
        // Date to timestamp formatting specifically for lightweight-charts
        const dateObj = new Date(h.timestamp);
        return {
          time: (dateObj.getTime() / 1000) as any,
          open: Number(h.open),
          high: Number(h.high),
          low: Number(h.low),
          close: Number(h.close)
        };
      });
      formattedData.sort((a, b) => a.time - b.time);
      this.candlestickSeries.setData(formattedData);
    }
    this.chart.timeScale().fitContent();
  }

  toggleWatchlist() {
    if (!this.stock) return;
    if (this.inWatchlist) {
      this.marketService.removeFromWatchlist(this.stock.id).subscribe(() => this.inWatchlist = false);
    } else {
      this.marketService.addToWatchlist(this.stock.id).subscribe(() => this.inWatchlist = true);
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.remove();
    }
  }
}
