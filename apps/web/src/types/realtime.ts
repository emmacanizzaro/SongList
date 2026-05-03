export type SongPresenceUser = {
  userId: string
  name: string
}

export type SongPresenceEvent = {
  songId: string
  users: SongPresenceUser[]
}

export type MeetingPresenceUser = {
  userId: string
  name: string
}

export type MeetingPresenceEvent = {
  meetingId: string
  users: MeetingPresenceUser[]
}

export type MeetingUpdateEvent = {
  meetingId: string
  changes: Record<string, any>
  userId: string
}

export type SongUpdateEvent = {
  songId: string
  changes: Record<string, any>
  userId: string
}

export type RealtimeEvents = {
  'song:update': SongUpdateEvent
  'song:updated': SongUpdateEvent
  'user:connected': { id: string }
  'user:disconnected': { id: string }
  'meeting:update': MeetingUpdateEvent
  'meeting:updated': MeetingUpdateEvent
  'meeting:join': { meetingId: string; user: MeetingPresenceUser }
  'meeting:leave': { meetingId: string; user: MeetingPresenceUser }
  'meeting:presence': MeetingPresenceEvent
  'song:join': { songId: string; user: SongPresenceUser }
  'song:leave': { songId: string; user: SongPresenceUser }
  'song:presence': SongPresenceEvent
}
