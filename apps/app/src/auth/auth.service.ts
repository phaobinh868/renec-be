import { User } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GraphQLError } from 'graphql';
import { lastValueFrom } from 'rxjs';
@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH') private readonly authServiceClient: ClientProxy,
  ) { }

  public async register(defaultInput) {
    try {
      const data = await lastValueFrom(
        this.authServiceClient.send(
          { cmd: 'register' },
          {
            ...defaultInput,
          },
        ),
      );
      return data;
    } catch (error) {
      throw new GraphQLError(error.message);
    }
  }
  public async login(loginInput) {
    try {
      const data = await lastValueFrom(
        this.authServiceClient.send(
          { cmd: 'login' },
          {
            loginInput
          }
        ),
      );
      return data;
    } catch (error) {
      throw new GraphQLError(error.message);
    }
  }
  public async getUser(getUserInput) {
    try {
      const data = await lastValueFrom(
        this.authServiceClient.send(
          { cmd: 'get-user' },
          {
            ...getUserInput,
          },
        ),
      );
      return data;
    } catch (error) {
      throw new GraphQLError(error.message);
    }
  }
  public async getUsers(userIds: string[]) {
    try {
      const data = await lastValueFrom(
        this.authServiceClient.send(
          { cmd: 'get-users' },
          {
            users: userIds
          },
        ),
      );
      return data;
    } catch (error) {
      throw new GraphQLError(error.message);
    }
  }
  public async refreshToken(user: User, refreshToken: string) {
    try {
      const data = await lastValueFrom(
        this.authServiceClient.send(
          { cmd: 'refresh-token' },
          {
            user,
            refreshToken
          },
        ),
      );
      return data;
    } catch (error) {
      throw new GraphQLError(error.message);
    }
  }
}
