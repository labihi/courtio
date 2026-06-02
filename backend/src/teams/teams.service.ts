import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Team, TeamDocument, MemberStatus } from './schemas/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto, AddMemberDto, UpdateMemberRoleDto, TransferCaptainDto } from './dto/update-team.dto';
import { VolleyballRole } from '../common/enums/volleyball-role.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    private usersService: UsersService,
  ) {}

  async create(dto: CreateTeamDto, captainId: string): Promise<TeamDocument> {
    const captainObjectId = new Types.ObjectId(captainId);
    const team = await this.teamModel.create({
      ...dto,
      captain: captainObjectId,
      members: [{ user: captainObjectId, status: MemberStatus.ACTIVE }],
    });
    await this.usersService.addCaptainOf(captainId, team._id as Types.ObjectId);
    return this.findById(team._id.toString());
  }

  async findAll(): Promise<TeamDocument[]> {
    return this.teamModel
      .find()
      .populate('captain', 'firstName lastName avatar')
      .populate('members.user', 'firstName lastName avatar volleyballRoles')
      .exec();
  }

  async findById(id: string): Promise<TeamDocument> {
    const team = await this.teamModel
      .findById(id)
      .populate('captain', 'firstName lastName avatar email')
      .populate('members.user', 'firstName lastName avatar volleyballRoles')
      .exec();
    if (!team) throw new NotFoundException(`Team ${id} not found`);
    return team;
  }

  async findByUser(userId: string): Promise<TeamDocument[]> {
    return this.teamModel
      .find({ 'members.user': new Types.ObjectId(userId) })
      .populate('captain', 'firstName lastName avatar')
      .populate('members.user', 'firstName lastName avatar volleyballRoles')
      .exec();
  }

  async update(
    id: string,
    dto: UpdateTeamDto,
    requesterId: string,
  ): Promise<TeamDocument> {
    const team = await this.findById(id);
    if ((team.captain as any)._id.toString() !== requesterId) {
      throw new ForbiddenException('Only the captain can update the team');
    }
    await this.teamModel.findByIdAndUpdate(id, dto).exec();
    return this.findById(id);
  }

  async addMember(
    teamId: string,
    dto: AddMemberDto,
    requesterId: string,
  ): Promise<TeamDocument> {
    const team = await this.findById(teamId);
    if (
      (team.captain as any)._id.toString() !== requesterId &&
      !(await this.isAdmin(requesterId))
    ) {
      throw new ForbiddenException('Only the captain can add members');
    }
    const alreadyMember = team.members.some(
      (m) => ((m.user as any)._id ?? m.user).toString() === dto.userId,
    );
    if (alreadyMember) throw new BadRequestException('User already on team');

    await this.usersService.addTeam(dto.userId, team._id as Types.ObjectId);
    await this.teamModel.findByIdAndUpdate(teamId, {
      $push: {
        members: {
          user: new Types.ObjectId(dto.userId),
          role: dto.role,
          status: MemberStatus.ACTIVE,
          jerseyNumber: dto.jerseyNumber,
        },
      },
    }).exec();
    return this.findById(teamId);
  }

  async removeMember(
    teamId: string,
    userId: string,
    requesterId: string,
  ): Promise<TeamDocument> {
    const team = await this.findById(teamId);
    if ((team.captain as any)._id.toString() !== requesterId) {
      throw new ForbiddenException('Only the captain can remove members');
    }
    if ((team.captain as any)._id.toString() === userId) {
      throw new BadRequestException('Cannot remove the captain from the team');
    }
    await this.teamModel.findByIdAndUpdate(
      teamId,
      { $pull: { members: { user: new Types.ObjectId(userId) } } },
    ).exec();
    return this.findById(teamId);
  }

  async updateMemberRole(
    teamId: string,
    memberId: string,
    role: VolleyballRole | undefined,
    requesterId: string,
  ): Promise<TeamDocument> {
    const team = await this.findById(teamId);
    if ((team.captain as any)._id.toString() !== requesterId) {
      throw new ForbiddenException('Only the captain can change member roles');
    }
    const updateOp = role
      ? { $set: { 'members.$.role': role } }
      : { $unset: { 'members.$.role': '' } };
    await this.teamModel.findOneAndUpdate(
      { _id: teamId, 'members.user': new Types.ObjectId(memberId) },
      updateOp,
    ).exec();
    return this.findById(teamId);
  }

  async transferCaptaincy(
    teamId: string,
    dto: TransferCaptainDto,
    requesterId: string,
  ): Promise<TeamDocument> {
    const team = await this.findById(teamId);
    if ((team.captain as any)._id.toString() !== requesterId) {
      throw new ForbiddenException('Only the captain can transfer captaincy');
    }
    const isMember = team.members.some(
      (m) => ((m.user as any)._id ?? m.user).toString() === dto.userId,
    );
    if (!isMember) {
      throw new BadRequestException('New captain must be a current team member');
    }
    await this.usersService.removeCaptainOf(requesterId, team._id as Types.ObjectId);
    await this.usersService.addCaptainOf(dto.userId, team._id as Types.ObjectId);
    await this.teamModel.findByIdAndUpdate(teamId, { captain: new Types.ObjectId(dto.userId) }).exec();
    return this.findById(teamId);
  }

  async remove(id: string, requesterId: string): Promise<void> {
    const team = await this.findById(id);
    if ((team.captain as any)._id.toString() !== requesterId) {
      throw new ForbiddenException('Only the captain can delete the team');
    }
    await this.teamModel.findByIdAndDelete(id).exec();
  }

  async getMissingRoles(teamId: string): Promise<Record<string, number>> {
    const team = await this.findById(teamId);
    const filled: Record<string, number> = {};
    team.members.forEach((m) => {
      if (m.role) filled[m.role] = (filled[m.role] || 0) + 1;
    });
    const required: Record<string, number> = { OH: 2, MB: 2, OPP: 1, SET: 1, LIB: 1 };
    const missing: Record<string, number> = {};
    for (const [role, count] of Object.entries(required)) {
      const diff = count - (filled[role] || 0);
      if (diff > 0) missing[role] = diff;
    }
    return missing;
  }

  private async isAdmin(userId: string): Promise<boolean> {
    try {
      const user = await this.usersService.findById(userId);
      return user.platformRole === 'admin';
    } catch {
      return false;
    }
  }
}
