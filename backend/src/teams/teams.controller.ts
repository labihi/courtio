import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto, AddMemberDto, UpdateMemberRoleDto, TransferCaptainDto } from './dto/update-team.dto';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@Controller('teams')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body() dto: CreateTeamDto, @CurrentUser() user: UserDocument) {
    return this.teamsService.create(dto, user._id.toString());
  }

  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @Get('mine')
  findMine(@CurrentUser() user: UserDocument) {
    return this.teamsService.findByUser(user._id.toString());
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findById(id);
  }

  @Get(':id/missing-roles')
  getMissingRoles(@Param('id') id: string) {
    return this.teamsService.getMissingRoles(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.teamsService.update(id, dto, user._id.toString());
  }

  @Post(':id/members')
  addMember(
    @Param('id') teamId: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.teamsService.addMember(teamId, dto, user._id.toString());
  }

  @Patch(':id/members/:userId/role')
  updateMemberRole(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.teamsService.updateMemberRole(teamId, userId, dto.role, user._id.toString());
  }

  @Patch(':id/captain')
  transferCaptain(
    @Param('id') teamId: string,
    @Body() dto: TransferCaptainDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.teamsService.transferCaptaincy(teamId, dto, user._id.toString());
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.teamsService.removeMember(teamId, userId, user._id.toString());
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.teamsService.remove(id, user._id.toString());
  }
}
