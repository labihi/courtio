import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class Place {
  @Prop({ required: true })
  placeName: string;

  @Prop({ required: true })
  placeAddress: string;

  @Prop()
  placeUrl?: string;
}

export type TournamentDocument = Tournament & Document;

export enum TournamentStatus {
  UPCOMING = 'UPCOMING',
  OPEN = 'OPEN',
  FULL = 'FULL',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TournamentFormat {
  SIX_V_SIX = '6v6',
  FOUR_V_FOUR = '4v4',
  TWO_V_TWO = '2v2',
}

export enum SkillLevel {
  A = 'A',
  A_BB = 'A/BB',
  BB = 'BB',
  BB_B = 'BB/B',
  B = 'B',
  OPEN = 'Open',
  ELITE = 'Elite',
}

@Schema({ timestamps: true })
export class Tournament {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Place })
  place: Place;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  dateTime: Date;

  @Prop()
  registrationCloseDateTime?: Date;

  @Prop({ required: true })
  maxTeamSlots: number;

  @Prop({ type: String, enum: TournamentFormat, default: TournamentFormat.SIX_V_SIX })
  format: TournamentFormat;

  @Prop({ type: String, enum: SkillLevel, default: SkillLevel.OPEN })
  skillLevel: SkillLevel;

  @Prop()
  description: string;

  @Prop()
  imageUrl: string;

  @Prop({ type: String, enum: TournamentStatus, default: TournamentStatus.OPEN })
  status: TournamentStatus;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  organizers: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Team', default: [] })
  registeredTeams: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Registration', default: [] })
  soloRegistrations: Types.ObjectId[];
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);
