import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MarketKind, SignalAction } from '@prisma/client';
import { SignalsService } from './signals.service';

@ApiTags('signals')
@Controller({ path: 'signals', version: '1' })
export class SignalsController {
  constructor(private readonly signals: SignalsService) {}

  @Get()
  @ApiOperation({ summary: 'List AI signals' })
  @ApiQuery({ name: 'action', enum: SignalAction, required: false })
  @ApiQuery({ name: 'market', enum: MarketKind, required: false })
  findAll(
    @Query('action') action?: SignalAction,
    @Query('market') market?: MarketKind,
  ) {
    return this.signals.findAll(action, market);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single AI signal' })
  findOne(@Param('id') id: string) {
    return this.signals.findOne(id);
  }
}
