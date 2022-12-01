import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../entities/posts.schema';
import { Model, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { BlogQueryDto } from '../../../../api/public/blogs/dto/blogQuery.dto';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async findAllPosts(
    userId: mongoose.Types.ObjectId | null,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: any,
  ) {
    console.log(userId);
    const posts = await this.postModel
      .aggregate([
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'postId',
            pipeline: [
              {
                $match: {
                  status: 'Like',
                  isBanned: false,
                },
              },
              {
                $count: 'count',
              },
            ],
            as: 'likesCount',
          },
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'postId',
            pipeline: [
              {
                $match: {
                  status: 'Dislike',
                  isBanned: false,
                },
              },
              {
                $count: 'count',
              },
            ],
            as: 'dislikesCount',
          },
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'postId',
            pipeline: [
              {
                $match: { userId: new mongoose.Types.ObjectId(userId) },
              },
              {
                $project: { _id: 0, status: 1 },
              },
            ],
            as: 'myStatus',
          },
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'postId',
            pipeline: [
              {
                $match: {
                  status: 'Like',
                  isBanned: false,
                },
              },
              {
                $sort: {
                  addedAt: -1,
                },
              },
              {
                $limit: 3,
              },
              {
                $project: {
                  addedAt: 1,
                  login: 1,
                  userId: 1,
                  _id: 0,
                },
              },
            ],
            as: 'newestLikes',
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            title: 1,
            shortDescription: 1,
            content: 1,
            blogId: 1,
            blogName: 1,
            createdAt: 1,
            'extendedLikesInfo.likesCount': '$likesCount',
            'extendedLikesInfo.dislikesCount': '$dislikesCount',
            'extendedLikesInfo.myStatus': '$myStatus',
            'extendedLikesInfo.newestLikes': '$newestLikes',
          },
        },
      ])
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const totalCount = await this.postModel.countDocuments();

    const temp = posts.map((post) => {
      const likesCountArr = post.extendedLikesInfo.likesCount;
      const dislikesCountArr = post.extendedLikesInfo.dislikesCount;
      const myStatusArr = post.extendedLikesInfo.myStatus;
      console.log(post.extendedLikesInfo);

      const extendedLikesInfo = {
        likesCount: likesCountArr.length ? likesCountArr[0].count : 0,
        dislikesCount: dislikesCountArr.length ? dislikesCountArr[0].count : 0,
        myStatus: myStatusArr.length ? myStatusArr[0].status : 'None',
        newestLikes: post.extendedLikesInfo.newestLikes,
      };
      post.extendedLikesInfo = extendedLikesInfo;
      return post;
    });

    console.log(pageSize);
    const outputObj = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: temp,
    };
    return outputObj;
  }

  async getPostById(id: string) {
    const post = await this.postModel.findById(id);
    return post;
  }
  async findPostById(id: string | null, currentUserId: any) {
    if (!id) {
      return null;
    }

    console.log(currentUserId);
    const post = await this.postModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          pipeline: [
            {
              $match: {
                status: 'Like',
                isBanned: false,
              },
            },
            {
              $count: 'count',
            },
          ],
          as: 'likesCount',
        },
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          pipeline: [
            {
              $match: {
                status: 'Dislike',
                isBanned: false,
              },
            },
            {
              $count: 'count',
            },
          ],
          as: 'dislikesCount',
        },
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          pipeline: [
            {
              $match: { userId: new mongoose.Types.ObjectId(currentUserId) },
            },
            {
              $project: { _id: 0, status: 1 },
            },
          ],
          as: 'myStatus',
        },
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'postId',
          pipeline: [
            {
              $match: {
                status: 'Like',
                isBanned: false,
              },
            },
            {
              $sort: {
                addedAt: -1,
              },
            },
            {
              $limit: 3,
            },
            {
              $project: {
                addedAt: 1,
                login: 1,
                userId: 1,
                _id: 0,
              },
            },
          ],
          as: 'newestLikes',
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          title: 1,
          shortDescription: 1,
          content: 1,
          blogId: 1,
          blogName: 1,
          createdAt: 1,
          'extendedLikesInfo.likesCount': '$likesCount',
          'extendedLikesInfo.dislikesCount': '$dislikesCount',
          'extendedLikesInfo.myStatus': '$myStatus',
          'extendedLikesInfo.newestLikes': '$newestLikes',
        },
      },
    ]);

    console.log(post);
    const temp = post.map((p) => {
      const likesCountArr = p.extendedLikesInfo.likesCount;
      const dislikesCountArr = p.extendedLikesInfo.dislikesCount;
      const myStatusArr = p.extendedLikesInfo.myStatus;

      const extendedLikesInfo = {
        likesCount: likesCountArr.length ? likesCountArr[0].count : 0,
        dislikesCount: dislikesCountArr.length ? dislikesCountArr[0].count : 0,
        myStatus: myStatusArr.length ? myStatusArr[0].status : 'None',
        newestLikes: p.extendedLikesInfo.newestLikes,
      };
      p.extendedLikesInfo = extendedLikesInfo;
      return p;
    });

    return temp[0];
  }

  async getPostsByBlogId(
    blogId: string,
    bqDto: BlogQueryDto,
    currentId: mongoose.Types.ObjectId,
  ) {
    console.log(blogId);
    const { pageNumber, pageSize, sortBy, sortDirection } = bqDto;

    const posts = await this.postModel
      .aggregate([
        { $match: { blogId: blogId } },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'postId',
            pipeline: [
              {
                $match: {
                  status: 'Like',
                  isBanned: false,
                },
              },
              {
                $count: 'count',
              },
            ],
            as: 'likesCount',
          },
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'postId',
            pipeline: [
              {
                $match: {
                  status: 'Dislike',
                  isBanned: false,
                },
              },
              {
                $count: 'count',
              },
            ],
            as: 'dislikesCount',
          },
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'postId',
            pipeline: [
              {
                $match: { userId: new mongoose.Types.ObjectId(currentId) },
              },
              {
                $project: { _id: 0, status: 1 },
              },
            ],
            as: 'myStatus',
          },
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'postId',
            pipeline: [
              {
                $match: {
                  status: 'Like',
                  isBanned: false,
                },
              },
              {
                $sort: {
                  addedAt: -1,
                },
              },
              {
                $limit: 3,
              },
              {
                $project: {
                  addedAt: 1,
                  login: 1,
                  userId: 1,
                  _id: 0,
                },
              },
            ],
            as: 'newestLikes',
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            title: 1,
            shortDescription: 1,
            content: 1,
            blogId: 1,
            blogName: 1,
            createdAt: 1,
            'extendedLikesInfo.likesCount': '$likesCount',
            'extendedLikesInfo.dislikesCount': '$dislikesCount',
            'extendedLikesInfo.myStatus': '$myStatus',
            'extendedLikesInfo.newestLikes': '$newestLikes',
          },
        },
      ])
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const temp = posts.map((p) => {
      const likesCountArr = p.extendedLikesInfo.likesCount;
      const dislikesCountArr = p.extendedLikesInfo.dislikesCount;
      const myStatusArr = p.extendedLikesInfo.myStatus;

      const extendedLikesInfo = {
        likesCount: likesCountArr.length ? likesCountArr[0].count : 0,
        dislikesCount: dislikesCountArr.length ? dislikesCountArr[0].count : 0,
        myStatus: myStatusArr.length ? myStatusArr[0].status : 'None',
        newestLikes: p.extendedLikesInfo.newestLikes,
      };
      p.extendedLikesInfo = extendedLikesInfo;
      return p;
    });

    const totalCount: number = await this.postModel.count({
      blogId: blogId,
    });

    const outputObj = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: temp,
    };
    return outputObj;
  }
}
