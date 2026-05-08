import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
  customType,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

const citext = customType<{ data: string; driverData: string }>({
  dataType: () => "citext",
});

// =============================================================================
// Enums
// =============================================================================

export const userStatusEnum = pgEnum("user_status", ["active", "disabled", "ghost"]);

export const eventFormatEnum = pgEnum("event_format", [
  "HACKATHON",
  "MEETUP",
  "MINI_CONFERENCE",
  "OFFICE_HOURS",
]);

export const eventStateEnum = pgEnum("event_state", [
  "draft",
  "published",
  "live",
  "completed",
  "cancelled",
]);

export const eventSponsorRoleEnum = pgEnum("event_sponsor_role", [
  "host",
  "primary",
  "partner",
]);

export const registrationStatusEnum = pgEnum("registration_status", [
  "rsvp",
  "confirmed",
  "waitlist",
  "cancelled",
]);

export const registrationSourceEnum = pgEnum("registration_source", [
  "builder",
  "company",
]);

export const teamRoleEnum = pgEnum("team_role", ["leader", "member", "alumni"]);

export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "declined",
  "expired",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "submitted",
  "accepted",
  "finalist",
  "winner",
  "rejected",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "queued",
  "running",
  "scored",
  "failed",
]);

export const judgeKindEnum = pgEnum("judge_kind", ["ai", "sponsor", "angel", "vc"]);

export const officeHoursSessionStatusEnum = pgEnum("office_hours_session_status", [
  "upcoming",
  "live",
  "done",
  "cancelled",
]);

export const officeHoursRsvpStatusEnum = pgEnum("office_hours_rsvp_status", [
  "rsvp",
  "attended",
  "no_show",
]);

export const manifestRoleEnum = pgEnum("manifest_role", [
  "builder",
  "judge",
  "sponsor",
  "crew",
  "press",
]);

export const sponsorStatusEnum = pgEnum("sponsor_status", ["active", "past"]);

// =============================================================================
// Identity
// =============================================================================

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: citext("email").notNull(),
    name: text("name"),
    imageUrl: text("image_url"),
    githubUrl: text("github_url"),
    githubLogin: text("github_login"),
    linkedinUrl: text("linkedin_url"),
    twitterUrl: text("twitter_url"),
    discordId: text("discord_id"),
    phone: text("phone"),
    memberSince: timestamp("member_since", { withTimezone: true }).notNull().defaultNow(),
    isAdmin: boolean("is_admin").notNull().default(false),
    status: userStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
    githubLoginIdx: uniqueIndex("users_github_login_idx").on(t.githubLogin),
    discordIdIdx: uniqueIndex("users_discord_id_idx").on(t.discordId),
  }),
);

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
    userIdx: index("accounts_user_idx").on(t.userId),
  }),
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.identifier, t.token] }),
  }),
);

// =============================================================================
// Sponsors & venues
// =============================================================================

export const sponsors = pgTable("sponsors", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color"),
  docUrl: text("doc_url"),
  siteUrl: text("site_url"),
  status: sponsorStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sponsorAdmins = pgTable(
  "sponsor_admins",
  {
    sponsorId: uuid("sponsor_id")
      .notNull()
      .references(() => sponsors.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.sponsorId, t.userId] }),
  }),
);

export const venues = pgTable("venues", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  region: text("region"),
  country: text("country"),
  lat: numeric("lat", { precision: 9, scale: 6 }),
  lng: numeric("lng", { precision: 9, scale: 6 }),
  isOnline: boolean("is_online").notNull().default(false),
  capacity: integer("capacity"),
  notes: text("notes"),
});

// =============================================================================
// Events
// =============================================================================

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    format: eventFormatEnum("format").notNull(),
    state: eventStateEnum("state").notNull().default("draft"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    venueId: uuid("venue_id").references(() => venues.id, { onDelete: "set null" }),
    capacity: integer("capacity").notNull().default(0),
    registered: integer("registered").notNull().default(0),
    coverGradient: text("cover_gradient"),
    prizeSummary: text("prize_summary"),
    rsvpUrl: text("rsvp_url"),
    partnersJson: jsonb("partners_json").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    parentEventId: uuid("parent_event_id"),
    rrule: text("rrule"),
    scoringConfigJson: jsonb("scoring_config_json").$type<{
      ai_weight?: number;
      sponsor_weight?: number;
      investor_weight?: number;
      public_leaderboard_at?: string;
      rubric_version?: string;
    } | null>(),
    createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    stateStartsAtIdx: index("events_state_starts_at_idx").on(t.state, t.startsAt),
    parentIdx: index("events_parent_idx").on(t.parentEventId),
  }),
);

export const eventSponsors = pgTable(
  "event_sponsors",
  {
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    sponsorId: uuid("sponsor_id")
      .notNull()
      .references(() => sponsors.id, { onDelete: "cascade" }),
    role: eventSponsorRoleEnum("role").notNull().default("partner"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.eventId, t.sponsorId] }),
  }),
);

export const eventRegistrations = pgTable(
  "event_registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: registrationStatusEnum("status").notNull().default("rsvp"),
    source: registrationSourceEnum("source").notNull().default("builder"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    eventUserIdx: uniqueIndex("event_registrations_event_user_idx").on(t.eventId, t.userId),
    userStatusIdx: index("event_registrations_user_status_idx").on(t.userId, t.status),
  }),
);

// =============================================================================
// Teams & projects
// =============================================================================

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    leaderId: uuid("leader_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    eventNameIdx: uniqueIndex("teams_event_name_idx").on(t.eventId, t.name),
  }),
);

export const teamMemberships = pgTable(
  "team_memberships",
  {
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: teamRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.teamId, t.userId] }),
  }),
);

export const teamInvitations = pgTable("team_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  email: citext("email").notNull(),
  invitedById: uuid("invited_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  status: invitationStatusEnum("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    summary: text("summary"),
    repoUrl: text("repo_url"),
    demoUrl: text("demo_url"),
    videoUrl: text("video_url"),
    videoThumbUrl: text("video_thumb_url"),
    status: projectStatusEnum("status").notNull().default("draft"),
    aiScore: numeric("ai_score", { precision: 5, scale: 2 }),
    humanScore: numeric("human_score", { precision: 5, scale: 2 }),
    compositeScore: numeric("composite_score", { precision: 5, scale: 2 }),
    compositeRank: integer("composite_rank"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    finalizedAt: timestamp("finalized_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    teamEventIdx: uniqueIndex("projects_team_event_idx").on(t.teamId, t.eventId),
    eventRankIdx: index("projects_event_rank_idx").on(t.eventId, t.compositeRank),
  }),
);

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    githubDefaultBranchSha: text("github_default_branch_sha"),
    githubSnapshotJson: jsonb("github_snapshot_json").$type<unknown>(),
    rubricVersion: text("rubric_version").notNull().default("v1"),
    status: submissionStatusEnum("status").notNull().default("queued"),
    aiSummary: text("ai_summary"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    scoredAt: timestamp("scored_at", { withTimezone: true }),
  },
  (t) => ({
    projectCreatedIdx: index("submissions_project_created_idx").on(
      t.projectId,
      t.createdAt,
    ),
  }),
);

export const judges = pgTable(
  "judges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: judgeKindEnum("kind").notNull(),
    sponsorId: uuid("sponsor_id").references(() => sponsors.id, {
      onDelete: "set null",
    }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqueKind: uniqueIndex("judges_user_kind_sponsor_idx").on(
      t.userId,
      t.kind,
      t.sponsorId,
    ),
  }),
);

export const judgeScores = pgTable(
  "judge_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    judgeId: uuid("judge_id").references(() => judges.id, { onDelete: "set null" }),
    judgeKind: judgeKindEnum("judge_kind").notNull(),
    scoresJson: jsonb("scores_json").$type<Record<string, number>>().notNull(),
    weighted: numeric("weighted", { precision: 5, scale: 2 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    submissionJudgeIdx: uniqueIndex("judge_scores_submission_judge_idx").on(
      t.submissionId,
      t.judgeId,
    ),
    submissionIdx: index("judge_scores_submission_idx").on(t.submissionId),
  }),
);

// =============================================================================
// Office hours
// =============================================================================

export const officeHoursSessions = pgTable(
  "office_hours_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentEventId: uuid("parent_event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    venueId: uuid("venue_id").references(() => venues.id, { onDelete: "set null" }),
    hostUserId: uuid("host_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    joinUrl: text("join_url"),
    capacity: integer("capacity").notNull().default(100),
    status: officeHoursSessionStatusEnum("status").notNull().default("upcoming"),
  },
  (t) => ({
    parentStartsIdx: index("office_hours_parent_starts_idx").on(
      t.parentEventId,
      t.startsAt,
    ),
  }),
);

export const officeHoursRsvps = pgTable(
  "office_hours_rsvps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => officeHoursSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: officeHoursRsvpStatusEnum("status").notNull().default("rsvp"),
  },
  (t) => ({
    sessionUserIdx: uniqueIndex("office_hours_rsvps_session_user_idx").on(
      t.sessionId,
      t.userId,
    ),
  }),
);

// =============================================================================
// Boat manifest (CodeCruise-specific, reusable for any boat-day event)
// =============================================================================

export const boatManifest = pgTable(
  "boat_manifest",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    role: manifestRoleEnum("role").notNull().default("builder"),
    emergencyContactName: text("emergency_contact_name"),
    emergencyContactPhone: text("emergency_contact_phone"),
    dietary: text("dietary"),
    swimReleaseSigned: boolean("swim_release_signed").notNull().default(false),
    swimReleaseSignedAt: timestamp("swim_release_signed_at", { withTimezone: true }),
    checkedIn: boolean("checked_in").notNull().default(false),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    notes: text("notes"),
  },
  (t) => ({
    eventUserIdx: uniqueIndex("boat_manifest_event_user_idx").on(t.eventId, t.userId),
  }),
);

// =============================================================================
// Audit log
// =============================================================================

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// =============================================================================
// Relations
// =============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  registrations: many(eventRegistrations),
  teamMemberships: many(teamMemberships),
  ledTeams: many(teams, { relationName: "leader" }),
  judges: many(judges),
  manifestEntries: many(boatManifest),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  venue: one(venues, { fields: [events.venueId], references: [venues.id] }),
  parent: one(events, {
    fields: [events.parentEventId],
    references: [events.id],
    relationName: "parent",
  }),
  children: many(events, { relationName: "parent" }),
  sponsors: many(eventSponsors),
  registrations: many(eventRegistrations),
  teams: many(teams),
  projects: many(projects),
  manifest: many(boatManifest),
  officeHoursSessions: many(officeHoursSessions),
}));

export const eventSponsorsRelations = relations(eventSponsors, ({ one }) => ({
  event: one(events, { fields: [eventSponsors.eventId], references: [events.id] }),
  sponsor: one(sponsors, {
    fields: [eventSponsors.sponsorId],
    references: [sponsors.id],
  }),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  event: one(events, { fields: [teams.eventId], references: [events.id] }),
  leader: one(users, {
    fields: [teams.leaderId],
    references: [users.id],
    relationName: "leader",
  }),
  memberships: many(teamMemberships),
  invitations: many(teamInvitations),
  projects: many(projects),
}));

export const teamMembershipsRelations = relations(teamMemberships, ({ one }) => ({
  team: one(teams, { fields: [teamMemberships.teamId], references: [teams.id] }),
  user: one(users, { fields: [teamMemberships.userId], references: [users.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  team: one(teams, { fields: [projects.teamId], references: [teams.id] }),
  event: one(events, { fields: [projects.eventId], references: [events.id] }),
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  project: one(projects, {
    fields: [submissions.projectId],
    references: [projects.id],
  }),
  scores: many(judgeScores),
}));

export const judgesRelations = relations(judges, ({ one, many }) => ({
  user: one(users, { fields: [judges.userId], references: [users.id] }),
  sponsor: one(sponsors, { fields: [judges.sponsorId], references: [sponsors.id] }),
  scores: many(judgeScores),
}));

export const judgeScoresRelations = relations(judgeScores, ({ one }) => ({
  submission: one(submissions, {
    fields: [judgeScores.submissionId],
    references: [submissions.id],
  }),
  judge: one(judges, { fields: [judgeScores.judgeId], references: [judges.id] }),
}));

export const officeHoursSessionsRelations = relations(
  officeHoursSessions,
  ({ one, many }) => ({
    parent: one(events, {
      fields: [officeHoursSessions.parentEventId],
      references: [events.id],
    }),
    venue: one(venues, {
      fields: [officeHoursSessions.venueId],
      references: [venues.id],
    }),
    host: one(users, {
      fields: [officeHoursSessions.hostUserId],
      references: [users.id],
    }),
    rsvps: many(officeHoursRsvps),
  }),
);

export const officeHoursRsvpsRelations = relations(officeHoursRsvps, ({ one }) => ({
  session: one(officeHoursSessions, {
    fields: [officeHoursRsvps.sessionId],
    references: [officeHoursSessions.id],
  }),
  user: one(users, { fields: [officeHoursRsvps.userId], references: [users.id] }),
}));

export const boatManifestRelations = relations(boatManifest, ({ one }) => ({
  event: one(events, { fields: [boatManifest.eventId], references: [events.id] }),
  user: one(users, { fields: [boatManifest.userId], references: [users.id] }),
  project: one(projects, {
    fields: [boatManifest.projectId],
    references: [projects.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type JudgeScore = typeof judgeScores.$inferSelect;
export type OfficeHoursSession = typeof officeHoursSessions.$inferSelect;
export type BoatManifestEntry = typeof boatManifest.$inferSelect;
