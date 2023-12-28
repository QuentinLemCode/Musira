import type { LoggerService, LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { env } from 'process';
import { AppModule } from './app/app.module';
import fastifyCookie from '@fastify/cookie';

const getLogger = (): LogLevel[] | LoggerService => {
  if (process.env.NODE_ENV === 'production') {
    return ['error', 'warn', 'log'];
  }
  return console;
};

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
    { logger: getLogger() },
  );
  app.setGlobalPrefix('api');
  if (env.ORIGIN) {
    app.enableCors({
      origin: env.ORIGIN,
    });
  }

  const fastifyInstance = app.getHttpAdapter().getInstance();
  fastifyInstance
    .decorateReply('setHeader', function (name: string, value: unknown) {
      this.header(name, value);
    })
    .decorateReply('end', function () {
      this.send('');
    });

  await app.register(fastifyCookie, {
    secret: env.COOKIE_SECRET || 'defaultSecret',
  });
  await app.listen(env.PORT || 3000, '0.0.0.0');
}
bootstrap();
