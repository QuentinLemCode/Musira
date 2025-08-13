import fastifyCookie from '@fastify/cookie';
import type { LoggerService, LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { env } from 'process';
import { AppModule } from './app/app.module';

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
  const config = new DocumentBuilder()
    .setTitle('Musira API')
    .setDescription('OpenAPI specification for all Musira backend routes')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addServer('/api')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api/docs', app, document);
  // Also expose raw JSON
  app
    .getHttpAdapter()
    .getInstance()
    .get('/api/openapi.json', (_req: any, reply: any) => {
      reply.send(document);
    });
  if (env.ORIGIN) {
    app.enableCors({
      origin: env.ORIGIN,
    });
  }

  // const fastifyInstance = app.getHttpAdapter().getInstance();
  // fastifyInstance
  //   .decorateReply('setHeader', function (name: string, value: unknown) {
  //     this.header(name, value);
  //   })
  //   .decorateReply('end', function () {
  //     this.send('');
  //   });

  await app.register(fastifyCookie, {
    secret: env.COOKIE_SECRET || 'defaultSecret',
  });
  await app.listen(env.PORT || 3020, '0.0.0.0');
}
bootstrap();
