import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../../users/entities/user.entity';
import { Stock } from '../../stocks/entities/stock.entity';
import { Order, OrderSide, OrderType, OrderStatus } from '../../orders/entities/order.entity';
import { Transaction } from '../../orders/entities/transaction.entity';
import * as bcrypt from 'bcrypt';

/**
 * Seed script to populate database with sample data for Admin Dashboard.
 * Run: npx ts-node src/database/seeds/admin-seed.ts
 */
async function seed() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'stocklab',
    entities: [User, Stock, Order, Transaction],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Database connected for seeding...');

  const userRepo = dataSource.getRepository(User);
  const stockRepo = dataSource.getRepository(Stock);
  const orderRepo = dataSource.getRepository(Order);
  const txnRepo = dataSource.getRepository(Transaction);

  // Clear existing data (use query builder to bypass empty criteria restriction)
  await dataSource.createQueryBuilder().delete().from(Transaction).execute();
  await dataSource.createQueryBuilder().delete().from(Order).execute();
  await dataSource.createQueryBuilder().delete().from(Stock).execute();
  await dataSource.createQueryBuilder().delete().from(User).execute();

  // Seed Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await userRepo.save({
    email: 'admin@stocklab.vn',
    password: hashedPassword,
    fullName: 'Admin StockLab',
    role: UserRole.ADMIN,
    balance: 0,
    status: UserStatus.ACTIVE,
  });
  console.log('Created admin user:', admin.email);

  // Seed regular users
  const userPassword = await bcrypt.hash('user123', 10);
  const users: User[] = [];
  const userNames = [
    { email: 'nguyenvana@gmail.com', name: 'Nguyễn Văn A', balance: 50000000 },
    { email: 'tranthib@gmail.com', name: 'Trần Thị B', balance: 120000000 },
    { email: 'lequangc@gmail.com', name: 'Lê Quang C', balance: 35000000 },
    { email: 'phamdinhhd@gmail.com', name: 'Phạm Đình D', balance: 80000000 },
    { email: 'vothie@gmail.com', name: 'Võ Thị E', balance: 200000000 },
    { email: 'dangvanf@gmail.com', name: 'Đặng Văn F', balance: 15000000 },
    { email: 'hoangthig@gmail.com', name: 'Hoàng Thị G', balance: 95000000 },
    { email: 'buivanh@gmail.com', name: 'Bùi Văn H', balance: 60000000 },
    { email: 'dothii@gmail.com', name: 'Đỗ Thị I', balance: 45000000 },
    { email: 'ngothik@gmail.com', name: 'Ngô Thị K', balance: 180000000, status: UserStatus.LOCKED },
  ];

  for (const u of userNames) {
    const user = await userRepo.save({
      email: u.email,
      password: userPassword,
      fullName: u.name,
      role: UserRole.USER,
      balance: u.balance,
      status: u.status || UserStatus.ACTIVE,
    });
    users.push(user);
  }
  console.log(`Created ${users.length} regular users`);

  // Seed Stocks (Vietnamese-style stock symbols)
  const stocksData = [
    { symbol: 'VNM', name: 'Vinamilk', currentPrice: 78500, previousClose: 77200 },
    { symbol: 'VHM', name: 'Vinhomes', currentPrice: 52300, previousClose: 53100 },
    { symbol: 'VIC', name: 'Vingroup', currentPrice: 43800, previousClose: 42500 },
    { symbol: 'HPG', name: 'Hòa Phát Group', currentPrice: 28900, previousClose: 29400 },
    { symbol: 'MSN', name: 'Masan Group', currentPrice: 85200, previousClose: 84000 },
    { symbol: 'FPT', name: 'FPT Corporation', currentPrice: 125600, previousClose: 123800 },
    { symbol: 'MWG', name: 'Mobile World', currentPrice: 55800, previousClose: 56200 },
    { symbol: 'TCB', name: 'Techcombank', currentPrice: 35200, previousClose: 34800 },
    { symbol: 'VPB', name: 'VPBank', currentPrice: 22100, previousClose: 22500 },
    { symbol: 'ACB', name: 'ACB Bank', currentPrice: 26800, previousClose: 26400 },
  ];

  const stocks: Stock[] = [];
  for (const s of stocksData) {
    const changePercent = ((s.currentPrice - s.previousClose) / s.previousClose) * 100;
    const stock = await stockRepo.save({
      ...s,
      changePercent: parseFloat(changePercent.toFixed(2)),
      isHalted: false,
    });
    stocks.push(stock);
  }
  console.log(`Created ${stocks.length} stocks`);

  // Seed Orders & Transactions
  const orderStatuses = [OrderStatus.FILLED, OrderStatus.PENDING, OrderStatus.PARTIAL, OrderStatus.CANCELLED];
  const orders: Order[] = [];

  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const stock = stocks[Math.floor(Math.random() * stocks.length)];
    const side = Math.random() > 0.5 ? OrderSide.BUY : OrderSide.SELL;
    const statusIndex = Math.random();
    let status: OrderStatus;
    if (statusIndex < 0.5) status = OrderStatus.FILLED;
    else if (statusIndex < 0.7) status = OrderStatus.PENDING;
    else if (statusIndex < 0.85) status = OrderStatus.PARTIAL;
    else status = OrderStatus.CANCELLED;

    const priceVariation = stock.currentPrice * (0.95 + Math.random() * 0.1);
    const quantity = (Math.floor(Math.random() * 20) + 1) * 100;
    const filledQty = status === OrderStatus.FILLED ? quantity :
                      status === OrderStatus.PARTIAL ? Math.floor(quantity * Math.random()) :
                      0;

    const order = await orderRepo.save({
      userId: user.id,
      stockId: stock.id,
      side,
      orderType: Math.random() > 0.3 ? OrderType.LIMIT : OrderType.MARKET,
      price: parseFloat(priceVariation.toFixed(2)),
      quantity,
      filledQty,
      status,
    });
    orders.push(order);
  }
  console.log(`Created ${orders.length} orders`);

  // Seed Transactions (from filled orders)
  const filledBuys = orders.filter(o => o.side === OrderSide.BUY && (o.status === OrderStatus.FILLED || o.status === OrderStatus.PARTIAL));
  const filledSells = orders.filter(o => o.side === OrderSide.SELL && (o.status === OrderStatus.FILLED || o.status === OrderStatus.PARTIAL));

  let txnCount = 0;
  for (let i = 0; i < Math.min(filledBuys.length, filledSells.length, 15); i++) {
    const buyOrder = filledBuys[i];
    const sellOrder = filledSells[i];
    const matchQty = Math.min(buyOrder.filledQty, sellOrder.filledQty) || 100;
    const matchPrice = (Number(buyOrder.price) + Number(sellOrder.price)) / 2;
    const fee = matchPrice * matchQty * 0.0015;

    await txnRepo.save({
      buyOrderId: buyOrder.id,
      sellOrderId: sellOrder.id,
      stockId: buyOrder.stockId,
      price: parseFloat(matchPrice.toFixed(2)),
      quantity: matchQty,
      fee: parseFloat(fee.toFixed(2)),
    });
    txnCount++;
  }
  console.log(`Created ${txnCount} transactions`);

  await dataSource.destroy();
  console.log('Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
