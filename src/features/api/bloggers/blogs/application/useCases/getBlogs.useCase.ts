import { BlogQueryDto } from '../../../../public/blogs/dto/blogQuery.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogQueryRepository } from '../../../../../entities/mongo/blogs/infrastructure/blog-query.repository';

export class GetBlogsCommand {
  constructor(public bqDto: BlogQueryDto, public userId: string) {}
}
@CommandHandler(GetBlogsCommand)
export class GetBlogsUseCase implements ICommandHandler<GetBlogsCommand> {
  constructor(private blogQueryRepo: BlogQueryRepository) {}

  async execute(command: GetBlogsCommand): Promise<any> {
    const data = await this.blogQueryRepo.findAllBlogsForUser(
      command.bqDto,
      command.userId,
    );
    if (data) {
    }
    return data;
  }
}
