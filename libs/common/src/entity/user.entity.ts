import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = User & mongoose.Document;

@ObjectType()
@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'users',
})
export class User {
  @Field(() => ID)
  @Prop({ type: mongoose.Schema.Types.ObjectId, require: true, auto: true })
  _id: string;

  @Field({ nullable: false })
  @Prop({ required: true })
  email: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({type: [String], select: false, default: []})
  refresh_tokens: string[];

  @Field()
  created_at: string;

  @Field()
  updated_at: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
