import { InputType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class PagingInput {
  @Field({ nullable: true })
  limit: number;

  @Field({ nullable: true })
  page: number;

  @Field(() => GraphQLJSON, { nullable: true })
  query: JSON;

  @Field(() => GraphQLJSON, { nullable: true })
  sort: JSON;

  @Field({ nullable: true })
  search: string;
}