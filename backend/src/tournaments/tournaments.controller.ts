import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { TournamentStatus } from './schemas/tournament.schema';

@Controller('tournaments')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Post()
  @Roles('admin')
  create(
    @Body() dto: CreateTournamentDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.tournamentsService.create(dto, user._id.toString());
  }

  @Get()
  findAll(@Query('status') status?: TournamentStatus) {
    return this.tournamentsService.findAll({ status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findById(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateTournamentDto) {
    return this.tournamentsService.update(id, dto);
  }

  @Delete(':id/teams/:teamId')
  @Roles('admin')
  removeTeam(@Param('id') id: string, @Param('teamId') teamId: string) {
    return this.tournamentsService.removeTeam(id, teamId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.tournamentsService.remove(id);
  }
}
