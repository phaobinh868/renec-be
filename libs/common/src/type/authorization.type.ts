import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../entity/user.entity';
@ObjectType('Authorization')
export class AuthorizationType {
  @Field(() => User)
  user: User;
  @Field()
  access_token: string;
  @Field()
  refresh_token: string;
}
