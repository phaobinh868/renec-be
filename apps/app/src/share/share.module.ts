import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RmqModule } from '@app/common';
import { ShareService } from './share.service';
import { ShareResolver } from './share.resolver';
import { AuthModule } from '../auth/auth.module';
import { SocketModule } from '../socket/socket.module';
@Module({
  imports: [
    ConfigModule,
    RmqModule.register({
      name: 'SHARE',
    }),
    AuthModule,
    SocketModule
  ],
  providers: [ShareService, ShareResolver],
  controllers: [],
})
export class ShareModule {}
