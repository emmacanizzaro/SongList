import { createParamDecorator, ExecutionContext } from "@nestjs/common";

type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  churchId: string;
  currentRole: string;
};

export const CurrentUser = createParamDecorator(
  (_data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;
    return _data ? user?.[_data] : user;
  },
);
