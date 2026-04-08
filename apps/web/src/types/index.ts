// ============================================================
// TIPOS COMPARTIDOS - SongList SaaS
// ============================================================

export type MemberRole = 'ADMIN' | 'EDITOR' | 'READER';
export type VersionType = 'ORIGINAL' | 'MALE_KEY' | 'FEMALE_KEY' | 'CUSTOM';
export type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  churchId: string;
  currentRole: MemberRole;
}

export interface Church {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  _count?: { memberships: number; songs: number; meetings: number };
}

export interface Membership {
  id: string;
  userId: string;
  churchId: string;
  role: MemberRole;
  joinedAt: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
}

export interface SongVersion {
  id: string;
  songId: string;
  type: VersionType;
  key: string;
  lyricsChords: string;
  notes?: string;
}

export interface Song {
  id: string;
  churchId: string;
  title: string;
  artist?: string;
  originalKey: string;
  bpm?: number;
  tags: string[];
  versions: SongVersion[];
  createdAt: string;
}

export interface Instrument {
  id: string;
  name: string;
  icon?: string;
  sortOrder: number;
}

export interface Assignment {
  id: string;
  meetingId: string;
  userId: string;
  instrumentId: string;
  notes?: string;
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  instrument: Pick<Instrument, 'id' | 'name' | 'icon'>;
}

export interface MeetingSong {
  id: string;
  meetingId: string;
  songId: string;
  order: number;
  keyOverride?: string;
  notes?: string;
  song: Song;
}

export interface Meeting {
  id: string;
  churchId: string;
  title: string;
  date: string;
  notes?: string;
  isPublic: boolean;
  shareToken?: string;
  meetingSongs: MeetingSong[];
  assignments: Assignment[];
  createdAt: string;
}

export interface Subscription {
  plan: PlanType;
  status: SubscriptionStatus;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  limits: PlanLimits;
}

export interface PlanLimits {
  maxMembers: number;
  maxSongs: number;
  maxInstruments: number;
  historyMonths: number;
  canExportPdf: boolean;
  canShareLinks: boolean;
  canMultiTeam: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TranspositionResult {
  songId: string;
  originalKey: string;
  targetKey: string;
  lyricsChords: string;
  chords: string[];
}
