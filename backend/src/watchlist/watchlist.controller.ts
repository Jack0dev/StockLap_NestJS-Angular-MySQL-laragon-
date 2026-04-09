import { Controller, Get, Post, Delete, Param, Request, UseGuards, ParseIntPipe, Body } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/watchlist')
@UseGuards(RolesGuard)
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  @Roles('USER', 'ADMIN') // Cho phép cả User và Admin dùng tính năng này
  async getWatchlist(@Request() req: any) {
    if (!req.user) throw new Error('Unauthorized');
    const list = await this.watchlistService.getUserWatchlist(req.user.id);
    return { data: list };
  }

  @Post()
  @Roles('USER', 'ADMIN')
  async addStock(@Request() req: any, @Body('stockId', ParseIntPipe) stockId: number) {
    if (!req.user) throw new Error('Unauthorized');
    const item = await this.watchlistService.addStock(req.user.id, stockId);
    return { success: true, item };
  }

  @Delete(':stockId')
  @Roles('USER', 'ADMIN')
  async removeStock(@Request() req: any, @Param('stockId', ParseIntPipe) stockId: number) {
    if (!req.user) throw new Error('Unauthorized');
    await this.watchlistService.removeStock(req.user.id, stockId);
    return { success: true, message: 'Deleted' };
  }
}
