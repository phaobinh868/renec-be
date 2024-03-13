import { Share } from '@app/common';
import { Field, ObjectType } from '@nestjs/graphql';
@ObjectType()
export class GetSharesOutput {
  @Field()
  total: number;
  
  @Field(() => [Share])
  data: Share[]
}
