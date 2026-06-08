import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';
import { Tournament, TournamentSchema } from './schemas/tournament.schema';
import { Registration, RegistrationSchema } from '../registrations/schemas/registration.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tournament.name, schema: TournamentSchema },
      { name: Registration.name, schema: RegistrationSchema },
    ]),
    AuthModule,
    UsersModule,
    NotificationsModule,
  ],
  providers: [TournamentsService],
  controllers: [TournamentsController],
  exports: [TournamentsService],
})
export class TournamentsModule {}
