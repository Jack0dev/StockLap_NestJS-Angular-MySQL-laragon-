import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/portfolio')
@UseGuards(JwtAuthGuard)
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  async getActivePortfolio(@Request() req: any) {
    return this.portfolioService.getUserPortfolio(req.user.id);
  }

  @Get('transactions')
  async getTransactionHistory(@Request() req: any) {
    return this.portfolioService.getUserTransactions(req.user.id);
  }
}
