import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';

@Module({
  controllers: [TestingController],
  //imports: [BlogsModule, PostsModule, CommentsModule, UsersModule],
})
export class TestingModule {}
