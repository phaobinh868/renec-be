import { NestFactory } from '@nestjs/core';
import { ShareModule } from './share.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(ShareModule);
  const configService = app.get(ConfigService);
  await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [`${configService.get('RABBIT_MQ_URI')}`],
      queue: configService.get('RABBIT_MQ_QUEUE'),
      queueOptions: {
        durable: true,
      },
    },
  });
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3003);
  Logger.log(
    'Share microservice is listening at ' + (process.env.PORT || 3003),
  );
}
bootstrap();
