import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, versionKey: false })
export class EmailConfirmation {
  @Prop()
  confirmationCode: string;
  @Prop()
  expirationDate: string;
  @Prop()
  isConfirmed: boolean;
}
export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);
