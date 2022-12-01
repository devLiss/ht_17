import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Blog = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.blog;
  },
);
