import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { getAccessState } from "./plan-limits";

const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const READ_ONLY_MESSAGES = {
  trial_expired:
    "Tu prueba gratuita de 30 días terminó. Elige un plan para seguir creando y editando.",
  period_expired:
    "El período de tu plan venció. Renuévalo para seguir creando y editando.",
} as const;

/**
 * Puts a church in read-only mode when its FREE trial or its paid period has
 * ended: reads keep working, any write is rejected with a clear message.
 * Must run after JwtAuthGuard (needs request.user.churchId).
 */
@Injectable()
export class ActiveSubscriptionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (READ_METHODS.has(request.method)) return true;

    const churchId: string | undefined = request.user?.churchId;
    if (!churchId) return true;

    const sub = await this.prisma.subscription.findUnique({
      where: { churchId },
      select: { plan: true, trialEndsAt: true, currentPeriodEnd: true },
    });
    if (!sub) return true;

    const state = getAccessState(sub);
    if (state === "active") return true;

    throw new ForbiddenException({
      statusCode: 403,
      error: "Forbidden",
      code: state === "trial_expired" ? "TRIAL_EXPIRED" : "PLAN_EXPIRED",
      message: READ_ONLY_MESSAGES[state],
    });
  }
}
