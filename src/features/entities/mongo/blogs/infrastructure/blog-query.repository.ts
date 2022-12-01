import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../entities/blogs.schema';
import { Model, Schema } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { BlogQueryDto } from '../../../../api/public/blogs/dto/blogQuery.dto';
import * as mongoose from 'mongoose';

@Injectable()
export class BlogQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
  async findAllBlogs(bqDto: BlogQueryDto): Promise<{
    pagesCount: number;
    pageSize: number;
    page: number;
    totalCount: number;
    items: any[];
  }> {
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } =
      bqDto;
    console.log('searchNameTerm ' + bqDto.searchNameTerm);

    const blogs = await this.blogModel
      .find(
        {
          name: { $regex: searchNameTerm, $options: 'i' },
        },
        {},
      )
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const totalCount = await this.blogModel.count({
      name: { $regex: searchNameTerm, $options: 'i' },
    });

    const outputObj = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs,
    };
    return outputObj;
  }

  async findAllBlogsPublic(bqDto: BlogQueryDto): Promise<{
    pagesCount: number;
    pageSize: number;
    page: number;
    totalCount: number;
    items: any[];
  }> {
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } =
      bqDto;

    const blogs = await this.blogModel
      .find(
        {
          name: { $regex: searchNameTerm, $options: 'i' },
          'banInfo.isBanned': false,
        },
        { blogOwnerInfo: 0, banInfo: 0 },
      )
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const totalCount = await this.blogModel.count({
      name: { $regex: searchNameTerm, $options: 'i' },
      'banInfo.isBanned': false,
    });

    const outputObj = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs,
    };
    return outputObj;
  }

  async findBlogById(id: string): Promise<any> {
    console.log(id);
    const blogId = new mongoose.Types.ObjectId(id);
    const blog = await this.blogModel.findOne({ _id: blogId });
    return blog;
  }

  async findAllBlogsForUser(
    bqDto: BlogQueryDto,
    userId: string,
  ): Promise<{
    pagesCount: number;
    pageSize: number;
    page: number;
    totalCount: number;
    items: any[];
  }> {
    const { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } =
      bqDto;
    console.log('searchNameTerm ' + bqDto.searchNameTerm);

    const blogs = await this.blogModel
      .find(
        {
          name: { $regex: searchNameTerm, $options: 'i' },
          'blogOwnerInfo.userId': userId,
        },
        { blogOwnerInfo: 0 },
      )
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const totalCount = await this.blogModel.count({
      name: { $regex: searchNameTerm, $options: 'i' },
      'blogOwnerInfo.userId': userId,
    });

    const outputObj = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs,
    };
    return outputObj;
  }
}
