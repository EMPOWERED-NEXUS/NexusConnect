export type FieldVisibility = 'public' | 'connections' | 'room_members' | 'ask_me' | 'private';

export interface VisibilityPreferences {
  email: FieldVisibility;
  phone: FieldVisibility;
  whatsapp: FieldVisibility;
  linkedin: FieldVisibility;
  website: FieldVisibility;
  github: FieldVisibility;
  skills: FieldVisibility;
  offers: FieldVisibility;
  needs: FieldVisibility;
}

export interface CustomLink {
  label: string;
  url: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  slug: string;
  displayName: string;
  headline: string;
  bio: string;
  photoUrl?: string;
  initials: string;
  organization: string;
  role: string;
  industry: string;
  professionCategory: string;
  country: string;
  city: string;
  timezone: string;
  languages: string[];
  skills: string[];
  interests: string[];
  offers: string[];
  needs: string[];
  networkingGoals: string[];
  customGoal?: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  linkedin?: string;
  website?: string;
  github?: string;
  twitter?: string;
  bookingUrl?: string;
  customLinks?: CustomLink[];
  visibilityPreferences: VisibilityPreferences;
  verified?: boolean;
  verificationProvider?: string;
  verificationType?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NexusRoom {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  organizer: string;
  organization: string;
  coverImage?: string;
  location: string;
  country: string;
  startDate: string;
  endDate: string;
  timezone: string;
  type: 'leadership' | 'conference' | 'accelerator' | 'university' | 'retreat' | 'community';
  accessMode: 'public' | 'unlisted' | 'invite_only';
  inviteCode: string;
  status: 'active' | 'ended' | 'draft' | 'archived';
  categories: string[];
  memberCount: number;
  createdAt: string;
}

export interface RoomMember {
  roomId: string;
  userId: string;
  profileId: string;
  role: 'attendee' | 'speaker' | 'organizer' | 'mentor' | 'investor';
  joinedAt: string;
  networkingGoals: string[];
  customGoal?: string;
  sharedFieldOverrides?: string[];
  profile?: UserProfile;
}

export interface ConnectionRequest {
  id: string;
  requesterUserId: string;
  requesterProfile: UserProfile;
  recipientUserId: string;
  recipientProfile: UserProfile;
  roomId?: string;
  roomName?: string;
  sourceContext: string;
  introMessage?: string;
  requesterSharedFields: string[];
  recipientSharedFields?: string[];
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  createdAt: string;
  respondedAt?: string;
}

export interface Connection {
  id: string;
  participantIds: [string, string];
  profiles: { [userId: string]: UserProfile };
  consentedFields: { [userId: string]: string[] }; // fields shared by userId to the other user
  roomId?: string;
  roomName?: string;
  sourceContext: string;
  connectedAt: string;
  lastInteractionAt: string;
  status: 'active' | 'archived' | 'blocked';
}

export interface StructuredMemoryContext {
  whereWeMet?: string;
  topics?: string[];
  organizationType?: string;
  keyOpportunity?: string;
  commitments?: string[];
  suggestedNextStep?: string;
  followUpCategory?: string;
}

export interface RelationshipMemory {
  id: string;
  ownerUserId: string;
  connectionId: string;
  targetUserId: string;
  targetDisplayName: string;
  rawText: string;
  structuredContext?: StructuredMemoryContext;
  tags: string[];
  opportunityType?: string;
  nextAction?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RelationshipTimelineEvent {
  id: string;
  connectionId: string;
  ownerUserId: string;
  type: 'connected' | 'note' | 'followup_created' | 'followup_completed' | 'meeting' | 'opportunity';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface FollowUpTask {
  id: string;
  ownerUserId: string;
  connectionId: string;
  targetUserId: string;
  targetDisplayName: string;
  targetEmail?: string;
  targetWhatsapp?: string;
  title: string;
  note: string;
  draftMessage?: string;
  style?: 'professional' | 'warm' | 'short' | 'friendly' | 'partnership' | 'investor' | 'mentor' | 'event';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'dismissed';
  createdAt: string;
  completedAt?: string;
}

export interface MatchRecommendation {
  targetUserId: string;
  targetProfile: UserProfile;
  score: number;
  relevanceLabel: 'Highly Relevant' | 'Relevant' | 'Potential Match';
  topReasons: string[];
  opportunity: string;
  suggestedOpener: string;
  complementarySkills: string[];
  sharedGoals: string[];
}

export interface OpportunityCluster {
  id: string;
  title: string;
  description: string;
  category: 'collaborators' | 'education' | 'funding' | 'technical' | 'mentors' | 'followups' | 'dormant';
  count: number;
  connections: {
    connectionId: string;
    targetUser: UserProfile;
    opportunity: string;
    evidence: string[];
    lastInteraction: string;
  }[];
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description: string;
  plan: 'events' | 'community' | 'enterprise';
  rooms: string[];
  members: { userId: string; role: 'owner' | 'admin' | 'organizer' | 'analyst' }[];
  metrics: {
    totalAttendees: number;
    activeRooms: number;
    connectionsMade: number;
    followUpsGenerated: number;
    connectionRate: number;
    matchActivationRate: number;
    crossBorderRate: number;
  };
}

export interface InAppNotification {
  id: string;
  userId: string;
  type: 'connection_request' | 'connection_accepted' | 'followup_due' | 'room_match' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface AgentChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  citations?: string[];
  recommendedPeople?: {
    userId: string;
    profile: UserProfile;
    relevanceReason: string;
    actionType: 'connect' | 'followup' | 'view_memory';
    connectionId?: string;
  }[];
}
