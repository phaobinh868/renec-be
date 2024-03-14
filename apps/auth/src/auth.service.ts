import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { RegistationInput } from './inputs/registration.input';
import { LoginInput } from './inputs/login.input';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { RefreshTokenInput } from './inputs/refresh-token.input';
import { User, UserDocument } from '@app/common';
import { BaseService } from '@app/common/utils/base-service';
import { AuthorizationType } from '@app/common/type/authorization.type';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
  ) {
    super(UserModel);
  }
  async register(
    registrationInput: RegistationInput,
  ): Promise<AuthorizationType> {
    try {
      const hashedPassword = await this.hashPassword(
        registrationInput.password,
      );
      const existedUser = await this.findOne({
        email: registrationInput.email.trim().toLowerCase(),
      });

      if(existedUser) throw new RpcException('Email existed');

      const user = await this.createOne({
        ...registrationInput,
        email: registrationInput.email.trim().toLowerCase(),
        password: hashedPassword,
      });

      const token = this.createToken(user);
      return {
        user,
        ...token,
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
  async login(loginInput: LoginInput): Promise<AuthorizationType> {
    const user = await this.findOne({
      email: loginInput.email.toLowerCase(),
    }, [], "+password");
    if (!user) throw new RpcException('User not found');
    const isPasswordValid = await this.comparePasswords(
      loginInput.password,
      user.password,
    );
    if (!isPasswordValid) throw new RpcException('Invalid email or password');
    const token = this.createToken(user);
    return {
      user,
      ...token,
    };
  }
  async refreshToken(refreshTokenInput: RefreshTokenInput): Promise<AuthorizationType> {
    const user = await this.findById(refreshTokenInput._id, [], "+password");
    if (!user) throw new RpcException('User not found');
    const token = this.createToken(user);
    return {
      user,
      ...token,
      refresh_token: refreshTokenInput.refresh_token,
    };
  }
  async getUser(id: string): Promise<User> {
    return await this.findById(id);
  }
  async getUsers(users: string[]): Promise<User> {
    return await this.find({_id: {$in: users}});
  }
  public async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
  public async comparePasswords(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
  }
  private createToken(user: User) {
    const dataStoredInToken = {
      _id: user._id,
      email: user.email,
      name: user.name,
    };
    return {
      access_token: jwt.sign(dataStoredInToken, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_SECRET_EXPIRE }),
      refresh_token: jwt.sign(dataStoredInToken, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_SECRET_EXPIRE })
    };
  }
}
