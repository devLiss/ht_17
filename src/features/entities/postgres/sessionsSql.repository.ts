import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
1;
export class SessionsSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createSession(session: any) {
    const { ip, title, lastActiveDate, expiredDate, userId, deviceId } =
      session;
    const query = `insert into sessions ("userId", "ip", "title","lastActiveDate", "deviceId","expiredDate") values () `;
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
    const query = `update sessions  set ("expiredDate", "lastActiveDate") = ($1, $2) where userId = $3 and deviceId = '$4'`;
    return this.dataSource.query(query, [
      expiredDate,
      issuedAt,
      userId,
      deviceId,
    ]);
  }

  async removeSessionByDeviceId(userId: string, deviceId: string) {
    const query = `delete from sessions where userId = $1 deviceId = '$2'`;
    return this.dataSource.query(query, [userId, deviceId]);
  }
  async removeSessionsWithoutCurrent(userId: string, deviceId: string) {
    const query = `delete from sessions where userId = $1 and deviceId != '$2'`;
    return this.dataSource.query(query, [+userId, deviceId]);
  }
  async removeAllSessionsByUserId(userId: string) {
    const query = `delete from sessions where userId = $1`;
    return this.dataSource.query(query, [+userId]);
  }

  async getSessionsByUserId(userId: string) {
    const query = `select * from sessions where userId = $1`;
    return this.dataSource.query(query, [+userId]);
  }
  async getSessionByDeviceId(deviceId: string) {
    const query = `select * from sessions where deviceId = '$1'`;
    return await this.dataSource.query(query, [deviceId])[0];
  }
  async getSessionByUserDeviceDate(
    userId: string,
    deviceId: string,
    issuedAt: Date,
  ) {
    const query = `select * sessions where userId = $1 and deviceId = '$2' and lastActiveDate = $3`;
    return await this.dataSource.query(query, [userId, deviceId, issuedAt])[0];
  }
}
