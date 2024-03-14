import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { RpcException } from '@nestjs/microservices';
import { RegistationInput } from './inputs/registration.input';
import { RefreshTokenInput } from './inputs/refresh-token.input';
import { LoginInput } from './inputs/login.input';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from '@app/common';

describe('AuthService', () => {
  let authService: AuthService;
  let model: Model<User>;
  const mockUserModel = {
    findOne: jest.fn(),
    createOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUser = {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword'
  };

  const mockToken = "jwt";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(model).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      jest.spyOn(authService, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(authService, 'createOne').mockResolvedValueOnce(mockUser as UserDocument);

      jest.spyOn(authService, 'hashPassword').mockResolvedValueOnce(mockUser.password);

      jest.spyOn(jwt, 'sign').mockImplementation((data: any, secret: string, options: jwt.SignOptions) => {
        if (secret === process.env.JWT_ACCESS_SECRET) {
          return mockToken;
        } else if (secret === process.env.JWT_REFRESH_SECRET) {
          return mockToken;
        }
      });

      const result = await authService.register(mockUser as RegistationInput);
      expect(result).toBeDefined();
      expect(result.user).toEqual(mockUser);
      expect(result.access_token).toEqual(mockToken);
      expect(result.refresh_token).toEqual(mockToken);
    });

    it('should throw error if email already exists', async () => {
      jest.spyOn(authService, 'findOne').mockResolvedValueOnce(mockUser as UserDocument);
      await expect(authService.register(mockUser as RegistationInput)).rejects.toThrow(new RpcException('Email existed'));
    });

    it('should throw error if required fields are missing', async () => {
      const registrationInput: RegistationInput = {
        name: 'Test User',
        email: '',
        password: 'password',
      };

      await expect(authService.register(registrationInput)).rejects.toThrow();
  
      registrationInput.email = 'test@example.com';
      registrationInput.password = ''; 
  
      await expect(authService.register(registrationInput)).rejects.toThrow();
  
      registrationInput.password = 'password';
      registrationInput.name = ''; 
  
      await expect(authService.register(registrationInput)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should throw error if user not found', async () => {
      jest.spyOn(authService, 'findOne').mockResolvedValueOnce(null);

      await expect(authService.login({ email: 'test@example.com', password: 'password' } as LoginInput)).rejects.toThrow(new RpcException('User not found'));
    });

    it('should throw error if password is invalid', async () => {
      jest.spyOn(authService, 'findOne').mockResolvedValueOnce(mockUser as UserDocument);
      await expect(authService.login({ email: 'test@example.com', password: 'invalidPassword' } as LoginInput)).rejects.toThrow(new RpcException('Invalid email or password'));
    });
    it('should login successfully with valid credentials', async () => {
      jest.spyOn(authService, 'findOne').mockResolvedValueOnce(mockUser as UserDocument);
      
      jest.spyOn(authService, 'comparePasswords').mockResolvedValueOnce(true);

      jest.spyOn(jwt, 'sign').mockImplementation((data: any, secret: string, options: jwt.SignOptions) => {
        if (secret === process.env.JWT_ACCESS_SECRET) {
          return mockToken;
        } else if (secret === process.env.JWT_REFRESH_SECRET) {
          return mockToken;
        }
      });

      const result = await authService.login({ email: 'test@example.com', password: 'correctPassword' } as LoginInput);
      expect(result).toBeDefined();
      expect(result.user).toEqual(mockUser);
      expect(result.access_token).toEqual(mockToken);
      expect(result.refresh_token).toEqual(mockToken);
    });
  });

  describe('refreshToken', () => {
    it('should throw error if user not found', async () => {
      jest.spyOn(authService, 'findById').mockResolvedValueOnce(null);

      await expect(authService.refreshToken({ _id: 'id', refresh_token: 'token' } as RefreshTokenInput)).rejects.toThrow(new RpcException('User not found'));
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully with valid refresh token', async () => {
      jest.spyOn(authService, 'findById').mockResolvedValueOnce(mockUser as UserDocument);
  
      jest.spyOn(jwt, 'sign').mockImplementation((data: any, secret: string, options: jwt.SignOptions) => {
        if (secret === process.env.JWT_ACCESS_SECRET) {
          return mockToken;
        } else if (secret === process.env.JWT_REFRESH_SECRET) {
          return mockToken;
        }
      });

      const refreshTokenInput = { _id: '1', refresh_token: 'validRefreshToken' } as RefreshTokenInput;
  
      const result = await authService.refreshToken(refreshTokenInput);
  
      expect(result).toBeDefined();
      expect(result.user).toEqual(mockUser);
      expect(result.access_token).toEqual(mockToken);
      expect(result.refresh_token).toEqual(refreshTokenInput.refresh_token);
    });
  
    it('should throw error if user not found', async () => {
      jest.spyOn(authService, 'findById').mockResolvedValueOnce(null);
      const refreshTokenInput = { _id: '1', refresh_token: 'validRefreshToken' } as RefreshTokenInput;
      await expect(authService.refreshToken(refreshTokenInput)).rejects.toThrow(new RpcException('User not found'));
    });
  });
});