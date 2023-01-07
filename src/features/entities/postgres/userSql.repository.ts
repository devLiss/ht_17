import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserQueryDto } from '../../api/super-admin/users/dto/userQuery.dto';
import { BanDto } from '../../api/super-admin/users/dto/ban.dto';

export class UserSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createUser(user: any) {
    const query = `insert into users ("login", "email", "passwordHash", "passwordSalt", "createdAt") values ($1, $2, $3, $4, $5) RETURNING id`;

    const createdUser = await this.dataSource.query(query, [
      user.login,
      user.email,
      user.passwordHash,
      user.passwordSalt,
      user.createdAt,
    ]);

    const emailConfirmQuery = `insert into "emailConfirmation" ("userId","confirmationCode", "expirationDate","isConfirmed") values ($1, $2, $3, $4)`;
    await this.dataSource.query(emailConfirmQuery, [
      createdUser[0].id,
      user.emailConfirmation.confirmationCode,
      user.emailConfirmation.expirationDate,
      user.emailConfirmation.isConfirmed,
    ]);

    return {
      id: createdUser[0].id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    };
  }
  async deleteUser(id: string) {
    const query = `delete from users where id = $1`;
    return this.dataSource.query(query, [id]);
  }
  async deleteAll() {
    await this.dataSource.query(`delete from "appBan"`);
    await this.dataSource.query(`delete from "emailConfirmation"`);
    await this.dataSource.query(`delete  from "recoveryData"`);
    return this.dataSource.query(`delete from users`);
  }
  async acceptConfirmation(id: string) {
    const query = `update "emailConfirmation" set "isConfirmed" = true where "userId" = $1`;
    return this.dataSource.query(query, [id]);
  }
  async updateConfirmationCode(userId: string, code: string) {
    const query = `update "emailConfirmation" set "confirmationCode" = '${code}' where "userId" = '${userId}'`;
    const confirmationCode = await this.dataSource.query(query);
    return confirmationCode.length ? confirmationCode[0] : null;
  }
  async createRecoveryData(
    userId: string,
    recoveryData: {
      recoveryCode: string;
      expirationDate: Date;
      isConfirmed: boolean;
    },
  ) {
    const query = `update "recoveryData" set "recoveryCode" = $1 and "expirationDate" = $2 and "isConfirmed" = $3 where "userId" = $4`;
    await this.dataSource.query(query, [
      recoveryData.recoveryCode,
      recoveryData.expirationDate,
      recoveryData.isConfirmed,
      userId,
    ]);

    const data = await this.dataSource.query(
      `select * from "recoveryData" where "userId" = $1`,
      [userId],
    );
    return data.length ? data[0] : null;
  }
  async confirmPassword(
    userId: string,
    passwordData: { passwordSalt: string; passwordHash: string },
  ) {
    const updateUserQuery = `update users set "passwordHash" = $1 and "passwordSalt" = $2 where "userId" = $3`;
    await this.dataSource.query(updateUserQuery, [
      passwordData.passwordHash,
      passwordData.passwordSalt,
      userId,
    ]);
    const updateRecoveryQuery = `update "recoveryData" set "isConfirmed" = true where "userId" = $1`;
    await this.dataSource.query(updateRecoveryQuery, [userId]);
  }
  async banUser(userId: string, banDto: BanDto) {
    const user = await this.dataSource.query(
      `select * from users where id = $1`,
      [userId],
    );
    if (!user.length) return false;

    let banDate = null;
    let banReason = null;
    let query = ``;
    const isBanned = banDto.isBanned;
    if (!banDto.isBanned) {
      query = `delete from "appBan" where "userId" = $1`;
      await this.dataSource.query(query, [userId]);
    } else {
      banReason = banDto.banReason;
      banDate = new Date();
      query = `insert into "appBan" ("userId", "banDate", "banReason", "isBanned") values($1, $2, $3, true)`;
      await this.dataSource.query(query, [userId, banDate, banReason]);
    }

    return true;
  }

  /*QUERY METHODS*/

  async getUserByLoginOrEmail(loginOrEmail: string) {
    console.log('getUserByLoginOrEmail');
    console.log(loginOrEmail);
    const searchTerm = `'%${loginOrEmail}%'`;
    const query = `select u.*, ab."isBanned" from users u left join "appBan" ab on u.id = ab."userId" where u.login = '${loginOrEmail}' or u.email = '${loginOrEmail}'`;
    console.log(query);

    const user = await this.dataSource.query(query);
    console.log(user);
    return user.length ? user[0] : null;
  }

  async getUserByEmail(email: string) {
    const query = `select * from users where email = $1`;
    const user = await this.dataSource.query(query, [email]);
    return user.length ? user[0] : null;
  }

  async getConfirmInfoByUserEmail(email: string) {
    const query = `select * from users u join "emailConfirmation" ec on u.id = ec."userId" where u.email = '${email}'`;
    const user = await this.dataSource.query(query);
    return user.length ? user[0] : null;
  }

  async getUserById(id: string) {
    console.log('id', id);
    const user = await this.dataSource.query(
      `select * from users where id = '${id}'`,
    );
    return user.length ? user[0] : null;
  }

  async getUserByRecoveryCode(code: string) {
    const query = `select * from "recoveryData" where "recoveryCode" = $1`;
    const recoveryData = await this.dataSource.query(query, [code]);
    return recoveryData.length ? recoveryData[0] : null;
  }

  async getUserByEmailConfirmationCode(code: string) {
    const query = `select * from "emailConfirmation" where "confirmationCode" = '${code}'`;
    const emailConfirmData = await this.dataSource.query(query);
    console.log(query);
    console.log(emailConfirmData);
    return emailConfirmData.length ? emailConfirmData[0] : null;
  }

  async getEmailConfirmation() {
    return this.dataSource.query(`select * from "emailConfirmation"`);
  }

  async getAllUsers(userQuery: UserQueryDto) {
    let subquery = ``;
    console.log('GET ALL USERS');
    console.log(userQuery.banStatus);
    switch (userQuery.banStatus) {
      case 'banned':
        subquery = 'and ab."isBanned"';
        break;
      case 'notBanned':
        subquery = 'and ab."isBanned" is null ';
        break;
    }

    const offset = (userQuery.pageNumber - 1) * userQuery.pageSize;

    const orderBy =
      userQuery.sortBy != 'createdAt'
        ? `"${userQuery.sortBy}" COLLATE "C"`
        : `u."${userQuery.sortBy}"`;
    const query = `select u.id, u.login, u.email, u."createdAt", ab."isBanned" , ab."banDate" , ab."banReason"  
    from users u left join "appBan" ab on u.id = ab."userId" 
    where (u.login ilike '%${userQuery.searchLoginTerm}%' or  u.email ilike '%${userQuery.searchEmailTerm}%') ${subquery} 
    order by  ${orderBy} ${userQuery.sortDirection} limit $1 offset $2 `;
    console.log(query);
    const users = await this.dataSource.query(query, [
      userQuery.pageSize,
      offset,
    ]);

    const totalQuery = `select count(*) from users u left join "appBan" ab on u.id = ab."userId" where ( u.login ilike '%${userQuery.searchLoginTerm}%' or  u.email ilike '%${userQuery.searchEmailTerm}%') ${subquery}`;
    const totalCount = await this.dataSource.query(totalQuery);

    console.log(users);

    const temp = users.map((item) => {
      const t = {
        id: item.id,
        login: item.login,
        email: item.email,
        createdAt: item.createdAt,
        banInfo: {
          isBanned: !!item.isBanned,
          banDate: item.banDate,
          banReason: item.banReason,
        },
      };
      console.log(t);
      return t;
    });

    console.log(temp);
    return {
      pagesCount: Math.ceil(+totalCount[0].count / userQuery.pageSize),
      page: userQuery.pageNumber,
      pageSize: userQuery.pageSize,
      totalCount: +totalCount[0].count,
      items: temp,
    };
  }
}
