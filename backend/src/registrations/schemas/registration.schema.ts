import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { VolleyballRole } from '../../common/enums/volleyball-role.enum';

export type RegistrationDocument = Registration & Document;

export enum RegistrationType {
  TEAM = 'TEAM',
  SOLO = 'SOLO',
}

export enum RegistrationStatus {
  REGISTERED = 'REGISTERED',
  WANT_TO_JOIN = 'WANT_TO_JOIN',
  CONFIRMED = 'CONFIRMED',
  WAITLIST = 'WAITLIST',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Registration {
  @Prop({ type: Types.ObjectId, ref: 'Tournament', required: true })
  tournament: Types.ObjectId;

  @Prop({ type: String, enum: RegistrationType, required: true })
  type: RegistrationType;

  @Prop({ type: Types.ObjectId, ref: 'Team' })
  team: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  player: Types.ObjectId;

  @Prop({ type: String, enum: VolleyballRole })
  role: VolleyballRole;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  roster: Types.ObjectId[];

  @Prop({ type: String, enum: RegistrationStatus, default: RegistrationStatus.REGISTERED })
  status: RegistrationStatus;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);
