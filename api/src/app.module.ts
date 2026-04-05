import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrganizationsModule } from './organizations/organizations.module';
import { Organization } from './organizations/models/organization.model';
import { DepartmentsModule } from './departments/departments.module';
import { Department } from './departments/models/department.model';
import { PositionsModule } from './positions/positions.module';
import { Position } from './positions/models/position.model';
import { envValidationSchema } from './config/env.validation';
import { MinioModule } from "./minio/minio.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [Organization, Department, Position],

        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: true,
      }),
    }),

      OrganizationsModule,
      DepartmentsModule,
      PositionsModule,
      MinioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
