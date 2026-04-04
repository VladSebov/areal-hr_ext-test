import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('NEST_API_PORT') || 3000;
  const vueAppPort = configService.get<number>('VUE_APP_PORT') || 9000;

  app.enableCors({
    origin: `http://localhost:${vueAppPort}`,
    credentials: true,
  });

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();