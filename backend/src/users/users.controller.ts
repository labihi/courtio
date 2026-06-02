import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserDocument } from './schemas/user.schema';

@Controller('users')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: UserDocument) {
    return user;
  }

  @Patch('me')
  updateMe(@CurrentUser() user: UserDocument, @Body() dto: UpdateUserDto) {
    const { platformRole, ...safeDto } = dto;
    return this.usersService.update(user._id.toString(), safeDto);
  }

  @Patch('me/roles')
  updateMyRoles(
    @CurrentUser() user: UserDocument,
    @Body('volleyballRoles') roles: string[],
  ) {
    return this.usersService.updateRoles(user._id.toString(), roles);
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.usersService.searchAvailable(query ?? '');
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
