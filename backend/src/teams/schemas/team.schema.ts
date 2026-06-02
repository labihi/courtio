import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { VolleyballRole } from '../../common/enums/volleyball-role.enum';

export type TeamDocument = Team & Document;

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
}

export class TeamMember {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: String, enum: VolleyballRole })
  role: VolleyballRole;

  @Prop({ type: String, enum: MemberStatus, default: MemberStatus.ACTIVE })
  status: MemberStatus;

  @Prop()
  jerseyNumber: number;
}

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  captain: Types.ObjectId;

  @Prop({ type: [TeamMember], default: [] })
  members: TeamMember[];

  @Prop()
  avatar: string;

  @Prop()
  season: string;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
