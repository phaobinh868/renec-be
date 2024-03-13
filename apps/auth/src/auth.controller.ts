import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegistationInput } from './inputs/registration.input';
import { LoginInput } from './inputs/login.input';
import { GetUserInput } from './inputs/get-user.input';
import { RefreshTokenInput } from './inputs/refresh-token.input';
import { GetUsersInput } from './inputs/get-users.input';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @MessagePattern({ cmd: 'register' })
  async register(@Payload() data: RegistationInput) {
    return await this.authService.register(data);
  }
  @MessagePattern({ cmd: 'login' })
  async login(@Payload("loginInput") loginInput: LoginInput) {
    return await this.authService.login(loginInput);
  }
  @MessagePattern({ cmd: 'refresh-token' })
  async refreshToken(@Payload("refreshTokenInput") refreshTokenInput: RefreshTokenInput) {
    return await this.authService.refreshToken(refreshTokenInput);
  }
  @MessagePattern({ cmd: 'get-user' })
  async getUser(@Payload() getUserInput: GetUserInput) {
    return await this.authService.getUser(getUserInput._id);
  }
  @MessagePattern({ cmd: 'get-users' })
  async getUsers(@Payload() getUsersInput: GetUsersInput) {
    return await this.authService.getUsers(getUsersInput.users);
  }
}
