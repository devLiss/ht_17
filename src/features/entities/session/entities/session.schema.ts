/*import mongoose from "mongoose";

const sessionScheme = new mongoose.Schema({
  deviceId:{type:String, required:true},
  expiredDate:{type:Date, required:true,default: Date.now},
  ip:{type:String, required:true},
  lastActiveDate:{type:Date, required:true,default: Date.now},
  title:{type:String, required:true},
  userId:{type:String, required:true},
},{
  versionKey: false // You should be aware of the outcome after set to false
})
export const SessionModel = mongoose.model('sessions', sessionScheme)*/

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SessionDocument = Session & Document;

@Schema({ versionKey: false })
export class Session {
  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: Date, required: true, default: Date.now })
  expiredDate: Date;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: Date, required: true, default: Date.now })
  lastActiveDate: Date;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  userId: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
