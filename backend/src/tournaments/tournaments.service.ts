import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tournament, TournamentDocument, TournamentStatus } from './schemas/tournament.schema';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectModel(Tournament.name) private tournamentModel: Model<TournamentDocument>,
  ) {}

  async create(dto: CreateTournamentDto, organizerId: string): Promise<TournamentDocument> {
    return this.tournamentModel.create({
      ...dto,
      organizers: [new Types.ObjectId(organizerId)],
    });
  }

  async findAll(filters?: { status?: TournamentStatus }): Promise<TournamentDocument[]> {
    const query: Record<string, unknown> = {};
    if (filters?.status) query.status = filters.status;
    return this.tournamentModel
      .find(query)
      .populate('organizers', 'firstName lastName email')
      .populate('registeredTeams', 'name captain')
      .sort({ dateTime: 1 })
      .exec();
  }

  async findById(id: string): Promise<TournamentDocument> {
    const tournament = await this.tournamentModel
      .findById(id)
      .populate('organizers', 'firstName lastName email avatar')
      .populate({
        path: 'registeredTeams',
        populate: { path: 'captain members.user', select: 'firstName lastName avatar volleyballRoles' },
      })
      .populate({
        path: 'soloRegistrations',
        populate: { path: 'player', select: 'firstName lastName avatar volleyballRoles' },
      })
      .exec();
    if (!tournament) throw new NotFoundException(`Tournament ${id} not found`);
    return tournament;
  }

  async update(id: string, dto: UpdateTournamentDto): Promise<TournamentDocument> {
    const tournament = await this.tournamentModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!tournament) throw new NotFoundException(`Tournament ${id} not found`);
    return tournament;
  }

  async remove(id: string): Promise<void> {
    const result = await this.tournamentModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Tournament ${id} not found`);
  }

  async addTeam(tournamentId: string, teamId: Types.ObjectId): Promise<TournamentDocument> {
    const tournament = await this.findById(tournamentId);
    if (tournament.registeredTeams.length >= tournament.maxTeamSlots) {
      throw new BadRequestException('Tournament is full');
    }
    if (tournament.registeredTeams.some((t) => t.toString() === teamId.toString())) {
      throw new BadRequestException('Team already registered');
    }
    tournament.registeredTeams.push(teamId);
    if (tournament.registeredTeams.length >= tournament.maxTeamSlots) {
      tournament.status = TournamentStatus.FULL;
    }
    return tournament.save();
  }

  async addSoloRegistration(tournamentId: string, registrationId: Types.ObjectId): Promise<void> {
    await this.tournamentModel.findByIdAndUpdate(tournamentId, {
      $addToSet: { soloRegistrations: registrationId },
    });
  }

  async removeTeam(tournamentId: string, teamId: string): Promise<TournamentDocument> {
    const tournament = await this.tournamentModel
      .findByIdAndUpdate(
        tournamentId,
        { $pull: { registeredTeams: new Types.ObjectId(teamId) } },
        { new: true },
      )
      .exec();
    if (!tournament) throw new NotFoundException(`Tournament ${tournamentId} not found`);
    if (tournament.status === TournamentStatus.FULL && tournament.registeredTeams.length < tournament.maxTeamSlots) {
      tournament.status = TournamentStatus.OPEN;
      await tournament.save();
    }
    return tournament;
  }
}
