import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';
import { RecitalsService } from './recitals.service';
import { CreatePieceDto, CreateRecitalDto, UpdateRecitalDto } from './recitals.dto';

@UseGuards(JwtAuthGuard)
@Controller('recitals')
export class RecitalsController {
  constructor(private readonly recitals: RecitalsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.recitals.list(user.userId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateRecitalDto) {
    return this.recitals.create(user.userId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateRecitalDto) {
    return this.recitals.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.recitals.remove(user.userId, id);
  }

  @Post(':id/pieces')
  addPiece(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: CreatePieceDto) {
    return this.recitals.addPiece(user.userId, id, dto);
  }

  @Delete(':id/pieces/:pieceId')
  removePiece(@CurrentUser() user: AuthUser, @Param('id') id: string, @Param('pieceId') pieceId: string) {
    return this.recitals.removePiece(user.userId, id, pieceId);
  }
}
