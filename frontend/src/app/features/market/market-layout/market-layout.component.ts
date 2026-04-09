import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-market-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="market-layout">
      <nav class="top-nav">
        <div class="logo">StockLab Market</div>
        <div class="nav-links">
          <a routerLink="/market/stocks" routerLinkActive="active">Thị trường</a>
          <a routerLink="/market/watchlist" routerLinkActive="active">Watchlist</a>
          <a routerLink="/admin/dashboard" class="admin-btn">Vào Admin</a>
        </div>
      </nav>
      <main class="market-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .market-layout { min-height: 100vh; background-color: #0b0e14; color: #d1d4dc; font-family: 'Inter', sans-serif; }
    .top-nav { display: flex; justify-content: space-between; padding: 1rem 2rem; background: #131722; border-bottom: 1px solid #2a2e39; align-items: center;}
    .logo { font-size: 1.5rem; font-weight: 700; color: #2962ff; }
    .nav-links a { color: #8a93a6; text-decoration: none; margin-left: 2rem; font-weight: 500; transition: color 0.2s; }
    .nav-links a:hover, .nav-links a.active { color: #d1d4dc; }
    .admin-btn { padding: 0.5rem 1rem; background: #2962ff; color: white !important; border-radius: 4px; margin-left: 2rem; }
    .market-content { padding: 2rem; max-width: 1400px; margin: 0 auto; }
  `]
})
export default class MarketLayoutComponent {}
