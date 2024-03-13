import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ShareService } from './share.service';
import { Share } from '@app/common';
import { UseGuards } from '@nestjs/common';
import { JWTAuthGuard } from '../auth/guards/auth.guards';
import { CreateShareInput } from './inputs/create-share.input';
import { PagingInput } from '@app/common/inputs/paging.input';
import { GetSharesOutput } from './outputs/get-shares.output';
@Resolver(() => Share)
export class ShareResolver {
  constructor(private readonly shareService: ShareService) {}

  @Mutation(() => Share)
  @UseGuards(JWTAuthGuard)
  async createShare(@Args('createShareInput') createShareInput: CreateShareInput, @Context() context) {
    return await this.shareService.createShare({...createShareInput, user: context.req.user._id});
  }

  @Query(() => GetSharesOutput)
  async getShares(@Args('pagingInput') pagingInput: PagingInput) {
    return await this.shareService.getShares(pagingInput);
  }
}
