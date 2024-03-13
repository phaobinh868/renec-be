import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { RedisIoAdapter } from './adapters/redis-io-adapter';
import { Logger } from '@nestjs/common';
const corsOptionsDelegate = function (req, callback) {
  const corsOptions = { origin: true };
  callback(null, corsOptions);
};
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: corsOptionsDelegate,
  });
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  await app.listen(process.env.APP_PORT ?? 3001);
  Logger.log('App is listening at ' + (process.env.PORT || 3001));
}
bootstrap();
