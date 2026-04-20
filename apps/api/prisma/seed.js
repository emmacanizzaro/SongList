const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function upsertInstrument(churchId, name, icon, sortOrder) {
  return prisma.instrument.upsert({
    where: {
      churchId_name: {
        churchId,
        name,
      },
    },
    update: { icon, sortOrder },
    create: { churchId, name, icon, sortOrder },
  });
}

async function ensureSong(churchId, createdById, data) {
  const existing = await prisma.song.findFirst({
    where: {
      churchId,
      title: data.title,
    },
  });

  const song = existing
    ? await prisma.song.update({
        where: { id: existing.id },
        data: {
          artist: data.artist,
          originalKey: data.originalKey,
          bpm: data.bpm,
          tags: data.tags,
          createdById,
        },
      })
    : await prisma.song.create({
        data: {
          churchId,
          title: data.title,
          artist: data.artist,
          originalKey: data.originalKey,
          bpm: data.bpm,
          tags: data.tags,
          createdById,
        },
      });

  await prisma.songVersion.upsert({
    where: {
      songId_type: {
        songId: song.id,
        type: "ORIGINAL",
      },
    },
    update: {
      key: data.originalKey,
      lyricsChords: data.lyricsChords,
    },
    create: {
      songId: song.id,
      type: "ORIGINAL",
      key: data.originalKey,
      lyricsChords: data.lyricsChords,
    },
  });

  return song;
}

async function main() {
  const demoEmail = process.env.DEMO_ADMIN_EMAIL || "demo@songlist.app";
  const demoPassword = process.env.DEMO_ADMIN_PASSWORD || "SongListDemo123!";
  const demoChurchSlug = process.env.DEMO_CHURCH_SLUG || "demo-songlist";

  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: "Demo Admin",
      passwordHash,
    },
    create: {
      email: demoEmail,
      name: "Demo Admin",
      passwordHash,
    },
  });

  const church = await prisma.church.upsert({
    where: { slug: demoChurchSlug },
    update: {
      name: "Iglesia Demo SongList",
      timezone: "America/Argentina/Buenos_Aires",
      description: "Entorno de demostracion para ventas tempranas.",
    },
    create: {
      slug: demoChurchSlug,
      name: "Iglesia Demo SongList",
      timezone: "America/Argentina/Buenos_Aires",
      description: "Entorno de demostracion para ventas tempranas.",
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_churchId: {
        userId: user.id,
        churchId: church.id,
      },
    },
    update: { role: "ADMIN" },
    create: {
      userId: user.id,
      churchId: church.id,
      role: "ADMIN",
    },
  });

  await prisma.subscription.upsert({
    where: { churchId: church.id },
    update: {
      plan: "PRO",
      status: "ACTIVE",
      cancelAtPeriodEnd: false,
    },
    create: {
      churchId: church.id,
      plan: "PRO",
      status: "ACTIVE",
      cancelAtPeriodEnd: false,
    },
  });

  await Promise.all([
    upsertInstrument(church.id, "Voz Principal", "🎤", 1),
    upsertInstrument(church.id, "Coros", "🎵", 2),
    upsertInstrument(church.id, "Guitarra", "🎸", 3),
    upsertInstrument(church.id, "Bajo", "🎸", 4),
    upsertInstrument(church.id, "Piano/Teclado", "🎹", 5),
    upsertInstrument(church.id, "Bateria", "🥁", 6),
  ]);

  const songs = [];

  songs.push(
    await ensureSong(church.id, user.id, {
      title: "Cuan Grande Es Dios",
      artist: "Chris Tomlin",
      originalKey: "G",
      bpm: 76,
      tags: ["adoracion", "congregacional"],
      lyricsChords:
        "[G]El esplendor de un [D/F#]rey\n[Em]Vestido en majes[D]tad\n[C]La tierra alegre esta\n[C]La tierra alegre esta",
    }),
  );

  songs.push(
    await ensureSong(church.id, user.id, {
      title: "Oceans",
      artist: "Hillsong UNITED",
      originalKey: "D",
      bpm: 64,
      tags: ["oracion", "devocional"],
      lyricsChords:
        "[D]Tu voz me llama [A]a las aguas\n[Bm]Donde mis pies pueden [G]fallar",
    }),
  );

  songs.push(
    await ensureSong(church.id, user.id, {
      title: "Al Que Es Digno",
      artist: "Marcos Witt",
      originalKey: "C",
      bpm: 92,
      tags: ["celebracion", "apertura"],
      lyricsChords:
        "[C]Al que es digno de [G]recibir\n[Am]La gloria y la [F]honra",
    }),
  );

  const meetingDate = new Date();
  meetingDate.setDate(meetingDate.getDate() + 3);
  meetingDate.setHours(19, 30, 0, 0);

  const meetingTitle = "Culto Domingo Demo";
  const existingMeeting = await prisma.meeting.findFirst({
    where: { churchId: church.id, title: meetingTitle },
  });

  const meeting = existingMeeting
    ? await prisma.meeting.update({
        where: { id: existingMeeting.id },
        data: {
          date: meetingDate,
          notes: "Reunion demo para presentacion comercial.",
        },
      })
    : await prisma.meeting.create({
        data: {
          churchId: church.id,
          title: meetingTitle,
          date: meetingDate,
          notes: "Reunion demo para presentacion comercial.",
          createdById: user.id,
        },
      });

  for (const [index, song] of songs.entries()) {
    await prisma.meetingSong.upsert({
      where: {
        meetingId_songId: {
          meetingId: meeting.id,
          songId: song.id,
        },
      },
      update: {
        order: index + 1,
      },
      create: {
        meetingId: meeting.id,
        songId: song.id,
        order: index + 1,
      },
    });
  }

  const voice = await prisma.instrument.findUnique({
    where: {
      churchId_name: {
        churchId: church.id,
        name: "Voz Principal",
      },
    },
  });

  if (voice) {
    await prisma.assignment.upsert({
      where: {
        meetingId_userId_instrumentId: {
          meetingId: meeting.id,
          userId: user.id,
          instrumentId: voice.id,
        },
      },
      update: {
        notes: "Liderar apertura y cierre",
      },
      create: {
        meetingId: meeting.id,
        userId: user.id,
        instrumentId: voice.id,
        notes: "Liderar apertura y cierre",
      },
    });
  }

  console.log("Demo seed completado.");
  console.log(`Usuario demo: ${demoEmail}`);
  console.log(`Password demo: ${demoPassword}`);
  console.log(`Church slug demo: ${demoChurchSlug}`);
}

main()
  .catch((error) => {
    console.error("Fallo en demo seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
