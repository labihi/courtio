import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    return this.userModel.create(dto);
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByClerkId(clerkId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ clerkId }).exec();
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async updateRoles(
    id: string,
    volleyballRoles: string[],
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { volleyballRoles }, { new: true })
      .exec();
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`User ${id} not found`);
  }

  async addTeam(userId: string, teamId: Types.ObjectId): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { teams: teamId },
    });
  }

  async addCaptainOf(userId: string, teamId: Types.ObjectId): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { captainOf: teamId, teams: teamId },
    });
  }

  async removeCaptainOf(userId: string, teamId: Types.ObjectId): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { captainOf: teamId },
    });
  }

  async searchAvailable(query: string): Promise<UserDocument[]> {
    return this.userModel
      .find({
        $or: [
          { firstName: new RegExp(query, 'i') },
          { lastName: new RegExp(query, 'i') },
          { email: new RegExp(query, 'i') },
        ],
      })
      .limit(20)
      .exec();
  }
}
