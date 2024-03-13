import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
@InputType()
export class RefreshTokenInput {
  @Field()
  @IsNotEmpty()
  _id: string;
  @Field()
  @IsNotEmpty()
  refresh_token: string;
}
