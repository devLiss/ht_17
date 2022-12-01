import { BlogQueryDto } from '../../../../public/blogs/dto/blogQuery.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogQueryRepository } from '../../../../../entities/mongo/blogs/infrastructure/blog-query.repository';

export class GetAllBlogsCommand {
  constructor(public bqDto: BlogQueryDto) {}
}
@CommandHandler(GetAllBlogsCommand)
export class GetAllBlogsUseCase implements ICommandHandler<GetAllBlogsCommand> {
  constructor(private blogQueryRepo: BlogQueryRepository) {}

  async execute(command: GetAllBlogsCommand): Promise<any> {
    const data = await this.blogQueryRepo.findAllBlogs(command.bqDto);
    return data;
  }
}
