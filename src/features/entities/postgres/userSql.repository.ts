import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserQueryDto } from '../../api/super-admin/users/dto/userQuery.dto';

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
      login: createdUser[0].login,
      email: createdUser[0].email,
      createdAt: createdUser[0].createdAt,
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    };
  }
  async deleteUser(id: string) {
    const query = `delete from users where id = $1`;
    return this.dataSource.query(query, [+id]);
  }
  async deleteAll() {
    return this.dataSource.query(`delete from users`);
  }
  async acceptConfirmation() {}
  async updateConfirmationCode() {}
  async createRecoveryData() {}
  async confirmPassword() {}
  async banUser() {}

  /*QUERY METHODS*/

  async getUserByLoginOrEmail(loginOrEmail: string) {
    const query = `select * from users where login ilike '%$1%' or email ilike '%$1%'`;
    return this.dataSource.query(query, [loginOrEmail]);
  }

  async getUserById(id: string) {
    return this.dataSource.query(`select * from users where id = $1`, [+id]);
  }

  async getUserByRecoveryCode(code: string) {
    const query = `select * from "recoveryData" where "recoveryCode" = '$1'`;
    return this.dataSource.query(query, [code]);
  }

  async getUserByEmailConfirmationCode(code: string) {
    const query = `select * from "emailConfirmation" where "confirmationCode" = '$1'`;
    return this.dataSource.query(`query`, [code]);
  }

  async getAllUsers(userQuery: UserQueryDto) {
    let subquery = ``;
    switch (userQuery.banStatus) {
      case 'banned':
        subquery = 'and ab."isBanned"';
        break;
      case 'notBanned':
        subquery = 'and ab."isBanned" is null ';
        break;
    }

    console.log(userQuery);
    const offset = (userQuery.pageNumber - 1) * userQuery.pageSize;
    const orderBySubquery = `"${userQuery.sortBy}" ${userQuery.sortDirection}`;

    const query = `select u.id, u.login, u.email, u."createdAt", ab."isBanned" , ab."banDate" , ab."banReason"  
    from users u left join "appBan" ab on u.id = ab."userId" 
    where u.login ilike '%$1%' and  u.email ilike '%$2%' ${subquery} 
    order by $3 limit $4 offset $5`;

    const users = await this.dataSource.query(query, [
      userQuery.searchLoginTerm,
      userQuery.searchEmailTerm,
      orderBySubquery,
      userQuery.pageSize,
      offset,
    ]);
    console.log(query);

    const totalQuery = `select count(*) from users u left join "appBan" ab on u.id = ab."userId" ${subquery}`;
    const totalCount = await this.dataSource.query(totalQuery);

    console.log(users);
    const temp = users.map((item) => {
      return {
        id: item.id,
        login: item.login,
        email: item.email,
        banInfo: {
          isBanned: item.isBanned ? true : false,
          banDate: item.banDate,
          banReason: item.banReason,
        },
      };
    });
    return {
      pagesCount: Math.ceil(totalCount[0].count / userQuery.pageNumber),
      page: userQuery.pageNumber,
      pageSize: userQuery.pageSize,
      totalCount: +totalCount[0].count,
      items: temp,
    };
  }
}
