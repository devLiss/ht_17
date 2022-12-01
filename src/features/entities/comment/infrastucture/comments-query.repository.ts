import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../entities/comments.schema';
import mongoose from 'mongoose';
import { PostQueryDto } from '../../../api/public/posts/dto/postQuery.dto';
import { PaginatingQueryDto } from '../../../api/bloggers/blogs/dto/paginatingQuery.dto';

export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async getCommentById(id: string) {
    return this.commentModel.findOne({ _id: id, isBanned: false });
  }

  async getCommentByIdWithLikes(
    id: string,
    userId: string | mongoose.Types.ObjectId,
  ) {
    const comment = await this.commentModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id), isBanned: false } },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'commentId',
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
          foreignField: 'commentId',
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
          foreignField: 'commentId',
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
        $project: {
          _id: 0,
          id: '$_id',
          content: 1,
          userId: 1,
          userLogin: 1,
          createdAt: 1,
          'likesInfo.likesCount': '$likesCount',
          'likesInfo.dislikesCount': '$dislikesCount',
          'likesInfo.myStatus': '$myStatus',
        },
      },
    ]);

    const temp = comment.map((comm) => {
      const likesCountArr = comm.likesInfo.likesCount;
      const dislikesCountArr = comm.likesInfo.dislikesCount;
      const myStatusArr = comm.likesInfo.myStatus;

      const likesInfo = {
        likesCount: likesCountArr.length ? likesCountArr[0].count : 0,
        dislikesCount: dislikesCountArr.length ? dislikesCountArr[0].count : 0,
        myStatus: myStatusArr.length ? myStatusArr[0].status : 'None',
      };
      comm.likesInfo = likesInfo;
      return comment;
    });

    console.log(temp);
    if (!temp.length) {
      return null;
    }
    return temp[0][0];
  }

  async getCommentsByPostId(
    userId: string | mongoose.Types.ObjectId,
    postId: string,
    query: PostQueryDto,
  ) {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    const comments = await this.commentModel
      .aggregate([
        { $match: { postId: postId, isBanned: false } },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'commentId',
            pipeline: [
              {
                $match: {
                  status: 'Like',
                  isBanned: false,
                },
              },
              { $count: 'count' },
            ],
            as: 'likesCount',
          },
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'commentId',
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
            foreignField: 'commentId',
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
          $project: {
            _id: 0,
            id: '$_id',
            content: 1,
            userId: 1,
            userLogin: 1,
            createdAt: 1,
            'likesInfo.likesCount': '$likesCount',
            'likesInfo.dislikesCount': '$dislikesCount',
            'likesInfo.myStatus': '$myStatus',
          },
        },
      ])
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      .sort({ [sortBy]: sortDirection });
    const temp = comments.map((comment) => {
      const likesCountArr = comment.likesInfo.likesCount;
      const dislikesCountArr = comment.likesInfo.dislikesCount;
      const myStatusArr = comment.likesInfo.myStatus;

      const likesInfo = {
        likesCount: likesCountArr.length ? likesCountArr[0].count : 0,
        dislikesCount: dislikesCountArr.length ? dislikesCountArr[0].count : 0,
        myStatus: myStatusArr.length ? myStatusArr[0].status : 'None',
      };
      comment.likesInfo = likesInfo;
      return comment;
    });
    console.log(temp);

    const totalCount = await this.commentModel.countDocuments({
      postId: new mongoose.Types.ObjectId(postId),
      isBanned: false,
    });

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: temp,
    };
  }

  async getCommentsForBlogger(
    userId: string | mongoose.Types.ObjectId,
    query: PaginatingQueryDto,
  ) {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    let direction = -1;
    if (sortDirection === 'asc') {
      direction = 1;
    }
    const sort: { [p: string]: number } = {
      [sortBy]: direction,
    };
    const comments = await this.commentModel
      .aggregate([
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'commentId',
            pipeline: [
              {
                $match: {
                  status: 'Like',
                  isBanned: false,
                },
              },
            ],
            as: 'likesCount',
          },
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'commentId',
            pipeline: [
              {
                $match: {
                  status: 'Dislike',
                  isBanned: false,
                },
              },
            ],
            as: 'dislikesCount',
          },
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'commentId',
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
            from: 'posts',
            localField: 'postId',
            foreignField: '_id',
            as: 'findedPosts',
          },
        },
        {
          $unwind: {
            path: '$findedPosts',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'blogs',
            localField: 'findedPosts.blogId',
            foreignField: '_id',
            pipeline: [
              {
                $match: { 'blogOwnerInfo.userId': userId },
              },
            ],
            as: 'findedBlogs',
          },
        },
        {
          $unwind: {
            path: '$findedBlogs',
            preserveNullAndEmptyArrays: true,
          },
        },
        { $match: { findedBlogs: { $exists: true }, isBanned: false } },
        {
          $project: {
            id: '$_id',
            _id: 0,
            content: 1,
            createdAt: 1,
            'likesInfo.likesCount': { $size: '$likesCount' },
            'likesInfo.dislikesCount': { $size: '$dislikesCount' },
            'likesInfo.myStatus': {
              $cond: [
                { $gt: [{ $size: '$myStatus' }, 0] },
                { $first: '$myStatus.status' },
                'None',
              ],
            },
            commentatorInfo: {
              userId: '$userId',
              userLogin: '$userLogin',
            },
            postInfo: {
              id: '$findedPosts._id',
              title: '$findedPosts.title',
              blogId: '$findedPosts.blogId',
              blogName: '$findedPosts.blogName',
            },
          },
        },
      ])
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    //TODO изменить подсчет totalCount
    const totalCount1 = await this.commentModel.aggregate([
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'commentId',
          pipeline: [
            {
              $match: {
                status: 'Like',
                isBanned: false,
              },
            },
          ],
          as: 'likesCount',
        },
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'commentId',
          pipeline: [
            {
              $match: {
                status: 'Dislike',
                isBanned: false,
              },
            },
          ],
          as: 'dislikesCount',
        },
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'commentId',
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
          from: 'posts',
          localField: 'postId',
          foreignField: '_id',
          as: 'findedPosts',
        },
      },
      {
        $unwind: {
          path: '$findedPosts',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'blogs',
          localField: 'findedPosts.blogId',
          foreignField: '_id',
          pipeline: [
            {
              $match: { 'blogOwnerInfo.userId': userId },
            },
          ],
          as: 'findedBlogs',
        },
      },
      {
        $unwind: {
          path: '$findedBlogs',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: { findedBlogs: { $exists: true }, isBanned: false } },
      //{ $sort: { createdAt: -1 } },
      {
        $project: {
          id: '$_id',
          _id: 0,
          content: 1,
          createdAt: 1,
          'likesInfo.likesCount': { $size: '$likesCount' },
          'likesInfo.dislikesCount': { $size: '$dislikesCount' },
          'likesInfo.myStatus': {
            $cond: [
              { $gt: [{ $size: '$myStatus' }, 0] },
              { $first: '$myStatus.status' },
              'None',
            ],
          },
          commentatorInfo: {
            userId: '$userId',
            userLogin: '$userLogin',
          },
          postInfo: {
            id: '$findedPosts._id',
            title: '$findedPosts.title',
            blogId: '$findedPosts.blogId',
            blogName: '$findedPosts.blogName',
          },
        },
      },
    ]);

    return {
      pagesCount: Math.ceil(totalCount1.length / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount1.length,
      items: comments,
    };
  }
}
