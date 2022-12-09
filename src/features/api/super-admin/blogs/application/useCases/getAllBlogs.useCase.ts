import { BlogQueryDto } from '../../../../public/blogs/dto/blogQuery.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogQueryRepository } from '../../../../../entities/mongo/blogs/infrastructure/blog-query.repository';
import { BlogsSqlRepository } from '../../../../../entities/postgres/blogsSql.repository';

export class GetAllBlogsCommand {
  constructor(public bqDto: BlogQueryDto) {}
}
@CommandHandler(GetAllBlogsCommand)
export class GetAllBlogsUseCase implements ICommandHandler<GetAllBlogsCommand> {
  constructor(private blogRepo: BlogsSqlRepository) {}

  async execute(command: GetAllBlogsCommand): Promise<any> {
    const data = await this.blogRepo.getAll(command.bqDto);
    return data;
  }
}
