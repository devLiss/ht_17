import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../entities/user.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { UserQueryDto } from '../../../../api/super-admin/users/dto/userQuery.dto';
import * as mongoose from 'mongoose';

@Injectable()
export class UserQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByLoginOrEmail(loginOrEmail: string): Promise<any> {
    const user = await this.userModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
    return user;
  }

  async findByLogin(login: string) {
    const user = await this.userModel.findOne(
      {
        login: login,
      } /*{$or:[{"email":loginOrEmail},{"userName":loginOrEmail}]}*/,
    );
    return user;
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    console.log('Repo');
    console.log(user);
    return user;
  }

  async getUsers(uqDto: UserQueryDto) {
    const {
      banStatus,
      searchLoginTerm,
      searchEmailTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    } = uqDto;

    const query = {
      $or: [
        { login: { $regex: searchLoginTerm, $options: 'i' } },
        { email: { $regex: searchEmailTerm, $options: 'i' } },
      ],
    };
    console.log(banStatus);
    switch (banStatus) {
      case 'banned':
        query['banInfo.isBanned'] = true;
        break;
      case 'notBanned':
        query['banInfo.isBanned'] = false;
        break;
    }

    console.log(query);
    const users = await this.userModel
      .find(query, {
        passwordHash: 0,
        passwordSalt: 0,
        emailConfirmation: 0,
        recoveryData: 0,
      })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      //TODO:Поменять тип для sortDirection
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .sort({ [sortBy]: sortDirection });

    const temp = users.map((user) => {
      return user.toJSON();
    });

    const totalCount = await this.userModel.count(query);

    const outputObj = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: temp,
    };
    return outputObj;
  }

  async getByEmail(email: string) {
    const user = await this.userModel.findOne({ email: email });
    return user;
  }

  async getUserByCode(code: string): Promise<any> {
    const user = await this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
    return user;
  }

  async getUserByRecoveryCode(code: string): Promise<any> {
    const user = await this.userModel.findOne({
      'recoveryData.recoveryCode': code,
    });
    return user;
  }
}
