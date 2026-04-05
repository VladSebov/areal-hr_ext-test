import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
    private readonly logger = new Logger(MinioService.name);
    private minioClient: Minio.Client;

    constructor(private configService: ConfigService) {
        const endPoint = this.configService.get<string>('MINIO_ENDPOINT');
        const accessKey = this.configService.get<string>('MINIO_ROOT_USER');
        const secretKey = this.configService.get<string>('MINIO_ROOT_PASSWORD');

        if (!endPoint || !accessKey || !secretKey) {
            throw new Error('MinIO configuration is missing in environment variables');
        }

        this.minioClient = new Minio.Client({
            endPoint,
            port: this.configService.get<number>('MINIO_PORT') || 9000,
            useSSL: false,
            accessKey,
            secretKey,
        });
    }

    async onModuleInit() {
        const bucketName = this.configService.get<string>('MINIO_BUCKET');

        if (!bucketName) {
            this.logger.error('Configuration error: MINIO_BUCKET is not defined');
            throw new Error('MINIO_BUCKET environment variable is missing');
        }

        try {
            const exists = await this.minioClient.bucketExists(bucketName);

            if (!exists) {
                await this.minioClient.makeBucket(bucketName, 'us-east-1');
                this.logger.log(`Bucket "${bucketName}" created successfully.`);
            } else {
                this.logger.log(`Bucket "${bucketName}" already exists.`);
            }
        } catch (error) {
            this.logger.error(`Failed to connect to MinIO or check bucket: ${error.message}`);
            throw error;
        }
    }

    async uploadFile(fileName: string, file: Buffer, mimeType: string): Promise<string> {
        const bucketName = this.configService.get<string>('MINIO_BUCKET');

        if (!bucketName) {
            this.logger.error('MINIO_BUCKET is not defined in configuration');
            throw new Error('Internal Server Error: Storage configuration incomplete');
        }

        try {
            await this.minioClient.putObject(
                bucketName,
                fileName,
                file,
                file.length,
                { 'Content-Type': mimeType }
            );
            return fileName;
        } catch (error) {
            this.logger.error(`Error uploading file to MinIO: ${error.message}`);
            throw error;
        }
    }

    async getFileUrl(fileName: string): Promise<string> {
        const bucketName = this.configService.get<string>('MINIO_BUCKET');
        if (!bucketName) {
            this.logger.error('MINIO_BUCKET is not defined in configuration');
            throw new Error('Internal Server Error: Storage configuration incomplete');
        }
        try {
            return await this.minioClient.presignedUrl('GET', bucketName, fileName, 24 * 60 * 60);
        } catch (error) {
            this.logger.error(`Error generating presigned URL: ${error.message}`);
            throw error;
        }
    }
}