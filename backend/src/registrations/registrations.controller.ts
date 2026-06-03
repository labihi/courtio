import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { RegistrationStatus, RegistrationType } from './schemas/registration.schema';

@Controller('registrations')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post('team')
  registerAsTeam(
    @Body() dto: CreateRegistrationDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.registrationsService.registerAsTeam(dto, user._id.toString());
  }

  @Post('solo')
  registerAsSolo(
    @Body() dto: CreateRegistrationDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.registrationsService.registerAsSolo(dto, user._id.toString());
  }

  @Get('tournament/:tournamentId')
  getTournamentRegistrations(@Param('tournamentId') id: string) {
    return this.registrationsService.getTournamentRegistrations(id);
  }

  @Get('market')
  getMarket(@Query('tournamentId') tournamentId?: string) {
    return this.registrationsService.getMarket(tournamentId);
  }

  @Get('tournament/:tournamentId/want-to-join')
  getWantToJoin(@Param('tournamentId') id: string) {
    return this.registrationsService.getWantToJoin(id);
  }

  @Get('me')
  getMyRegistrations(@CurrentUser() user: UserDocument) {
    return this.registrationsService.getMyRegistrations(user._id.toString());
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.registrationsService.cancel(id, user._id.toString());
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: RegistrationStatus,
  ) {
    return this.registrationsService.updateStatus(id, status);
  }
}
