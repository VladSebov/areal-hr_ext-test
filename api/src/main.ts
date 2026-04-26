import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.use(
    session({
      secret: configService.get<string>('SESSION_SECRET') || 'default-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

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