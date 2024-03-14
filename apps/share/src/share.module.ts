import { Module } from '@nestjs/common';
import { ShareService } from './share.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShareController } from './share.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Share, ShareSchema } from 'libs/common/src';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/share/.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule.forRoot({
        envFilePath: './apps/share/.env',
      })],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(
      [
        {
          name: Share.name,
          schema: ShareSchema,
          collection: 'shares',
        },
      ],
    ),
    HttpModule
  ],
  providers: [ShareService],
  controllers: [ShareController],
})
export class ShareModule { }
