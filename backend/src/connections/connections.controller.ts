import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConnectionsService } from './connections.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('connections')
@ApiBearerAuth()
@Controller({ path: 'connections', version: '1' })
export class ConnectionsController {
  constructor(private readonly connections: ConnectionsService) {}

  @Get()
  @ApiOperation({ summary: "List the user's exchange connections" })
  findAll(@CurrentUser() user: AuthUser) {
    return this.connections.findAll(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Connect an exchange (keys encrypted at rest)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateConnectionDto) {
    return this.connections.create(user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disconnect an exchange' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.connections.remove(user.id, id);
  }
}
