import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function generateOpenApi() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Musira API')
    .setDescription('OpenAPI specification for all Musira backend routes')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  const outputPath = join(process.cwd(), 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(document, null, 2), {
    encoding: 'utf-8',
  });

  await app.close();
  // eslint-disable-next-line no-console
  console.log(`OpenAPI spec written to ${outputPath}`);
}

generateOpenApi().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
