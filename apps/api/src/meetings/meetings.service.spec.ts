import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { MeetingsService } from "./meetings.service";

type MockFn = jest.Mock<Promise<unknown>, unknown[]>;

type PrismaMock = {
  meeting: {
    findFirst: MockFn;
    update: MockFn;
  };
  membership: {
    findFirst: MockFn;
  };
  instrument: {
    findFirst: MockFn;
  };
  assignment: {
    findFirst: MockFn;
    upsert: MockFn;
    delete: MockFn;
  };
  meetingSong: {
    count: MockFn;
    create: MockFn;
    updateMany: MockFn;
  };
  $transaction: MockFn;
};

type EntitlementsMock = {
  getSnapshot: MockFn;
};

const buildMocks = (): {
  prisma: PrismaMock;
  entitlements: EntitlementsMock;
} => {
  const prisma: PrismaMock = {
    meeting: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    membership: {
      findFirst: jest.fn(),
    },
    instrument: {
      findFirst: jest.fn(),
    },
    assignment: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
    meetingSong: {
      count: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const entitlements: EntitlementsMock = {
    getSnapshot: jest.fn(),
  };

  return { prisma, entitlements };
};

describe("MeetingsService", () => {
  it("generateShareLink should reject on free plan", async () => {
    const { prisma, entitlements } = buildMocks();
    const service = new MeetingsService(prisma as never, entitlements as never);

    entitlements.getSnapshot.mockResolvedValue({
      features: { canShareLinks: false },
    });

    await expect(
      service.generateShareLink("church-1", "meeting-1"),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.meeting.update).not.toHaveBeenCalled();
  });

  it("generateShareLink should set meeting as public when feature is enabled", async () => {
    const { prisma, entitlements } = buildMocks();
    const service = new MeetingsService(prisma as never, entitlements as never);

    entitlements.getSnapshot.mockResolvedValue({
      features: { canShareLinks: true },
    });
    prisma.meeting.findFirst.mockResolvedValue({ id: "meeting-1" });
    prisma.meeting.update.mockResolvedValue({ shareToken: "token-1" });

    await expect(
      service.generateShareLink("church-1", "meeting-1"),
    ).resolves.toEqual({
      shareToken: "token-1",
    });

    expect(prisma.meeting.update).toHaveBeenCalledWith({
      where: { id: "meeting-1" },
      data: { isPublic: true, shareToken: expect.any(String) },
      select: { shareToken: true },
    });
  });

  it("assignMusician should fail when member does not belong to church", async () => {
    const { prisma, entitlements } = buildMocks();
    const service = new MeetingsService(prisma as never, entitlements as never);

    prisma.meeting.findFirst.mockResolvedValue({ id: "meeting-1" });
    prisma.$transaction.mockResolvedValue([null, { id: "instrument-1" }]);

    await expect(
      service.assignMusician(
        "church-1",
        "meeting-1",
        "user-1",
        "instrument-1",
        "Entra en coro",
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.assignment.upsert).not.toHaveBeenCalled();
  });

  it("assignMusician should fail when instrument does not belong to church", async () => {
    const { prisma, entitlements } = buildMocks();
    const service = new MeetingsService(prisma as never, entitlements as never);

    prisma.meeting.findFirst.mockResolvedValue({ id: "meeting-1" });
    prisma.$transaction.mockResolvedValue([{ id: "membership-1" }, null]);

    await expect(
      service.assignMusician(
        "church-1",
        "meeting-1",
        "user-1",
        "instrument-1",
        "Entra en coro",
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.assignment.upsert).not.toHaveBeenCalled();
  });

  it("unassignMusician should fail when assignment does not belong to tenant meeting", async () => {
    const { prisma, entitlements } = buildMocks();
    const service = new MeetingsService(prisma as never, entitlements as never);

    prisma.meeting.findFirst.mockResolvedValue({ id: "meeting-1" });
    prisma.assignment.findFirst.mockResolvedValue(null);

    await expect(
      service.unassignMusician("church-1", "meeting-1", "assignment-1"),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.assignment.delete).not.toHaveBeenCalled();
  });

  it("reorderSongs should update song order in sequence", async () => {
    const { prisma, entitlements } = buildMocks();
    const service = new MeetingsService(prisma as never, entitlements as never);

    prisma.meeting.findFirst
      .mockResolvedValueOnce({ id: "meeting-1" })
      .mockResolvedValueOnce({
        id: "meeting-1",
        churchId: "church-1",
        meetingSongs: [],
        assignments: [],
      });

    prisma.meetingSong.updateMany.mockResolvedValue({ count: 1 });
    prisma.$transaction.mockResolvedValue(undefined);

    const result = await service.reorderSongs("church-1", "meeting-1", [
      "song-2",
      "song-1",
    ]);

    expect(prisma.meetingSong.updateMany).toHaveBeenNthCalledWith(1, {
      where: { meetingId: "meeting-1", songId: "song-2" },
      data: { order: 1 },
    });
    expect(prisma.meetingSong.updateMany).toHaveBeenNthCalledWith(2, {
      where: { meetingId: "meeting-1", songId: "song-1" },
      data: { order: 2 },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({ id: "meeting-1", churchId: "church-1" }),
    );
  });

  it("addSong should throw conflict when song is already in meeting", async () => {
    const { prisma, entitlements } = buildMocks();
    const service = new MeetingsService(prisma as never, entitlements as never);

    prisma.meeting.findFirst.mockResolvedValue({ id: "meeting-1" });
    prisma.meetingSong.count.mockResolvedValue(1);
    prisma.meetingSong.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
      }),
    );

    await expect(
      service.addSong("church-1", "meeting-1", "song-1", "D", "Intro"),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
