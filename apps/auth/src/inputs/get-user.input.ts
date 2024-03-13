import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
@InputType()
export class GetUserInput {
  @Field()
  @IsNotEmpty()
  _id: string;
}
