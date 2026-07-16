import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('portfolio')
@ApiBearerAuth()
@Controller({ path: 'portfolio', version: '1' })
export class PortfolioController {
  constructor(private readonly portfolio: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: 'Portfolio summary (value, P&L, allocation)' })
  summary(@CurrentUser() user: AuthUser) {
    return this.portfolio.summary(user.id);
  }

  @Get('positions')
  @ApiOperation({ summary: 'Open positions' })
  positions(@CurrentUser() user: AuthUser) {
    return this.portfolio.positions(user.id);
  }
}
