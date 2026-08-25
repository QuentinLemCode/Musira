import fastifyCookie from '@fastify/cookie';
import { LoggerService, LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { env } from 'process';
import { buildCorsOptions } from './app/utils/cors';
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
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Musira API')
    .setDescription('OpenAPI specification for all Musira backend routes')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addServer('/')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('docs', app, document);
  // Also expose raw JSON
  app
    .getHttpAdapter()
    .getInstance()
    .get('/openapi.json', (_req: any, reply: any) => {
      reply.send(document);
    });
  // Enable CORS for configured origins (comma-separated ORIGIN adds to the
  // defaults). Methods must be explicit: @fastify/cors' default
  // GET,HEAD,POST breaks preflights for DELETE/PUT endpoints.
  app.enableCors(buildCorsOptions(env));

  // const fastifyInstance = app.getHttpAdapter().getInstance();
  // fastifyInstance
  //   .decorateReply('setHeader', function (name: string, value: unknown) {
  //     this.header(name, value);
  //   })
  //   .decorateReply('end', function () {
  //     this.send('');
  //   });

  if (!env.COOKIE_SECRET) {
    throw new Error(
      'COOKIE_SECRET environment variable is required. Refusing to start with an insecure default.',
    );
  }

  await app.register(fastifyCookie, {
    secret: env.COOKIE_SECRET,
  });
  await app.listen(env.PORT || 3020, '0.0.0.0');
}
bootstrap();
