import { Blog, BlogDocument } from '../entities/blogs.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';

@Injectable()
export class BlogsRepo {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
  async createBlog(blog: any) {
    const createdBlog = await this.blogModel.create(blog);
    await createdBlog.save();

    return createdBlog;
  }

  async deleteBlog(id: string) {
    const dbId = new mongoose.Types.ObjectId(id);
    const result = await this.blogModel.findByIdAndDelete(dbId);
    return result;
  }

  async banBlog(id: string, isBanned: boolean) {
    const blog = await this.blogModel.findById(id);
    if (!blog) {
      return false;
    }

    blog.banInfo.isBanned = isBanned;
    if (!isBanned) {
      blog.banInfo.banDate = null;
    } else {
      blog.banInfo.banDate = new Date();
    }

    blog.save();
    return true;
  }

  async updateBlog(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    const blog = await this.blogModel.findById(id);
    if (!blog) {
      return false;
    }

    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    blog.save();

    return true;
  }

  async deleteAll(): Promise<boolean> {
    const result = await this.blogModel.deleteMany({});
    return result.deletedCount === 1;
  }
}
