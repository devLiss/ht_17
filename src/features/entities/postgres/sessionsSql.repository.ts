import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
1;
export class SessionsSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createSession(session: any) {
    const { ip, title, lastActiveDate, expiredDate, userId, deviceId } =
      session;
    const query = `insert into sessions ("userId", "ip", "title","lastActiveDate", "deviceId","expiredDate") values ($1, $2, $3, $4, $5, $6) `;
    return this.dataSource.query(query, [
      userId,
      ip,
      title,
      lastActiveDate,
      deviceId,
      expiredDate,
    ]);
  }

  async deleteAll() {
    const query = `delete from sessions`;
    return this.dataSource.query(query);
  }
  async updateSession(
    userId: string,
    deviceId: string,
    expiredDate: Date,
    issuedAt: Date,
  ) {
    const query = `update sessions  set ("expiredDate", "lastActiveDate") = ($1, $2) where "userId" = '${userId}' and "deviceId" = '${deviceId}'`;
    return this.dataSource.query(query, [expiredDate, issuedAt]);
  }

  async removeSessionByDeviceId(userId: string, deviceId: string) {
    const query = `delete from sessions where "userId" = '${userId}' and "deviceId" = '${deviceId}'`;
    console.log(query);
    return this.dataSource.query(query /*[userId, deviceId]*/);
  }
  async removeSessionsWithoutCurrent(userId: string, deviceId: string) {
    const query = `delete from sessions where "userId" = '${userId}' and "deviceId" != '${deviceId}'`;
    return this.dataSource.query(query);
  }
  async removeAllSessionsByUserId(userId: string) {
    const query = `delete from sessions where "userId" = '${userId}'`;
    return this.dataSource.query(query);
  }

  async getSessionsByUserId(userId: string) {
    const query = `select * from sessions where "userId" = '${userId}'`;
    return this.dataSource.query(query);
  }
  async getSessionByDeviceId(deviceId: string) {
    const query = `select * from sessions where "deviceId" = '${deviceId}'`;
    const session = await this.dataSource.query(query);
    return session.length ? session[0] : null;
  }
  async getSessionByUserDeviceDate(
    userId: string,
    deviceId: string,
    issuedAt: Date,
  ) {
    console.log(issuedAt);
    const query = `select * from sessions where "userId" = '${userId}' and "deviceId" = '${deviceId}' and "lastActiveDate" = '${issuedAt.toISOString()}'`;
    console.log(query);
    const session = await this.dataSource.query(
      query /*, [
      userId,
      deviceId,
      issuedAt,
    ]*/,
    );
    return session.length ? session[0] : null;
  }
}
