import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),

    NEST_API_PORT: Joi.number().default(3000),
    VUE_APP_PORT: Joi.number().required(),

    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),

    MINIO_ROOT_USER: Joi.string().required(),
    MINIO_ROOT_PASSWORD: Joi.string().required(),
    MINIO_ENDPOINT: Joi.string().required(),
    MINIO_PORT: Joi.number().default(9000),
    MINIO_BUCKET: Joi.string().required(),
});