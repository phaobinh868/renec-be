import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User, UserSchema } from 'libs/common/src';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/auth/.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule.forRoot({
        envFilePath: './apps/auth/.env',
      })],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(
      [
        {
          name: User.name,
          schema: UserSchema,
          collection: 'users',
        },
      ],
    ),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
