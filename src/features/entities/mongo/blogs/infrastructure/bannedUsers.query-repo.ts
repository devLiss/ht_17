import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  BlogBannedUsers,
  BlogBannedUsersDoc,
} from '../entities/blogBannedUsers.schema';
import { Model, Types } from 'mongoose';
import { BloggerUserQueryDto } from '../../../../api/bloggers/users/dto/bloggerUserQuery.dto';
import * as mongoose from 'mongoose';

@Injectable()
export class BannedUsersQueryRepo {
  constructor(
    @InjectModel(BlogBannedUsers.name)
    private bannedUsersModel: Model<BlogBannedUsersDoc>,
  ) {}

  async getAllByBlogId(id: string, query: BloggerUserQueryDto) {
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } =
      query;

    const items = await this.bannedUsersModel
      .find(
        { blogId: id, login: { $regex: searchNameTerm, $options: 'i' } },
        {
          blogId: 0,
          _id: 0,
        },
      )
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      //TODO: решить вопрос с типом sortDirection
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      .sort({ [sortBy]: sortDirection });

    const totalCount = await this.bannedUsersModel.count({
      blogId: id,
      login: { $regex: searchNameTerm, $options: 'i' },
    });

    const outputObj = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: items,
    };

    return outputObj;
  }

  async getByBlogIdAndUserId(blogId: string, userId: string) {
    return this.bannedUsersModel.findOne({
      blogId: blogId,
      id: userId,
    });
  }

  async createBannedUser(bannedUser) {
    return this.bannedUsersModel.create(bannedUser);
  }

  async deleteUser(blogId: string, userId: string) {
    return this.bannedUsersModel.deleteOne({
      blogId: new mongoose.Types.ObjectId(blogId),
      userId: userId,
    });
  }

  async deleteAll() {
    return this.bannedUsersModel.deleteMany({});
  }
}
