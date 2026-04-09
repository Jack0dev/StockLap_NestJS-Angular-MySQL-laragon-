import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { StocksService } from './stocks.service';

@Controller('api/stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  async findAll() {
    const stocks = await this.stocksService.findAll();
    return { data: stocks };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const stock = await this.stocksService.findById(id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }
    const history = await this.stocksService.getHistory(id);
    return { ...stock, history };
  }
}
