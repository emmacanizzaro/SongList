type AuthenticatedUser = {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    churchId: string;
    currentRole: string;
};
export declare const CurrentUser: (...dataOrPipes: (keyof AuthenticatedUser | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
export {};
