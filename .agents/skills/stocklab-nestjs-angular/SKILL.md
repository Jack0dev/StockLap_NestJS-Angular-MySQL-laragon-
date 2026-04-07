---
name: StockLab NestJS-Angular-MySQL Project
description: Full-stack stock trading simulation platform using NestJS (backend), Angular (frontend), and MySQL via Laragon. Covers project conventions, architecture patterns, and common development workflows.
---

# StockLab — NestJS + Angular + MySQL (Laragon)

## Tổng Quan Dự Án

StockLab là một **sàn giao dịch chứng khoán mô phỏng** cho phép người dùng đăng ký, nạp/rút tiền (VNPay sandbox), đặt lệnh Mua/Bán (Market & Limit), và theo dõi matching engine khớp lệnh theo thời gian thực qua WebSocket.

---

## ⚠️ QUY TẮC BẮT BUỘC CHO AGENT

### 1. Output bằng tiếng Việt
- **Tất cả** câu trả lời, giải thích, comment trong artifact và giao tiếp với user **PHẢI bằng tiếng Việt**.
- Code comments bằng tiếng Anh để giữ chuẩn quốc tế, nhưng mọi trao đổi với user phải bằng tiếng Việt.

### 2. KHÔNG sử dụng Mock Data
- **TUYỆT ĐỐI KHÔNG** tạo dữ liệu giả (mock/fake/dummy/hardcode) để hiển thị trên UI.
- Mọi dữ liệu hiển thị trên giao diện **PHẢI lấy từ API thật** → kết nối tới database MySQL thật.
- Nếu chưa có data → tạo **seed script** (`backend/src/database/seeds/`), **KHÔNG hardcode** dữ liệu giả vào component/template.
- **Ngoại lệ duy nhất**: Dữ liệu giả **CHỈ được phép** trong test files (`*.spec.ts`).

### 3. Test-Driven Development (TDD) — BẮT BUỘC
- **Luôn viết test TRƯỚC khi viết code implementation.**
- Quy trình cho mọi feature/module:
  1. **RED**: Viết unit test mô tả hành vi mong muốn → chạy test → test FAIL.
  2. **GREEN**: Viết code tối thiểu nhất để test PASS.
  3. **REFACTOR**: Tối ưu code, đảm bảo test vẫn PASS, loại bỏ code thừa.
- **Backend (Jest)**:
  ```bash
  cd backend && npm run test              # Chạy tất cả test
  cd backend && npm run test -- --watch   # Chạy test ở chế độ watch
  cd backend && npm run test:cov          # Kiểm tra coverage
  ```
- **Frontend (Jasmine + Karma)**:
  ```bash
  cd frontend && ng test                  # Chạy tất cả test
  cd frontend && ng test --code-coverage  # Kiểm tra coverage
  ```
- Mỗi service/controller/component **PHẢI có file `.spec.ts`** tương ứng.
- Khi tạo module mới: **LUÔN tạo file test trước**, rồi mới tạo file implementation.

### 4. Tư duy Senior Software Engineer
- Agent **PHẢI** đóng vai Senior Software Engineer, hiểu rõ toàn bộ kiến trúc hệ thống.
- Trước khi code, **PHẢI phân tích tác động** đến các module liên quan (xem [Sơ đồ phụ thuộc module](#sơ-đồ-phụ-thuộc-module-backend)).
- **Luôn đặt câu hỏi** nếu requirement chưa rõ, không tự giả định.
- Ưu tiên nguyên tắc: **Clean Code → DRY → SOLID → KISS**.
- Viết code như thể sẽ bị review bởi tech lead khắt khe nhất.

### 5. Git Workflow — BẮT BUỘC
- **KHÔNG BAO GIỜ push trực tiếp vào `main` hoặc `develop`.**
- Mỗi feature/task **PHẢI tạo nhánh mới** từ `develop`:
  ```bash
  git checkout develop
  git pull origin develop
  git checkout -b feature/SL-<task-id>-<mô-tả-ngắn>
  ```
- **Mọi commit PHẢI có Jira Task ID** ở đầu message để Jira + GitHub đối chiếu:
  ```
  SL-<task-id> [MODULE] type: mô tả ngắn
  ```
  - Ví dụ: `SL-7 [AUTH] feat: implement user registration with OTP`
  - Ví dụ: `SL-25 [ENGINE] fix: correct price-time priority sorting`
  - **type** hợp lệ: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- Khi hoàn thành → push nhánh feature lên remote → tạo **Pull Request** vào `develop`.
- Merge vào `main` chỉ khi release (từ `develop` → `main`).
- **Agent PHẢI tự động tuân thủ** quy trình này khi thực hiện git commit/push.

---

## Technology Stack

| Layer      | Technology                          | Ghi chú                                |
|------------|-------------------------------------|----------------------------------------|
| Frontend   | Angular 17+ (Standalone Components) | Angular Material, TradingView Charts   |
| Backend    | NestJS 10+                          | TypeORM, Passport JWT, Socket.io       |
| Database   | MySQL 8 (Laragon)                   | `localhost:3306`, db: `stocklab`        |
| Realtime   | Socket.io (`@nestjs/websockets`)    | Live prices, orderbook, notifications  |
| Payments   | VNPay Sandbox                       | Nạp tiền qua IPN callback             |
| Testing    | Jest (BE) / Jasmine+Karma (FE)      | TDD bắt buộc                          |

---

## Cấu Trúc Thư Mục

```
StockLap_NestJS-Angular-MySQL-laragon-/
├── backend/                      # NestJS application
│   ├── src/
│   │   ├── auth/                 # JWT, OTP, 2FA (Google Authenticator)
│   │   │   ├── dto/              #   CreateUserDto, LoginDto, OtpDto...
│   │   │   ├── entities/         #   (dùng chung User entity từ users/)
│   │   │   ├── guards/           #   JwtAuthGuard, RolesGuard
│   │   │   ├── strategies/       #   JwtStrategy
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.service.spec.ts
│   │   │   └── auth.module.ts
│   │   ├── users/                # User entity & profile
│   │   ├── stocks/               # Stock entity, listing, price history
│   │   ├── orders/               # Order placement (Market/Limit), cancel/modify
│   │   ├── engine/               # Matching engine (Price-Time Priority)
│   │   ├── portfolio/            # User holdings, PnL
│   │   ├── wallet/               # Deposits (VNPay), withdrawals, balance
│   │   ├── watchlist/            # User watchlist
│   │   ├── realtime/             # WebSocket gateway (Socket.io)
│   │   ├── bots/                 # Trading bots & liquidity
│   │   ├── admin/                # Admin dashboard APIs
│   │   ├── common/               # Shared: guards, interceptors, filters, decorators
│   │   │   ├── filters/          #   HttpExceptionFilter (global)
│   │   │   ├── interceptors/     #   TransformInterceptor
│   │   │   └── decorators/       #   @CurrentUser(), @Roles()
│   │   ├── config/               # TypeORM config, env validation (Joi)
│   │   └── database/
│   │       └── seeds/            # Seed scripts (dữ liệu khởi tạo)
│   ├── test/                     # E2E tests
│   ├── .env
│   └── package.json
├── frontend/                     # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/             # Singleton services, guards, interceptors
│   │   │   │   ├── interceptors/ #   AuthInterceptor (attach JWT)
│   │   │   │   ├── guards/       #   AuthGuard (route protection)
│   │   │   │   └── services/     #   AuthService, WebSocketService
│   │   │   ├── shared/           # Reusable components, pipes, directives
│   │   │   ├── features/
│   │   │   │   ├── auth/         # Login, Register, OTP, 2FA
│   │   │   │   ├── market/       # Stock listing, stock detail + chart
│   │   │   │   ├── trading/      # Order form, order book, order history
│   │   │   │   ├── wallet/       # Deposit, withdraw, transaction history
│   │   │   │   ├── portfolio/    # Holdings, PnL view
│   │   │   │   └── admin/        # Admin dashboard (lazy loaded)
│   │   │   ├── app.component.ts
│   │   │   ├── app.config.ts
│   │   │   └── app.routes.ts
│   │   ├── environments/
│   │   └── assets/
│   ├── proxy.conf.json           # Dev proxy → backend :3000
│   └── package.json
└── stocklab_jira_import.csv      # Jira task reference
```

---

## Naming Conventions (Quy Tắc Đặt Tên)

| Đối tượng             | Convention              | Ví dụ                                      |
|-----------------------|-------------------------|---------------------------------------------|
| File (BE)             | `kebab-case`            | `wallet-transaction.entity.ts`              |
| File (FE)             | `kebab-case`            | `stock-detail.component.ts`                 |
| Class                 | `PascalCase`            | `OrderService`, `StockDetailComponent`      |
| Interface             | `PascalCase` (no `I`)   | `CreateOrderDto`, `StockResponse`           |
| Variable / Function   | `camelCase`             | `filledQty`, `calculatePnL()`               |
| Constant              | `UPPER_SNAKE_CASE`      | `MAX_ORDER_QUANTITY`, `JWT_SECRET`          |
| DB Table              | `snake_case` (plural)   | `users`, `wallet_transactions`              |
| DB Column             | `snake_case`            | `filled_qty`, `created_at`                  |
| API Endpoint          | `kebab-case` (plural)   | `/api/orders`, `/api/wallet-transactions`   |
| Test file             | `*.spec.ts`             | `order.service.spec.ts`                     |
| E2E test              | `*.e2e-spec.ts`         | `auth.e2e-spec.ts`                          |

---

## Database Entities & Quan Hệ (TypeORM)

### Entity Schema

| Entity              | Key Columns                                                                   |
|---------------------|-------------------------------------------------------------------------------|
| `User`              | id, email, password, fullName, role(`USER`/`ADMIN`), is2FAEnabled, otpSecret, balance, status(`ACTIVE`/`LOCKED`) |
| `Stock`             | id, symbol, name, currentPrice, previousClose, changePercent, isHalted        |
| `Order`             | id, userId, stockId, side(`BUY`/`SELL`), orderType(`MARKET`/`LIMIT`), price, quantity, filledQty, status(`PENDING`/`PARTIAL`/`FILLED`/`CANCELLED`), createdAt |
| `Portfolio`         | id, userId, stockId, quantity, lockedQty, avgBuyPrice                         |
| `Transaction`       | id, buyOrderId, sellOrderId, stockId, price, quantity, executedAt             |
| `WalletTransaction` | id, userId, type(`DEPOSIT`/`WITHDRAWAL`), amount, status(`PENDING`/`SUCCESS`/`FAILED`), vnpayTxnRef, createdAt |
| `Watchlist`         | id, userId, stockId                                                           |
| `StockPriceHistory` | id, stockId, open, high, low, close, volume, timestamp                        |

### Sơ Đồ Quan Hệ (Entity Relationships)

```
User (1) ──────< (N) Order
User (1) ──────< (N) Portfolio
User (1) ──────< (N) WalletTransaction
User (1) ──────< (N) Watchlist

Stock (1) ─────< (N) Order
Stock (1) ─────< (N) Portfolio
Stock (1) ─────< (N) Transaction
Stock (1) ─────< (N) StockPriceHistory
Stock (1) ─────< (N) Watchlist

Order (1:buyOrder) ──< (N) Transaction
Order (1:sellOrder) ─< (N) Transaction
```

**Lưu ý quan trọng**:
- `User.balance` → số dư khả dụng (trừ đi số tiền đã lock trong lệnh BUY pending).
- `Portfolio.lockedQty` → số cổ phiếu đang bị lock trong lệnh SELL pending.
- Khi đặt lệnh BUY → trừ `User.balance`, khi cancel → hoàn lại.
- Khi đặt lệnh SELL → tăng `Portfolio.lockedQty`, khi cancel → giảm lại.

---

## Sơ Đồ Phụ Thuộc Module (Backend)

```
AppModule
├── ConfigModule (global)
├── TypeOrmModule (global)
├── AuthModule
│   └── depends on: UsersModule
├── UsersModule
├── StocksModule
├── OrdersModule
│   └── depends on: UsersModule, StocksModule, PortfolioModule, EngineModule
├── EngineModule (Matching Engine)
│   └── depends on: OrdersModule, StocksModule, PortfolioModule, UsersModule, RealtimeModule
├── PortfolioModule
│   └── depends on: StocksModule
├── WalletModule
│   └── depends on: UsersModule
├── WatchlistModule
│   └── depends on: StocksModule
├── RealtimeModule (WebSocket Gateway)
├── BotsModule
│   └── depends on: OrdersModule, UsersModule, StocksModule
└── AdminModule
    └── depends on: UsersModule, StocksModule, OrdersModule
```

---

## Xử Lý Lỗi (Error Handling)

### Backend — Global Exception Filter

Mọi lỗi đều qua `HttpExceptionFilter` đặt ở `common/filters/`:

```typescript
// Thành công
{ "statusCode": 200, "message": "Thành công", "data": { ... } }

// Lỗi validation
{ "statusCode": 400, "message": "Dữ liệu không hợp lệ", "errors": ["email phải là email hợp lệ"] }

// Lỗi xác thực
{ "statusCode": 401, "message": "Chưa đăng nhập" }

// Lỗi phân quyền
{ "statusCode": 403, "message": "Không có quyền truy cập" }

// Lỗi server
{ "statusCode": 500, "message": "Lỗi hệ thống" }
```

### Custom Business Exceptions

Tạo các exception cụ thể cho nghiệp vụ trading:

```typescript
InsufficientBalanceException    // Số dư không đủ
InsufficientStockException      // Không đủ cổ phiếu để bán
OrderNotFoundException          // Lệnh không tồn tại
StockHaltedException            // Cổ phiếu đang bị tạm ngừng giao dịch
InvalidOrderException           // Lệnh không hợp lệ (price <= 0, qty <= 0)
```

---

## Key Architecture Patterns

### Backend (NestJS)

1. **Module-per-feature**: Mỗi domain area là một NestJS module riêng biệt, tự chứa.
2. **DTOs + class-validator**: Mọi incoming data được validate qua decorators (`@IsEmail()`, `@IsPositive()`, ...).
3. **Guards**: `JwtAuthGuard` cho route cần auth, `RolesGuard` cho admin endpoints.
4. **Global Interceptor**: `TransformInterceptor` bọc tất cả response theo format chuẩn.
5. **Global Filter**: `HttpExceptionFilter` xử lý tất cả exception thống nhất.
6. **Repository Pattern**: Inject via `@InjectRepository()` — KHÔNG gọi trực tiếp `DataSource`.
7. **Matching Engine**: Chạy qua `@Cron()` hoặc `setInterval`, xử lý pending orders theo Price-Time Priority.
8. **Env Validation**: Sử dụng `Joi` hoặc `class-validator` để validate `.env` khi khởi động app.

### Frontend (Angular)

1. **Standalone Components**: Angular 17+ standalone API (không dùng NgModules).
2. **Lazy-loaded Routes**: Feature areas lazy-loaded qua `loadComponent` trong `app.routes.ts`.
3. **Reactive Forms**: Tất cả forms dùng `ReactiveFormsModule`.
4. **RxJS State Management**: Services expose `BehaviorSubject`/`Observable` streams.
5. **HTTP Interceptor**: `AuthInterceptor` tự động gắn JWT token vào mọi request.
6. **Socket.io Client**: `socket.io-client` cho real-time updates.
7. **Smart/Dumb Component Pattern**: Container components xử lý logic, presentational components chỉ nhận `@Input` và emit `@Output`.

---

## Quy Trình Phát Triển

### Khởi động môi trường Dev

```bash
# 1. Bật Laragon → đảm bảo MySQL chạy trên localhost:3306
# 2. Tạo database "stocklab" nếu chưa có (qua phpMyAdmin hoặc HeidiSQL)

# 3. Chạy Backend
cd backend
npm install
npm run start:dev      # http://localhost:3000

# 4. Chạy Frontend
cd frontend
npm install
ng serve               # http://localhost:4200 (proxy tới :3000)
```

### Tạo Module Backend mới (theo TDD)

```bash
cd backend

# Bước 1: Generate module structure
npx nest g module <tên-module>
npx nest g controller <tên-module> --no-spec
npx nest g service <tên-module> --no-spec

# Bước 2: Tạo thư mục con
#   <tên-module>/dto/
#   <tên-module>/entities/

# Bước 3: VIẾT TEST TRƯỚC
#   Tạo file <tên-module>.service.spec.ts
#   Viết test cases mô tả behavior mong muốn

# Bước 4: Viết implementation để test PASS

# Bước 5: Chạy verify
npm run test -- --watch --testPathPattern=<tên-module>
```

### Tạo Feature Angular mới (theo TDD)

```bash
cd frontend

# Bước 1: Generate component & service
ng g component features/<feature>/<component> --standalone
ng g service core/services/<service>

# Bước 2: VIẾT TEST TRƯỚC trong .spec.ts đã auto-generate

# Bước 3: Viết implementation

# Bước 4: Đăng ký route trong app.routes.ts
#   { path: '<feature>', loadComponent: () => import('...') }

# Bước 5: Chạy verify
ng test
```

### Tạo Entity mới

1. Tạo file `backend/src/<module>/entities/<tên>.entity.ts`
2. Decorate với `@Entity()`, define columns với `@Column()`, đặt relationships (`@ManyToOne`, `@OneToMany`...)
3. Đăng ký trong module: `TypeOrmModule.forFeature([NewEntity])`
4. `synchronize: true` tự tạo table trong dev — **TẮT trong production**

---

## Biến Môi Trường (.env)

```env
# Database (Laragon MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=stocklab

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# Mail (gửi OTP)
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# VNPay Sandbox
VNPAY_TMN_CODE=your-terminal-id
VNPAY_HASH_SECRET=your-hash-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:4200/wallet/vnpay-return

# App
PORT=3000
FRONTEND_URL=http://localhost:4200
```

---

## Matching Engine Logic (Price-Time Priority)

1. Lấy tất cả lệnh `PENDING` + `PARTIAL`, nhóm theo stock.
2. Sắp xếp:
   - **BUY**: Giá GIẢM dần → Thời gian TĂNG dần (ưu tiên giá cao, đặt trước).
   - **SELL**: Giá TĂNG dần → Thời gian TĂNG dần (ưu tiên giá thấp, đặt trước).
3. Duyệt cặp (best buy, best sell):
   - Nếu `buyPrice >= sellPrice` → khớp tại giá của lệnh **đặt trước** (passive order).
   - Khối lượng khớp = `min(buyRemaining, sellRemaining)`.
   - Cập nhật `filledQty` trên cả hai lệnh, đổi status nếu filled hoàn toàn.
4. Post-trade:
   - Tạo `Transaction` record.
   - Cập nhật `Portfolio` (thêm stock cho buyer, giảm cho seller).
   - Hoàn tiền thừa cho buyer nếu khớp giá thấp hơn giá đặt.
   - Cập nhật `Stock.currentPrice` = giá khớp cuối cùng.
5. Broadcast qua WebSocket:
   - `stock:price-update` → tất cả client.
   - `order:filled` → user cụ thể (private notification).
   - `orderbook:update` → tất cả client đang xem stock đó.

---

## Git Workflow

### Quy tắc nhánh

| Nhánh | Mục đích | Tạo từ |
|-------|----------|--------|
| `main` | Production-ready, chỉ merge từ `develop` | — |
| `develop` | Nhánh phát triển chính | `main` |
| `feature/SL-<id>-<mô-tả>` | Tính năng mới | `develop` |
| `bugfix/SL-<id>-<mô-tả>` | Sửa lỗi | `develop` |
| `hotfix/SL-<id>-<mô-tả>` | Fix khẩn cấp production | `main` |

### Quy tắc commit message

```
SL-<task-id> [MODULE] type: mô tả ngắn
```

- **SL-<task-id>**: Bắt buộc — ID task trên Jira để đối chiếu.
- **[MODULE]**: `AUTH`, `WALLET`, `ENGINE`, `ORDERS`, `STOCKS`, `PORTFOLIO`, `REALTIME`, `BOTS`, `ADMIN`, `INFRA`
- **type**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

Ví dụ:
```bash
SL-7  [AUTH]   feat: implement user registration with OTP
SL-25 [ENGINE] fix: correct partial fill calculation
SL-12 [WALLET] feat: add VNPay deposit flow
SL-34 [REALTIME] feat: setup WebSocket gateway
```

### Quy trình làm việc

```
1. git checkout develop && git pull
2. git checkout -b feature/SL-<id>-<mô-tả>
3. Code + commit (có Jira ID)
4. git push origin feature/SL-<id>-<mô-tả>
5. Tạo Pull Request → develop
6. Review → Merge
7. Khi release: develop → main (PR)
```

> ⚠️ **KHÔNG ĐƯỢC push trực tiếp vào `main` hoặc `develop`**

---

## Jira Task Reference

Tất cả tasks được ghi trong `stocklab_jira_import.csv` ở root. Các Epics:

| # | Epic                                    | Priority |
|---|----------------------------------------|----------|
| 1 | Setup Project Infrastructure & Database | Highest  |
| 2 | User Authentication & Security          | Highest  |
| 3 | Wallet and Payment Processing           | Highest  |
| 4 | Stock Market Data & Watchlist           | High     |
| 5 | Order Management System (OMS)           | Highest  |
| 6 | Matching Engine & Settlement            | Highest  |
| 7 | Portfolio Management                    | High     |
| 8 | Realtime Updates (WebSocket)            | Medium   |
| 9 | Trading Bots & Liquidity                | Low      |
| 10| Admin Dashboard                         | Medium   |
| 11| Advanced Conditional Orders             | Low      |
