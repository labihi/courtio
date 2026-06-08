import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  TOURNAMENT_CREATED = 'TOURNAMENT_CREATED',
  TOURNAMENT_FILLING = 'TOURNAMENT_FILLING',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recipient: Types.ObjectId;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: Object, default: {} })
  data: Record<string, string>;

  @Prop({ default: false })
  read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
