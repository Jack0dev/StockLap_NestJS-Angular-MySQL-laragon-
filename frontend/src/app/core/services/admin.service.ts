import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AdminStatistics {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  totalStocks: number;
  activeStocks: number;
  haltedStocks: number;
  totalTradingVolume: number;
  totalFeesCollected: number;
  ordersToday: number;
}

export interface UserItem {
  id: number;
  email: string;
  fullName: string;
  role: string;
  status: string;
  balance: number;
  is2FAEnabled: boolean;
  createdAt: string;
}

export interface PaginatedUsers {
  users: UserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StockItem {
  id: number;
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  changePercent: number;
  isHalted: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  userId: number;
  stockId: number;
  side: string;
  orderType: string;
  price: number;
  quantity: number;
  filledQty: number;
  status: string;
  createdAt: string;
  user?: { fullName: string; email: string };
  stock?: { symbol: string; name: string };
}

export interface PaginatedOrders {
  orders: OrderItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/admin';

  getStatistics(): Observable<AdminStatistics> {
    return this.http.get<ApiResponse<AdminStatistics>>(`${this.baseUrl}/statistics`)
      .pipe(map(res => res.data));
  }

  getUsers(page = 1, limit = 10, search?: string): Observable<PaginatedUsers> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<PaginatedUsers>>(`${this.baseUrl}/users`, { params })
      .pipe(map(res => res.data));
  }

  lockUser(id: number): Observable<UserItem> {
    return this.http.patch<ApiResponse<UserItem>>(`${this.baseUrl}/users/${id}/lock`, {})
      .pipe(map(res => res.data));
  }

  unlockUser(id: number): Observable<UserItem> {
    return this.http.patch<ApiResponse<UserItem>>(`${this.baseUrl}/users/${id}/unlock`, {})
      .pipe(map(res => res.data));
  }

  getStocks(): Observable<StockItem[]> {
    return this.http.get<ApiResponse<StockItem[]>>(`${this.baseUrl}/stocks`)
      .pipe(map(res => res.data));
  }

  haltStock(id: number): Observable<StockItem> {
    return this.http.patch<ApiResponse<StockItem>>(`${this.baseUrl}/stocks/${id}/halt`, {})
      .pipe(map(res => res.data));
  }

  resumeStock(id: number): Observable<StockItem> {
    return this.http.patch<ApiResponse<StockItem>>(`${this.baseUrl}/stocks/${id}/resume`, {})
      .pipe(map(res => res.data));
  }

  getOrders(page = 1, limit = 10, status?: string, side?: string, stockId?: number): Observable<PaginatedOrders> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (status) params = params.set('status', status);
    if (side) params = params.set('side', side);
    if (stockId) params = params.set('stockId', stockId.toString());
    return this.http.get<ApiResponse<PaginatedOrders>>(`${this.baseUrl}/orders`, { params })
      .pipe(map(res => res.data));
  }

  forceCancelOrder(id: number): Observable<OrderItem> {
    return this.http.patch<ApiResponse<OrderItem>>(`${this.baseUrl}/orders/${id}/cancel`, {})
      .pipe(map(res => res.data));
  }
}
