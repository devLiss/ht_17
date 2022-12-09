import { BlogQueryDto } from '../../../../public/blogs/dto/blogQuery.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../../../../entities/postgres/blogsSql.repository';

export class GetBlogsCommand {
  constructor(public bqDto: BlogQueryDto, public userId: string) {}
}
@CommandHandler(GetBlogsCommand)
export class GetBlogsUseCase implements ICommandHandler<GetBlogsCommand> {
  constructor(private blogQueryRepo: BlogsSqlRepository) {}

  async execute(command: GetBlogsCommand): Promise<any> {
    const data = await this.blogQueryRepo.getAllByUser(
      command.bqDto,
      command.userId,
    );
    if (data) {
    }
    return data;
  }
}
