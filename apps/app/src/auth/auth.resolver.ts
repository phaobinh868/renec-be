import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';

import { LoginInput } from './inputs/login.input';
import { AuthService } from './auth.service';
import { RegistationInput } from './inputs/registration.input';
import { UseGuards } from '@nestjs/common';
import { JWTRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/user.decorator';
import { AuthorizationType } from '@app/common/type/authorization.type';
import { User } from '@app/common';
@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthorizationType)
  async register(
    @Args('registrationInput') registrationInput: RegistationInput,
  ) {
    return await this.authService.register(registrationInput);
  }

  @Mutation(() => AuthorizationType)
  async login(@Args('loginInput') loginInput: LoginInput) {
    return await this.authService.login(loginInput);
  }

  @Mutation(() => AuthorizationType)
  @UseGuards(JWTRefreshGuard)
  async refreshToken(@Context() context) {
    return await this.authService.refreshToken(context.user, context.req.header("Authorization").replace('Bearer', '').trim());
  }

  @Query(() => User)
  async getUser(@CurrentUser() user) {
    return await this.authService.getUser({ _id: user._id });
  }
}
