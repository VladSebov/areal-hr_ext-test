import { Module, Global } from '@nestjs/common';
import { MinioService } from './minio.service';

@Global() // Делаем модуль доступным везде без повторного импорта
@Module({
    providers: [MinioService],
    exports: [MinioService],
})
export class MinioModule {}