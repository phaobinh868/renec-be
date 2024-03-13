import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.entity';

export type ShareDocument = Share & mongoose.Document;

@ObjectType()
@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'shares',
})
export class Share {
  @Field(() => ID)
  @Prop({ type: mongoose.Schema.Types.ObjectId, require: true, auto: true })
  _id: string;

  @Field({ nullable: false })
  @Prop({ required: true })
  video_id: string;

  @Field()
  @Prop({ required: true })
  title: string;

  @Field()
  @Prop({ required: false })
  channel: string;

  @Field()
  @Prop({ required: false })
  thumbnail: string;

  @Field()
  @Prop({ required: false })
  description: string;

  @Field(() => User, { nullable: true })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Field()
  created_at: string;

  @Field()
  updated_at: string;
}
export const ShareSchema = SchemaFactory.createForClass(Share);
