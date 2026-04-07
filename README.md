# 📈 StockLab — Sàn Giao Dịch Chứng Khoán Mô Phỏng

Nền tảng mô phỏng giao dịch chứng khoán fullstack, cho phép người dùng đặt lệnh Mua/Bán, theo dõi matching engine khớp lệnh theo thời gian thực, quản lý ví tiền và portfolio.

## 🛠 Công Nghệ

| Layer | Công nghệ | Ghi chú |
|-------|-----------|---------|
| **Frontend** | Angular 19 (Standalone) | Angular Material, TradingView Charts |
| **Backend** | NestJS 10+ | TypeORM, Passport JWT, Socket.io |
| **Database** | MySQL 8 (Laragon) | `localhost:3306`, db: `stocklab` |
| **Realtime** | Socket.io | Live prices, orderbook, notifications |
| **Payments** | VNPay Sandbox | Nạp tiền qua IPN callback |
| **Testing** | Jest (BE) / Jasmine+Karma (FE) | TDD bắt buộc |

## 📁 Cấu Trúc Dự Án

```
├── backend/                  # NestJS API Server
│   ├── src/
│   │   ├── auth/             # Xác thực: JWT, OTP, 2FA
│   │   ├── users/            # Quản lý người dùng
│   │   ├── stocks/           # Cổ phiếu, giá, lịch sử
│   │   ├── orders/           # Đặt lệnh Mua/Bán
│   │   ├── engine/           # Matching Engine (Price-Time Priority)
│   │   ├── portfolio/        # Danh mục đầu tư, PnL
│   │   ├── wallet/           # Ví tiền, VNPay, nạp/rút
│   │   ├── watchlist/        # Danh sách theo dõi
│   │   ├── realtime/         # WebSocket Gateway
│   │   ├── bots/             # Trading Bots tự động
│   │   ├── admin/            # Quản trị hệ thống
│   │   ├── common/           # Guards, Filters, Interceptors, Decorators
│   │   ├── config/           # Cấu hình TypeORM, env validation
│   │   └── database/seeds/   # Dữ liệu khởi tạo
│   └── .env
├── frontend/                 # Angular Web App
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/         # Interceptors, Guards, Services (singleton)
│   │   │   ├── shared/       # Components, Pipes, Directives dùng chung
│   │   │   └── features/     # auth, market, trading, wallet, portfolio, admin
│   │   └── environments/     # Dev & Prod config
│   └── proxy.conf.json
└── stocklab_jira_import.csv  # Jira task backlog
```

## 🚀 Hướng Dẫn Chạy

### Yêu cầu
- **Node.js** >= 18
- **Laragon** (MySQL 8 chạy trên `localhost:3306`)
- Tạo database `stocklab` trước khi chạy backend

### Backend

```bash
cd backend
npm install
cp .env.example .env       # Cấu hình biến môi trường
npm run start:dev           # http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
ng serve                    # http://localhost:4200 (proxy tới :3000)
```

## 🧪 Testing (TDD)

Dự án sử dụng phương pháp **Test-Driven Development** — luôn viết test trước khi code.

```bash
# Backend
cd backend && npm run test              # Chạy tất cả test
cd backend && npm run test -- --watch   # Watch mode
cd backend && npm run test:cov          # Coverage report

# Frontend
cd frontend && ng test                  # Chạy tất cả test
cd frontend && ng test --code-coverage  # Coverage report
```

## 🗂 Tính Năng Chính

| # | Tính năng | Mô tả |
|---|-----------|-------|
| 1 | **Đăng ký & Xác thực** | JWT, OTP email, Google Authenticator 2FA |
| 2 | **Ví tiền & VNPay** | Nạp tiền qua VNPay sandbox, rút tiền có xác minh OTP |
| 3 | **Thị trường** | Danh sách cổ phiếu, biểu đồ nến TradingView, watchlist |
| 4 | **Đặt lệnh** | Market Order, Limit Order, huỷ/sửa lệnh chờ |
| 5 | **Matching Engine** | Khớp lệnh theo thuật toán Price-Time Priority |
| 6 | **Portfolio** | Danh mục đầu tư, tính lãi/lỗ realtime |
| 7 | **WebSocket** | Cập nhật giá, orderbook, thông báo khớp lệnh realtime |
| 8 | **Trading Bots** | Bot tự động tạo thanh khoản cho thị trường |
| 9 | **Admin** | Thống kê hệ thống, quản lý user, quản lý cổ phiếu |

## 🌿 Git Workflow

| Nhánh | Mục đích |
|-------|----------|
| `main` | Production-ready code |
| `develop` | Nhánh phát triển chính |
| `feature/*` | Tính năng mới (`feature/auth-jwt`) |
| `bugfix/*` | Sửa lỗi (`bugfix/fix-matching`) |

```bash
# Commit convention
[MODULE] type: mô tả ngắn

# Ví dụ
[AUTH] feat: implement JWT login endpoint
[ENGINE] fix: correct partial fill calculation
[WALLET] feat: add VNPay deposit flow
```

## 📝 License

Private project — All rights reserved.