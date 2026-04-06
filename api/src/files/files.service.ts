import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './models/file.model';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class FilesService {
  constructor(
      @InjectRepository(File)
      private readonly repo: Repository<File>,
      private readonly minioService: MinioService,
  ) {}

  async upload(file: Express.Multer.File): Promise<File> {
    const objectKey = `${Date.now()}-${file.originalname}`;

    await this.minioService.uploadFile(
        objectKey,
        file.buffer,
        file.mimetype
    );

    const fileEntry = this.repo.create({
      bucketName: process.env.MINIO_BUCKET || 'arealtz-uploads',
      objectKey: objectKey,
      name: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    });

    return await this.repo.save(fileEntry);
  }

  async findAll(): Promise<File[]> {
    return await this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<File> {
    const file = await this.repo.findOne({ where: { id } });
    if (!file) throw new NotFoundException(`File with ID ${id} not found`);
    return file;
  }

  async getPresignedUrl(id: number): Promise<string> {
    const file = await this.findOne(id);
    return await this.minioService.getFileUrl(file.objectKey);
  }

  async remove(id: number) {
    const file = await this.findOne(id);
    const result = await this.repo.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return { message: `File #${id} successfully soft-deleted` };
  }
}