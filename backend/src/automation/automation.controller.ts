import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AutomationService } from './automation.service';
import { CreateStrategyDto, UpdateStrategyDto } from './dto/automation.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('automation')
@ApiBearerAuth()
@Controller({ path: 'automation/strategies', version: '1' })
export class AutomationController {
  constructor(private readonly automation: AutomationService) {}

  @Get()
  @ApiOperation({ summary: 'List automation strategies' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.automation.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an automation strategy' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateStrategyDto) {
    return this.automation.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a strategy (toggle, risk, limits)' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateStrategyDto,
  ) {
    return this.automation.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a strategy' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.automation.remove(user.id, id);
  }
}
