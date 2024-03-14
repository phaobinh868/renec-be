import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { ShareService } from './share.service';
import { CreateShareInput } from './inputs/create.input';
import { PagingInput } from 'libs/common/src/inputs/paging.input';
@Controller('shares')
export class ShareController {
  constructor(private readonly shareService: ShareService) { }
  @MessagePattern({ cmd: 'get-shares' })
  async getShares(@Payload() pagingInput: PagingInput) {
    return await this.shareService.getShares(pagingInput);
  }
  @MessagePattern({ cmd: 'create-share' })
  async createShare(@Payload() data: CreateShareInput) {
    return await this.shareService.createShare(data);
  }
}
