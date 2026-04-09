import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";

@Injectable()
export class InstrumentsService {
  constructor(
    private prisma: PrismaService,
    private subscriptions: SubscriptionsService,
  ) {}

  async findAll(churchId: string) {
    return this.prisma.instrument.findMany({
      where: { churchId },
      include: { _count: { select: { assignments: true } } },
      orderBy: { sortOrder: "asc" },
    });
  }

  async create(churchId: string, name: string, icon?: string) {
    const limits = await this.subscriptions.getLimits(churchId);
    if (limits.maxInstruments !== -1) {
      const count = await this.prisma.instrument.count({ where: { churchId } });
      if (count >= limits.maxInstruments) {
        throw new ForbiddenException(
          `Tu plan permite un máximo de ${limits.maxInstruments} instrumentos. Actualiza tu plan para agregar más.`,
        );
      }
    }

    const existing = await this.prisma.instrument.findUnique({
      where: { churchId_name: { churchId, name } },
    });
    if (existing)
      throw new ConflictException(`Ya existe el instrumento "${name}"`);

    const count = await this.prisma.instrument.count({ where: { churchId } });

    return this.prisma.instrument.create({
      data: { churchId, name, icon, sortOrder: count + 1 },
    });
  }

  async update(churchId: string, id: string, name: string, icon?: string) {
    await this.assertBelongsToChurch(id, churchId);
    return this.prisma.instrument.update({
      where: { id },
      data: { name, icon },
    });
  }

  async remove(churchId: string, id: string) {
    await this.assertBelongsToChurch(id, churchId);
    return this.prisma.instrument.delete({ where: { id } });
  }

  async reorder(churchId: string, orderedIds: string[]) {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.instrument.updateMany({
          where: { id, churchId },
          data: { sortOrder: index + 1 },
        }),
      ),
    );
    return this.findAll(churchId);
  }

  private async assertBelongsToChurch(id: string, churchId: string) {
    const instrument = await this.prisma.instrument.findFirst({
      where: { id, churchId },
    });
    if (!instrument) throw new NotFoundException("Instrumento no encontrado");
  }
}
