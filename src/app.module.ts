import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { EmailModule } from './emailManager/emailModule';
import { BlogQueryRepository } from './features/entities/mongo/blogs/infrastructure/blog-query.repository';
import {
  Blog,
  BlogSchema,
} from './features/entities/mongo/blogs/entities/blogs.schema';
import { JwtService } from './features/api/public/sessions/application/jwt.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { BlogsController } from './features/api/bloggers/blogs/api/blogs.controller';
import { BlogsRepo } from './features/entities/mongo/blogs/infrastructure/blog.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateBlogUseCase } from './features/api/bloggers/blogs/application/useCases/createBlog.useCase';
import { UserQueryRepository } from './features/entities/mongo/user/infrastructure/user-query.repository';
import { UserRepository } from './features/entities/mongo/user/infrastructure/user.repository';
import { UsersService } from './features/api/super-admin/users/application/users.service';
import { CommentsService } from './features/api/public/comments/application/comments.service';
import { CommentsQueryRepository } from './features/entities/mongo/comment/infrastucture/comments-query.repository';
import { CommentsRepository } from './features/entities/mongo/comment/infrastucture/comments.repository';
import { LikesRepository } from './features/entities/mongo/comment/infrastucture/likes.repository';
import { RegisterUseCase } from './features/api/public/auth/application/useCases/register.useCase';
import {
  User,
  UserSchema,
} from './features/entities/mongo/user/entities/user.schema';
import {
  Comment,
  CommentSchema,
} from './features/entities/mongo/comment/entities/comments.schema';
import {
  Like,
  LikeSchema,
} from './features/entities/mongo/comment/entities/likes.schema';
import { AuthController } from './features/api/public/auth/api/auth.controller';
import { LoginUseCase } from './features/api/public/auth/application/useCases/login.useCase';
import { SessionRepository } from './features/entities/mongo/session/infrastructure/session.repository';
import { PostsRepository } from './features/entities/mongo/post/infrastructure/posts.repository';
import { PostsQueryRepository } from './features/entities/mongo/post/infrastructure/posts-query.repository';
import { BlogIdValidation } from './common/validators/BlogIdValidation';
import { PostsService } from './features/api/public/posts/application/posts.service';
import {
  Post,
  PostSchema,
} from './features/entities/mongo/post/entities/posts.schema';
import {
  Session,
  SessionSchema,
} from './features/entities/mongo/session/entities/session.schema';
import { PasswordRecoveryUseCase } from './features/api/public/auth/application/useCases/passwordRecovery.useCase';
import { NewPasswordUseCase } from './features/api/public/auth/application/useCases/newPassword.useCase';
import { RefreshTokenUseCase } from './features/api/public/auth/application/useCases/refreshToken.useCase';
import { ConfirmRegistrationUseCase } from './features/api/public/auth/application/useCases/confirmRegistration.useCase';
import { ResendEmailUseCase } from './features/api/public/auth/application/useCases/resendEmail.useCase';
import { GetInfoByMeUseCase } from './features/api/public/auth/application/useCases/getInfoByMe.useCase';
import { LogoutUseCase } from './features/api/public/auth/application/useCases/logout.useCase';
import { GetBlogsUseCase } from './features/api/bloggers/blogs/application/useCases/getBlogs.useCase';
import { DeleteBlogUseCase } from './features/api/bloggers/blogs/application/useCases/deleteBlog.useCase';
import { UpdateBlogUseCase } from './features/api/bloggers/blogs/application/useCases/updateBlog.useCase';
import { CreatePostUseCase } from './features/api/bloggers/blogs/application/useCases/createPost.useCase';
import { UpdatePostUseCase } from './features/api/bloggers/blogs/application/useCases/updatePost.useCase';
import { DeletePostUseCase } from './features/api/bloggers/blogs/application/useCases/deletePost.useCase';
import { GetAllBlogsUseCase } from './features/api/super-admin/blogs/application/useCases/getAllBlogs.useCase';
import { SABlogsController } from './features/api/super-admin/blogs/blogs.controller';
import { UsersController } from './features/api/super-admin/users/api/users.controller';
import { BanUserUseCase } from './features/api/super-admin/users/application/useCases/banUser.useCase';
import { SessionsService } from './features/api/public/sessions/application/sessions.service';
import { DeleteUserUseCase } from './features/api/super-admin/users/application/useCases/deleteUser.useCase';
import { PublicBlogsController } from './features/api/public/blogs/blogs.controller';
import { TerminateByIdUseCase } from './features/api/public/sessions/application/useCases/terminateById.useCase';
import { SessionsController } from './features/api/public/sessions/api/sessions.controller';
import { TerminateNotActualsUseCase } from './features/api/public/sessions/application/useCases/terminateNotActuals.useCase';
import { TestingController } from './features/api/public/testing/testing.controller';
import { PostsController } from './features/api/public/posts/api/posts.controller';
import { CommentsController } from './features/api/public/comments/api/comments.controller';
import { BanUser } from './features/api/bloggers/users/application/useCases/banUser.useCase';
import { BloggerUsersController } from './features/api/bloggers/users/api/users.controller';
import {
  BlogBannedUsers,
  BlogBannedUsersSchema,
} from './features/entities/mongo/blogs/entities/blogBannedUsers.schema';
import { BannedUsersQueryRepo } from './features/entities/mongo/blogs/infrastructure/bannedUsers.query-repo';
import { GetBannedUsersForBlogsUseCase } from './features/api/bloggers/users/application/useCases/getBannedUsersForBlogs.useCase';
import { GetCommentsUseCase } from './features/api/bloggers/blogs/application/useCases/getComments.useCase';
import { BanBlogUseCase } from './features/api/super-admin/blogs/application/useCases/banBlog.useCase';
import { CreateUserUseCase } from './features/api/super-admin/users/application/useCases/createUser.useCase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSqlRepository } from './features/entities/postgres/userSql.repository';
import { SessionsSqlRepository } from './features/entities/postgres/sessionsSql.repository';
import { AppController } from './app.controller';

mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, converted) => {
    delete converted._id;
  },
});
const handlers = [
  CreateBlogUseCase,
  RegisterUseCase,
  LoginUseCase,
  PasswordRecoveryUseCase,
  NewPasswordUseCase,
  RefreshTokenUseCase,
  ConfirmRegistrationUseCase,
  ResendEmailUseCase,
  GetInfoByMeUseCase,
  LogoutUseCase,
  GetBlogsUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  GetAllBlogsUseCase,
  BanUserUseCase,
  DeleteUserUseCase,
  TerminateByIdUseCase,
  TerminateNotActualsUseCase,
  BanUser,
  GetBannedUsersForBlogsUseCase,
  GetCommentsUseCase,
  BanBlogUseCase,
  CreateUserUseCase,
];
const repos = [
  BlogsRepo,
  BlogQueryRepository,
  PostsRepository,
  PostsQueryRepository,
  UserQueryRepository,
  UserRepository,
  CommentsRepository,
  CommentsQueryRepository,
  LikesRepository,
  SessionRepository,
  BannedUsersQueryRepo,
];
const sqlRepos = [UserSqlRepository, SessionsSqlRepository];
const services = [
  JwtService,
  UsersService,
  CommentsService,
  PostsService,
  SessionsService,
];
const validators = [BlogIdValidation];
const controllers = [
  BlogsController,
  AuthController,
  SABlogsController,
  UsersController,
  PublicBlogsController,
  SessionsController,
  TestingController,
  PostsController,
  CommentsController,
  BloggerUsersController,
];
@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 6,
    }),
    MongooseModule.forRoot(process.env.mongoURI),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    MongooseModule.forFeature([
      { name: BlogBannedUsers.name, schema: BlogBannedUsersSchema },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: false,
    }),
    EmailModule,
  ],
  controllers: [AppController, ...controllers],
  providers: [
    AppService,
    ...repos,
    ...services,
    ...handlers,
    ...validators,
    ...sqlRepos,
  ],
})
export class AppModule {
  /*configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckExistingUserMiddleware).forRoutes({
      path: 'auth/registration',
      method: RequestMethod.POST,
    });
  }*/
}
