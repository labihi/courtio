import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { VolleyballRole } from '../../common/enums/volleyball-role.enum';

export type UserDocument = User & Document;

export enum PlatformRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  clerkId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: '' })
  firstName: string;

  @Prop({ default: '' })
  lastName: string;

  @Prop()
  avatar: string;

  @Prop({ type: String, enum: PlatformRole, default: PlatformRole.USER })
  platformRole: PlatformRole;

  @Prop({ type: [String], enum: VolleyballRole, default: [] })
  volleyballRoles: VolleyballRole[];

  @Prop({ type: [Types.ObjectId], ref: 'Team', default: [] })
  teams: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Team', default: [] })
  captainOf: Types.ObjectId[];

  @Prop({
    type: [
      {
        endpoint: String,
        expirationTime: Number,
        keys: { auth: String, p256dh: String },
      },
    ],
    default: [],
  })
  pushSubscriptions: {
    endpoint: string;
    expirationTime?: number | null;
    keys: { auth: string; p256dh: string };
  }[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
