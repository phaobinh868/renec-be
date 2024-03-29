import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { AuthResolver } from './auth.resolver';
import { JWTRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JWTStrategy } from './strategies/jwt.strategy';
import { RmqModule } from '@app/common';
@Module({
  imports: [
    ConfigModule,
    RmqModule.register({
      name: 'AUTH',
    }),
  ],
  providers: [
    AuthService, 
    AuthResolver,
    JWTStrategy, 
    JWTRefreshStrategy
  ],
  controllers: [],
  exports: [AuthService]
})
export class AuthModule {}
