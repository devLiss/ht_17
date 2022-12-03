import request from 'supertest';
import { getAppAndCleanDB } from '../src/test/utils/test-utils';
import { INestApplication } from '@nestjs/common';

describe('Users', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
    await app.init();
    console.log('app start');
  });

  describe('createUser by Sa', () => {
    it('should return createdUser', async () => {
      console.log(app);
      return request(
        app
          .getHttpServer()
          .post('/sa/users')
          .send({
            login: 'liseyna1',
            email: 'liseyna1@gmail.com',
            password: 'liseyna1',
          })
          .expect(201),
      );
    });
  });
});
