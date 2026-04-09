import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StockPriceHistory {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Stock {
  id: number;
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  changePercent: number;
  isHalted: boolean;
  history?: StockPriceHistory[];
}

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private http = inject(HttpClient);

  private baseUrl = 'http://localhost:3000/api';

  getStocks(): Observable<{ data: Stock[] }> {
    return this.http.get<{ data: Stock[] }>(`${this.baseUrl}/stocks`);
  }

  getStockDetail(id: number): Observable<Stock> {
    return this.http.get<Stock>(`${this.baseUrl}/stocks/${id}`);
  }

  getWatchlist(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.baseUrl}/watchlist`);
  }

  addToWatchlist(stockId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/watchlist`, { stockId });
  }

  removeFromWatchlist(stockId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/watchlist/${stockId}`);
  }
}
