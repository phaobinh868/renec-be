import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
@InputType()
export class GetUsersInput {
  @Field()
  @IsNotEmpty()
  users: string[];
}
