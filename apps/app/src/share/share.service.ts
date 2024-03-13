import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GraphQLError } from 'graphql';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { PagingInput } from '@app/common/inputs/paging.input';
import { Share, User } from '@app/common';
import { SocketGateway } from '../socket/socket.gateway';
export class ShareService {
  constructor(
    @Inject('SHARE') private readonly shareServiceClient: ClientProxy,
    private readonly authService: AuthService,
    private readonly socketGateway: SocketGateway,
  ) { }

  public async createShare(createShareInput) {
    try {
      const data = await lastValueFrom(
        this.shareServiceClient.send(
          { cmd: 'create-share' },
          {
            ...createShareInput,
          },
        ),
      );
      data.user = await this.authService.getUser({ _id: data.user });
      await this.socketGateway.emit("new_share", JSON.stringify(data));
      return data;
    } catch (error) {
      throw new GraphQLError(error.message);
    }
  }
  public async getShares(pagingInput: PagingInput) {
    try {
      const data = await lastValueFrom(
        this.shareServiceClient.send({ cmd: 'get-shares' }, {
          ...pagingInput
        }),
      );
      const userIds = data.data.map((share: Share) => share.user);
      if(userIds.length) {
        const users = await this.authService.getUsers(userIds);
        for (let index = 0; index < data.data.length; index++) {
          const foundIndex = users.findIndex((user: User) => user._id == data.data[index].user);
          data.data[index].user = (foundIndex !== -1) ? users[foundIndex] : null;
        }
      }
      return data;
    } catch (error) {
      throw new GraphQLError(error.message);
    }
  }
}
