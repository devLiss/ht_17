import { getAppAndCleanDB } from './utils/test-utils';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
  });
  afterAll(async () => {
    await app.close();
  });
  const user = {
    login: 'somelogin',
    email: 'someEmail@blabla.com',
    password: 'fdsfew',
  };

  describe('Register user', () => {
    it('Should return an error if unaccepted login is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'fr',
          email: user.email,
          password: '123456',
        })
        .expect(400);
    });

    it('Should return an error if unaccepted email is provided, status 400 ', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'user1',
          email: 'user1user.com',
          password: '123456',
        })
        .expect(400);
    });

    it('Should return  status 204 and register user ', async () => {
      return request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: 'user1',
          email: 'user1@user.com',
          password: '123456',
        })
        .expect(204);
    });
  });

  describe('Login user', () => {
    it('Should return 200, accessToken and login user with login', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: user.login,
          password: user.password,
        })
        .expect(200);
    });

    it('Should return 200, accessToken and login user with email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: user.email,
          password: user.password,
        })
        .expect(200);
    });
  });
});
