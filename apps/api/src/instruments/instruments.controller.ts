import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';
import { InstrumentsService } from './instruments.service';
import { CreateInstrumentDto, UpdateInstrumentDto } from './instruments.dto';

@UseGuards(JwtAuthGuard)
@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instruments: InstrumentsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.instruments.list(user.userId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateInstrumentDto) {
    return this.instruments.create(user.userId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateInstrumentDto) {
    return this.instruments.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.instruments.remove(user.userId, id);
  }
}
