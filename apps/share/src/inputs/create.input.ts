import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
@InputType()
export class CreateShareInput {
  @Field()
  @IsNotEmpty()
  url: string;
  @Field()
  @IsNotEmpty()
  user: string;
}
