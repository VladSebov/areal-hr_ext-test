import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from '../src/app.module';
import {UsersService} from "../src/users/users.service";

describe('Users (e2e)', () => {
    let app: INestApplication;
    let adminCookie: string[];

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.use(
            session({
                secret: process.env.SESSION_SECRET || 'test-secret',
                resave: false,
                saveUninitialized: false,
                cookie: { secure: false }
            }),
        );
        app.use(passport.initialize());
        app.use(passport.session());

        app.useGlobalPipes(new ValidationPipe());

        await app.init();

        const usersService = moduleFixture.get<UsersService>(UsersService);
        await usersService.onApplicationBootstrap();

        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                login: process.env.ADMIN_LOGIN || 'admin',
                password: process.env.ADMIN_PASSWORD || 'admin'
            });

        adminCookie = loginRes.get('Set-Cookie') as string[];

        if (!adminCookie) {
            throw new Error(`Login failed! Status: ${loginRes.status}, Body: ${JSON.stringify(loginRes.body)}`);
        }
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('/users (GET) - should return 401 without auth', () => {
        return request(app.getHttpServer())
            .get('/users')
            .expect(401);
    });

    it('/users (GET) - should return users list for admin', () => {
        return request(app.getHttpServer())
            .get('/users')
            .set('Cookie', adminCookie)
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
            });
    });

    it('/users (POST) - should create new user', async () => {
        const res = await request(app.getHttpServer())
            .post('/users')
            .set('Cookie', adminCookie)
            .send({
                lastName: 'Ivanov',
                firstName: 'Ivan',
                login: `e2e_${Date.now()}`,
                password: 'password123',
                roleId: 1,
                employeeId: 1
            });

        if (res.status !== 201) {
            console.log('DEBUG 400 ERROR:', JSON.stringify(res.body, null, 2));
        }

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.lastName).toBe('Ivanov');
    });

    it('/users (GET) - should filter users by search string', () => {
        return request(app.getHttpServer())
            .get('/users')
            .query({ search: 'E2E' })
            .set('Cookie', adminCookie)
            .expect(200)
            .expect((res) => {
                expect(res.body.length).toBeGreaterThan(0);
            });
    });
});