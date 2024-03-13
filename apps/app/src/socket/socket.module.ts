import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SocketGateway } from './socket.gateway';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    ConfigModule,
    JwtModule
  ],
  providers: [
    SocketGateway
  ],
  controllers: [],
  exports: [SocketGateway]
})
export class SocketModule {}
