import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiModule } from '../../src/api.module';
import { CoreModule } from '@app/core';
import { DatabaseAdapter } from '@app/core/database/database.adapter';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let databaseAdapter: DatabaseAdapter;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule, CoreModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    databaseAdapter = app.get(DatabaseAdapter);
  });

  beforeEach(async () => {
    await databaseAdapter.executeRaw({
      query: `TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;`,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/register (POST)', () => {
    it('should set access token in header and refresh token in HttpOnly cookie after successful registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/user/register')
        .send({
          email: 'example@naver.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201);

      // check access token in header
      expect(response.headers).toHaveProperty('authorization');
      expect(response.headers.authorization).toMatch(/^Bearer /);

      // check refresh token in HttpOnly cookie
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/^refreshToken=/);
      expect(response.headers['set-cookie'][0]).toMatch(/HttpOnly/);
      expect(response.headers['set-cookie'][0]).toMatch(/Secure/);
      expect(response.headers['set-cookie'][0]).toMatch(/SameSite=Strict/);
    });
  });

  describe('/login (POST)', () => {
    it('should set access token in header and refresh token in HttpOnly cookie after successful login', async () => {
      // First, register a user
      const response = await request(app.getHttpServer())
        .post('/api/v1/user/register')
        .send({
          email: 'example@naver.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201);

      // check body
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.accessToken).toHaveProperty('value');
      expect(response.body.accessToken).toHaveProperty('expiresIn');

      // check access token in header
      expect(response.headers).toHaveProperty('authorization');
      expect(response.headers.authorization).toMatch(/^Bearer /);

      // check refresh token in HttpOnly cookie
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/^refreshToken=/);
      expect(response.headers['set-cookie'][0]).toMatch(/HttpOnly/);
      expect(response.headers['set-cookie'][0]).toMatch(/Secure/);
      expect(response.headers['set-cookie'][0]).toMatch(/SameSite=Strict/);
    });
  });
});
