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
import { UsersService } from '../users/users.service';
import { TournamentFormat } from '../tournaments/schemas/tournament.schema';

const FORMAT_MIN_ROSTER: Record<TournamentFormat, number> = {
  [TournamentFormat.SIX_V_SIX]: 6,
  [TournamentFormat.FOUR_V_FOUR]: 4,
  [TournamentFormat.TWO_V_TWO]: 2,
};

export interface MarketPlayer {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  volleyballRoles: string[];
  hasTeam: boolean;
  soloRegistration?: {
    _id: string;
    tournament: { _id: string; name: string };
    role: string;
  } | null;
}

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectModel(Registration.name) private regModel: Model<RegistrationDocument>,
    private tournamentsService: TournamentsService,
    private teamsService: TeamsService,
    private usersService: UsersService,
  ) {}

  async registerAsTeam(
    dto: CreateRegistrationDto,
    requesterId: string,
  ): Promise<RegistrationDocument> {
    if (!dto.teamId) throw new BadRequestException('teamId required for team registration');
    const team = await this.teamsService.findById(dto.teamId);
    if ((team.captain as any)._id.toString() !== requesterId) {
      throw new BadRequestException('Only the captain can register the team');
    }

    const tournament = await this.tournamentsService.findById(dto.tournamentId);
    const minRoster = FORMAT_MIN_ROSTER[tournament.format] ?? 6;

    if (!dto.roster || dto.roster.length < minRoster) {
      throw new BadRequestException(
        `Roster must have at least ${minRoster} players for ${tournament.format} format`,
      );
    }

    const teamMemberIds = new Set(
      team.members.map((m) => ((m.user as any)._id ?? m.user).toString()),
    );
    for (const playerId of dto.roster) {
      if (!teamMemberIds.has(playerId)) {
        throw new BadRequestException(`Player ${playerId} is not a member of this team`);
      }
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
      roster: dto.roster.map((id) => new Types.ObjectId(id)),
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
    if (!dto.role) throw new BadRequestException('role required for solo registration');

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

  async getMarket(tournamentId?: string): Promise<MarketPlayer[]> {
    const teamRegs = await this.regModel
      .find({
        type: RegistrationType.TEAM,
        status: { $ne: RegistrationStatus.CANCELLED },
      })
      .select('roster')
      .lean()
      .exec();

    const rosteredIds = new Set<string>(
      teamRegs.flatMap((r) => ((r as any).roster ?? []).map((id: Types.ObjectId) => id.toString())),
    );

    const allUsers = await this.usersService.findAll();
    const availableUsers = allUsers.filter((u) => !rosteredIds.has(u._id.toString()));

    let soloMap = new Map<string, RegistrationDocument>();
    if (tournamentId) {
      const soloRegs = await this.regModel
        .find({
          tournament: new Types.ObjectId(tournamentId),
          type: RegistrationType.SOLO,
          status: { $ne: RegistrationStatus.CANCELLED },
        })
        .populate('tournament', 'name')
        .exec();
      for (const reg of soloRegs) {
        soloMap.set(reg.player!.toString(), reg);
      }
    }

    return availableUsers.map((user) => {
      const soloReg = soloMap.get(user._id.toString());
      return {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        volleyballRoles: user.volleyballRoles,
        hasTeam: user.teams.length > 0,
        soloRegistration: soloReg
          ? {
              _id: (soloReg._id as Types.ObjectId).toString(),
              tournament: {
                _id: (soloReg.tournament as any)._id?.toString() ?? soloReg.tournament.toString(),
                name: (soloReg.tournament as any).name ?? '',
              },
              role: soloReg.role,
            }
          : null,
      };
    });
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

  async deleteRegistration(registrationId: string): Promise<void> {
    const reg = await this.regModel.findByIdAndDelete(registrationId);
    if (!reg) throw new NotFoundException('Registration not found');
    if (reg.tournament) {
      await this.tournamentsService.removeSoloRegistration(
        reg.tournament.toString(),
        reg._id as Types.ObjectId,
      );
    }
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
