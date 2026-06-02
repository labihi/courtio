import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Registration,
  RegistrationDocument,
  RegistrationType,
  RegistrationStatus,
} from './schemas/registration.schema';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { TournamentsService } from '../tournaments/tournaments.service';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectModel(Registration.name) private regModel: Model<RegistrationDocument>,
    private tournamentsService: TournamentsService,
    private teamsService: TeamsService,
  ) {}

  async registerAsTeam(
    dto: CreateRegistrationDto,
    requesterId: string,
  ): Promise<RegistrationDocument> {
    if (!dto.teamId) throw new BadRequestException('teamId required for team registration');
    const team = await this.teamsService.findById(dto.teamId);
    if (team.captain.toString() !== requesterId) {
      throw new BadRequestException('Only the captain can register the team');
    }

    const existing = await this.regModel.findOne({
      tournament: new Types.ObjectId(dto.tournamentId),
      team: new Types.ObjectId(dto.teamId),
      status: { $ne: RegistrationStatus.CANCELLED },
    });
    if (existing) throw new BadRequestException('Team already registered for this tournament');

    const registration = await this.regModel.create({
      tournament: new Types.ObjectId(dto.tournamentId),
      type: RegistrationType.TEAM,
      team: new Types.ObjectId(dto.teamId),
      player: new Types.ObjectId(requesterId),
      role: dto.role,
      status: RegistrationStatus.REGISTERED,
    });

    await this.tournamentsService.addTeam(
      dto.tournamentId,
      new Types.ObjectId(dto.teamId),
    );

    return registration;
  }

  async registerAsSolo(
    dto: CreateRegistrationDto,
    playerId: string,
  ): Promise<RegistrationDocument> {
    const existing = await this.regModel.findOne({
      tournament: new Types.ObjectId(dto.tournamentId),
      player: new Types.ObjectId(playerId),
      type: RegistrationType.SOLO,
      status: { $ne: RegistrationStatus.CANCELLED },
    });
    if (existing) throw new BadRequestException('Already registered for this tournament');

    const registration = await this.regModel.create({
      tournament: new Types.ObjectId(dto.tournamentId),
      type: RegistrationType.SOLO,
      player: new Types.ObjectId(playerId),
      role: dto.role,
      status: dto.status ?? RegistrationStatus.WANT_TO_JOIN,
    });

    await this.tournamentsService.addSoloRegistration(
      dto.tournamentId,
      registration._id as Types.ObjectId,
    );

    return registration;
  }

  async getWantToJoin(tournamentId: string): Promise<RegistrationDocument[]> {
    return this.regModel
      .find({
        tournament: new Types.ObjectId(tournamentId),
        type: RegistrationType.SOLO,
        status: RegistrationStatus.WANT_TO_JOIN,
      })
      .populate('player', 'firstName lastName avatar volleyballRoles')
      .exec();
  }

  async getTournamentRegistrations(tournamentId: string): Promise<RegistrationDocument[]> {
    return this.regModel
      .find({ tournament: new Types.ObjectId(tournamentId) })
      .populate('player', 'firstName lastName avatar volleyballRoles')
      .populate('team', 'name captain')
      .exec();
  }

  async getMyRegistrations(playerId: string): Promise<RegistrationDocument[]> {
    return this.regModel
      .find({ player: new Types.ObjectId(playerId) })
      .populate('tournament', 'name place dateTime status')
      .exec();
  }

  async cancel(registrationId: string, requesterId: string): Promise<RegistrationDocument> {
    const reg = await this.regModel.findById(registrationId);
    if (!reg) throw new NotFoundException('Registration not found');
    if (reg.player?.toString() !== requesterId) {
      throw new BadRequestException('Cannot cancel another user\'s registration');
    }
    reg.status = RegistrationStatus.CANCELLED;
    return reg.save();
  }

  async updateStatus(
    registrationId: string,
    status: RegistrationStatus,
  ): Promise<RegistrationDocument> {
    const reg = await this.regModel.findByIdAndUpdate(
      registrationId,
      { status },
      { new: true },
    );
    if (!reg) throw new NotFoundException('Registration not found');
    return reg;
  }
}
