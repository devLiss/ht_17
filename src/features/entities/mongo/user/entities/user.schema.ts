import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BanInfo, BanInfoSchema } from './banInfo.schema';
import { Recovery, RecoverySchema } from './recovery.schema';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
} from './emailConfirmation.schema';

export type UserDocument = User & Document;
@Schema({ versionKey: false })
export class User {
  @Prop()
  login: string;

  @Prop()
  email: string;

  @Prop()
  createdAt: string;

  @Prop()
  passwordHash: string;

  @Prop()
  passwordSalt: string;

  @Prop({ type: EmailConfirmationSchema })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: RecoverySchema })
  recoveryData: Recovery;

  @Prop({ type: BanInfoSchema })
  banInfo: BanInfo;
}

export const UserSchema = SchemaFactory.createForClass(User);
