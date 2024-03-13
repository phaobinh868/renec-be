import { Field, InputType } from '@nestjs/graphql';
import { MaxLength, MinLength, IsEmail, IsNotEmpty } from 'class-validator';
@InputType()
export class RegistationInput {
  @Field()
  @IsNotEmpty()
  name: string;
  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @Field()
  @IsNotEmpty()
  password: string;
}
