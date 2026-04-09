import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminQueryUsersDto } from './dto/admin-query-users.dto';
import { AdminQueryOrdersDto } from './dto/admin-query-orders.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('api/admin')
@Roles('ADMIN')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // SN-41: System Statistics Dashboard
  @Get('statistics')
  async getStatistics() {
    return this.adminService.getStatistics();
  }

  // SN-42: User Management
  @Get('users')
  async getUsers(@Query() query: AdminQueryUsersDto) {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 10;
    return this.adminService.getUsers(page, limit, query.search);
  }

  @Patch('users/:id/lock')
  async lockUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.lockUser(id);
  }

  @Patch('users/:id/unlock')
  async unlockUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.unlockUser(id);
  }

  // SN-43: Stock & Order Management
  @Get('stocks')
  async getStocks() {
    return this.adminService.getStocks();
  }

  @Patch('stocks/:id/halt')
  async haltStock(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.haltStock(id);
  }

  @Patch('stocks/:id/resume')
  async resumeStock(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.resumeStock(id);
  }

  @Get('orders')
  async getOrders(@Query() query: AdminQueryOrdersDto) {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 10;
    const stockId = query.stockId ? parseInt(query.stockId) : undefined;
    return this.adminService.getOrders(page, limit, query.status, query.side, stockId);
  }

  @Patch('orders/:id/cancel')
  async forceCancelOrder(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.forceCancelOrder(id);
  }
}
