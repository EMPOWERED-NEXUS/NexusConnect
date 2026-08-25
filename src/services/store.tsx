import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  NexusRoom,
  RoomMember,
  Connection,
  ConnectionRequest,
  RelationshipMemory,
  RelationshipTimelineEvent,
  FollowUpTask,
  Organization,
  InAppNotification,
  VisibilityPreferences,
} from '../types';
import {
  SEED_PROFILES,
  SEED_ROOMS,
  SEED_ROOM_MEMBERS,
  SEED_CONNECTIONS,
  SEED_MEMORIES,
  SEED_TIMELINE,
  SEED_FOLLOWUPS,
  SEED_ORGANIZATIONS,
  SEED_NOTIFICATIONS,
  DEFAULT_VISIBILITY,
} from '../data/seedData';

interface StoreContextType {
  // Active User / Demo Switcher
  activeUser: UserProfile;
  setActiveUserById: (userId: string) => void;
  availableProfiles: UserProfile[];

  // Profiles & Preferences
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateVisibilityPreferences: (prefs: Partial<VisibilityPreferences>) => void;
  getProfileByIdOrSlug: (idOrSlug: string) => UserProfile | undefined;
  getPermittedFieldsForViewer: (targetProfile: UserProfile, viewerUserId: string) => {
    profile: Partial<UserProfile>;
    consentedFieldList: string[];
    isConnected: boolean;
    hasPendingRequest: boolean;
    incomingRequest?: ConnectionRequest;
    outgoingRequest?: ConnectionRequest;
  };

  // Rooms
  rooms: NexusRoom[];
  roomMembers: RoomMember[];
  getRoomBySlug: (slug: string) => NexusRoom | undefined;
  joinRoom: (roomId: string, goals: string[], customGoal?: string) => void;
  isMemberOfRoom: (roomId: string, userId?: string) => boolean;
  getRoomAttendees: (roomId: string) => UserProfile[];

  // Connections & Exchange
  connections: Connection[];
  connectionRequests: ConnectionRequest[];
  sendConnectionRequest: (params: {
    recipientUserId: string;
    sharedFields: string[];
    introMessage?: string;
    roomId?: string;
    sourceContext?: string;
  }) => string;
  respondToConnectionRequest: (requestId: string, accept: boolean, recipientSharedFields?: string[]) => void;
  disconnectUser: (connectionId: string) => void;
  getConnectionBetween: (userId1: string, userId2: string) => Connection | undefined;

  // Nexus Memories
  memories: RelationshipMemory[];
  addMemory: (memory: Omit<RelationshipMemory, 'id' | 'createdAt' | 'updatedAt' | 'ownerUserId'>) => RelationshipMemory;
  updateMemory: (id: string, updates: Partial<RelationshipMemory>) => void;
  deleteMemory: (id: string) => void;
  getMemoriesForConnection: (connectionId: string) => RelationshipMemory[];

  // Timeline
  timeline: RelationshipTimelineEvent[];
  getTimelineForConnection: (connectionId: string) => RelationshipTimelineEvent[];

  // Follow Ups
  followUps: FollowUpTask[];
  addFollowUp: (task: Omit<FollowUpTask, 'id' | 'createdAt' | 'ownerUserId'>) => FollowUpTask;
  updateFollowUp: (id: string, updates: Partial<FollowUpTask>) => void;
  deleteFollowUp: (id: string) => void;
  toggleFollowUpStatus: (id: string) => void;

  // Organizations
  organizations: Organization[];

  // Notifications
  notifications: InAppNotification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Privacy & Data
  blockedUserIds: string[];
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  exportUserData: () => string;
  deleteAccount: () => void;
  resetToInitialDemoData: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY_PREFIX = 'nexusconnect_v1_';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage loaded states with fallbacks to seed data
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}profiles`);
    return saved ? JSON.parse(saved) : SEED_PROFILES;
  });

  const [activeUserId, setActiveUserId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}activeUserId`);
    return saved || SEED_PROFILES[0].userId; // Amanda Kwesi by default
  });

  const [rooms, setRooms] = useState<NexusRoom[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}rooms`);
    return saved ? JSON.parse(saved) : SEED_ROOMS;
  });

  const [roomMembers, setRoomMembers] = useState<RoomMember[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}roomMembers`);
    return saved ? JSON.parse(saved) : SEED_ROOM_MEMBERS;
  });

  const [connections, setConnections] = useState<Connection[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}connections`);
    return saved ? JSON.parse(saved) : SEED_CONNECTIONS;
  });

  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}requests`);
    return saved ? JSON.parse(saved) : [];
  });

  const [memories, setMemories] = useState<RelationshipMemory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}memories`);
    return saved ? JSON.parse(saved) : SEED_MEMORIES;
  });

  const [timeline, setTimeline] = useState<RelationshipTimelineEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}timeline`);
    return saved ? JSON.parse(saved) : SEED_TIMELINE;
  });

  const [followUps, setFollowUps] = useState<FollowUpTask[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}followUps`);
    return saved ? JSON.parse(saved) : SEED_FOLLOWUPS;
  });

  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}organizations`);
    return saved ? JSON.parse(saved) : SEED_ORGANIZATIONS;
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
  });

  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}blocked`);
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}profiles`, JSON.stringify(profiles));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}activeUserId`, activeUserId);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}rooms`, JSON.stringify(rooms));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}roomMembers`, JSON.stringify(roomMembers));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}connections`, JSON.stringify(connections));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}requests`, JSON.stringify(connectionRequests));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}memories`, JSON.stringify(memories));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}timeline`, JSON.stringify(timeline));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}followUps`, JSON.stringify(followUps));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}organizations`, JSON.stringify(organizations));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}notifications`, JSON.stringify(notifications));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}blocked`, JSON.stringify(blockedUserIds));
  }, [
    profiles,
    activeUserId,
    rooms,
    roomMembers,
    connections,
    connectionRequests,
    memories,
    timeline,
    followUps,
    organizations,
    notifications,
    blockedUserIds,
  ]);

  const activeUser = profiles.find(p => p.userId === activeUserId) || profiles[0];

  const setActiveUserById = (userId: string) => {
    const exists = profiles.find(p => p.userId === userId);
    if (exists) {
      setActiveUserId(userId);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfiles(prev =>
      prev.map(p => {
        if (p.userId === activeUserId) {
          return { ...p, ...updates, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  const updateVisibilityPreferences = (prefs: Partial<VisibilityPreferences>) => {
    setProfiles(prev =>
      prev.map(p => {
        if (p.userId === activeUserId) {
          return {
            ...p,
            visibilityPreferences: { ...p.visibilityPreferences, ...prefs },
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  };

  const getProfileByIdOrSlug = (idOrSlug: string): UserProfile | undefined => {
    return profiles.find(p => p.id === idOrSlug || p.userId === idOrSlug || p.slug === idOrSlug);
  };

  const getConnectionBetween = (userId1: string, userId2: string): Connection | undefined => {
    return connections.find(
      c => c.status === 'active' && c.participantIds.includes(userId1) && c.participantIds.includes(userId2)
    );
  };

  const getPermittedFieldsForViewer = (targetProfile: UserProfile, viewerUserId: string) => {
    const isSelf = targetProfile.userId === viewerUserId;
    const connection = getConnectionBetween(targetProfile.userId, viewerUserId);
    const isConnected = !!connection;

    const incomingRequest = connectionRequests.find(
      r => r.recipientUserId === viewerUserId && r.requesterUserId === targetProfile.userId && r.status === 'pending'
    );
    const outgoingRequest = connectionRequests.find(
      r => r.requesterUserId === viewerUserId && r.recipientUserId === targetProfile.userId && r.status === 'pending'
    );

    // List of standard field names
    const allFieldKeys = [
      'displayName',
      'headline',
      'bio',
      'organization',
      'role',
      'country',
      'city',
      'timezone',
      'languages',
      'skills',
      'interests',
      'offers',
      'needs',
      'email',
      'phone',
      'whatsapp',
      'linkedin',
      'website',
      'github',
      'twitter',
    ];

    if (isSelf) {
      return {
        profile: targetProfile,
        consentedFieldList: allFieldKeys,
        isConnected: false,
        hasPendingRequest: false,
      };
    }

    const permittedProfile: Partial<UserProfile> = {
      id: targetProfile.id,
      userId: targetProfile.userId,
      slug: targetProfile.slug,
      displayName: targetProfile.displayName,
      headline: targetProfile.headline,
      bio: targetProfile.bio,
      initials: targetProfile.initials,
      organization: targetProfile.organization,
      role: targetProfile.role,
      country: targetProfile.country,
      city: targetProfile.city,
      timezone: targetProfile.timezone,
      languages: targetProfile.languages,
      verified: targetProfile.verified,
      verificationProvider: targetProfile.verificationProvider,
      verificationType: targetProfile.verificationType,
      createdAt: targetProfile.createdAt,
      updatedAt: targetProfile.updatedAt,
      visibilityPreferences: targetProfile.visibilityPreferences,
    };

    const consentedFieldList: string[] = [
      'displayName',
      'headline',
      'bio',
      'organization',
      'role',
      'country',
      'city',
    ];

    // If connected, read the exact consented fields stored in the connection snapshot for targetProfile
    const connectionConsented = connection?.consentedFields?.[targetProfile.userId] || [];

    const checkField = (
      fieldName: keyof VisibilityPreferences,
      value: any,
      pref: string
    ) => {
      const allowedByConnection = isConnected && connectionConsented.includes(fieldName);
      const allowedByPublic = pref === 'public';
      const allowedByConnections = isConnected && (pref === 'connections' || allowedByConnection);

      if (allowedByConnection || allowedByPublic || allowedByConnections) {
        (permittedProfile as any)[fieldName] = value;
        consentedFieldList.push(fieldName);
      }
    };

    const prefs = targetProfile.visibilityPreferences || DEFAULT_VISIBILITY;
    checkField('skills', targetProfile.skills, prefs.skills);
    checkField('offers', targetProfile.offers, prefs.offers);
    checkField('needs', targetProfile.needs, prefs.needs);
    checkField('email', targetProfile.email, prefs.email);
    checkField('phone', targetProfile.phone, prefs.phone);
    checkField('whatsapp', targetProfile.whatsapp, prefs.whatsapp);
    checkField('linkedin', targetProfile.linkedin, prefs.linkedin);
    checkField('website', targetProfile.website, prefs.website);
    checkField('github', targetProfile.github, prefs.github);

    return {
      profile: permittedProfile,
      consentedFieldList,
      isConnected,
      hasPendingRequest: !!outgoingRequest || !!incomingRequest,
      incomingRequest,
      outgoingRequest,
    };
  };

  const getRoomBySlug = (slug: string) => {
    return rooms.find(r => r.slug === slug || r.id === slug);
  };

  const isMemberOfRoom = (roomId: string, userId = activeUserId) => {
    return roomMembers.some(m => m.roomId === roomId && m.userId === userId);
  };

  const joinRoom = (roomId: string, goals: string[], customGoal?: string) => {
    if (isMemberOfRoom(roomId, activeUserId)) return;
    const newMember: RoomMember = {
      roomId,
      userId: activeUserId,
      profileId: activeUser.id,
      role: 'attendee',
      joinedAt: new Date().toISOString(),
      networkingGoals: goals,
      customGoal,
    };
    setRoomMembers(prev => [...prev, newMember]);
    setRooms(prev =>
      prev.map(r => (r.id === roomId ? { ...r, memberCount: r.memberCount + 1 } : r))
    );
  };

  const getRoomAttendees = (roomId: string): UserProfile[] => {
    const memberUserIds = roomMembers.filter(m => m.roomId === roomId).map(m => m.userId);
    return profiles.filter(p => memberUserIds.includes(p.userId) && !blockedUserIds.includes(p.userId));
  };

  const sendConnectionRequest = (params: {
    recipientUserId: string;
    sharedFields: string[];
    introMessage?: string;
    roomId?: string;
    sourceContext?: string;
  }): string => {
    const recipient = profiles.find(p => p.userId === params.recipientUserId);
    if (!recipient) throw new Error('Recipient not found');

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newReq: ConnectionRequest = {
      id: requestId,
      requesterUserId: activeUserId,
      requesterProfile: activeUser,
      recipientUserId: params.recipientUserId,
      recipientProfile: recipient,
      roomId: params.roomId,
      roomName: params.roomId ? rooms.find(r => r.id === params.roomId)?.name : undefined,
      sourceContext: params.sourceContext || (params.roomId ? `Met via ${rooms.find(r => r.id === params.roomId)?.name}` : 'Direct NexusConnect exchange'),
      introMessage: params.introMessage,
      requesterSharedFields: params.sharedFields,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setConnectionRequests(prev => [newReq, ...prev]);

    // Create notification for recipient
    const notif: InAppNotification = {
      id: `notif_${Date.now()}`,
      userId: params.recipientUserId,
      type: 'connection_request',
      title: `${activeUser.displayName} sent you a connection request`,
      body: params.introMessage || `Shared contact details from ${activeUser.organization}`,
      read: false,
      createdAt: new Date().toISOString(),
      data: { requestId },
    };
    setNotifications(prev => [notif, ...prev]);

    return requestId;
  };

  const respondToConnectionRequest = (
    requestId: string,
    accept: boolean,
    recipientSharedFields?: string[]
  ) => {
    const request = connectionRequests.find(r => r.id === requestId);
    if (!request) return;

    if (!accept) {
      setConnectionRequests(prev =>
        prev.map(r => (r.id === requestId ? { ...r, status: 'declined', respondedAt: new Date().toISOString() } : r))
      );
      return;
    }

    // Accept & create mutual connection record
    const connectionId = `conn_${Date.now()}`;
    const requester = profiles.find(p => p.userId === request.requesterUserId) || request.requesterProfile;
    const recipient = profiles.find(p => p.userId === request.recipientUserId) || request.recipientProfile;

    const defaultShared = ['displayName', 'headline', 'organization', 'role', 'email', 'linkedin', 'whatsapp'];
    const chosenRecipientFields = recipientSharedFields || defaultShared;

    const newConnection: Connection = {
      id: connectionId,
      participantIds: [request.requesterUserId, request.recipientUserId],
      profiles: {
        [request.requesterUserId]: requester,
        [request.recipientUserId]: recipient,
      },
      consentedFields: {
        [request.requesterUserId]: request.requesterSharedFields,
        [request.recipientUserId]: chosenRecipientFields,
      },
      roomId: request.roomId,
      roomName: request.roomName,
      sourceContext: request.sourceContext,
      connectedAt: new Date().toISOString(),
      lastInteractionAt: new Date().toISOString(),
      status: 'active',
    };

    setConnections(prev => [newConnection, ...prev]);

    // Update request state
    setConnectionRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'accepted', respondedAt: new Date().toISOString(), recipientSharedFields: chosenRecipientFields } : r))
    );

    // Add initial timeline event for both users
    const timelineEvent: RelationshipTimelineEvent = {
      id: `tl_${Date.now()}`,
      connectionId,
      ownerUserId: request.recipientUserId,
      type: 'connected',
      title: 'Connected & Exchanged Information',
      description: `Mutual contact exchange established with ${requester.displayName} (${request.sourceContext})`,
      timestamp: new Date().toISOString(),
    };
    setTimeline(prev => [timelineEvent, ...prev]);

    // Notification to requester
    const notif: InAppNotification = {
      id: `notif_${Date.now()}`,
      userId: request.requesterUserId,
      type: 'connection_accepted',
      title: `${recipient.displayName} accepted your connection request!`,
      body: `You are now mutually connected and can access permitted contact information.`,
      read: false,
      createdAt: new Date().toISOString(),
      data: { connectionId },
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const disconnectUser = (connectionId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connectionId));
  };

  const addMemory = (memoryData: Omit<RelationshipMemory, 'id' | 'createdAt' | 'updatedAt' | 'ownerUserId'>): RelationshipMemory => {
    const newMemory: RelationshipMemory = {
      ...memoryData,
      id: `mem_${Date.now()}`,
      ownerUserId: activeUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMemories(prev => [newMemory, ...prev]);

    // Also add to private timeline
    const timelineItem: RelationshipTimelineEvent = {
      id: `tl_${Date.now()}`,
      connectionId: memoryData.connectionId,
      ownerUserId: activeUserId,
      type: 'note',
      title: 'Private Memory Recorded',
      description: memoryData.rawText.length > 90 ? `${memoryData.rawText.substring(0, 90)}...` : memoryData.rawText,
      timestamp: new Date().toISOString(),
    };
    setTimeline(prev => [timelineItem, ...prev]);

    return newMemory;
  };

  const updateMemory = (id: string, updates: Partial<RelationshipMemory>) => {
    setMemories(prev =>
      prev.map(m => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );
  };

  const deleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const getMemoriesForConnection = (connectionId: string) => {
    return memories.filter(m => m.connectionId === connectionId && m.ownerUserId === activeUserId);
  };

  const getTimelineForConnection = (connectionId: string) => {
    return timeline
      .filter(t => t.connectionId === connectionId && (t.ownerUserId === activeUserId || !t.ownerUserId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const addFollowUp = (taskData: Omit<FollowUpTask, 'id' | 'createdAt' | 'ownerUserId'>): FollowUpTask => {
    const newTask: FollowUpTask = {
      ...taskData,
      id: `fu_${Date.now()}`,
      ownerUserId: activeUserId,
      createdAt: new Date().toISOString(),
    };
    setFollowUps(prev => [newTask, ...prev]);

    const timelineItem: RelationshipTimelineEvent = {
      id: `tl_${Date.now()}`,
      connectionId: taskData.connectionId,
      ownerUserId: activeUserId,
      type: 'followup_created',
      title: 'Follow-Up Scheduled',
      description: `${taskData.title} (Due: ${taskData.dueDate})`,
      timestamp: new Date().toISOString(),
    };
    setTimeline(prev => [timelineItem, ...prev]);

    return newTask;
  };

  const updateFollowUp = (id: string, updates: Partial<FollowUpTask>) => {
    setFollowUps(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
  };

  const deleteFollowUp = (id: string) => {
    setFollowUps(prev => prev.filter(f => f.id !== id));
  };

  const toggleFollowUpStatus = (id: string) => {
    setFollowUps(prev =>
      prev.map(f => {
        if (f.id === id) {
          const isDone = f.status === 'completed';
          return {
            ...f,
            status: isDone ? 'pending' : 'completed',
            completedAt: isDone ? undefined : new Date().toISOString(),
          };
        }
        return f;
      })
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const blockUser = (userId: string) => {
    setBlockedUserIds(prev => Array.from(new Set([...prev, userId])));
    // Disconnect if currently connected
    setConnections(prev => prev.filter(c => !c.participantIds.includes(userId)));
  };

  const unblockUser = (userId: string) => {
    setBlockedUserIds(prev => prev.filter(id => id !== userId));
  };

  const exportUserData = (): string => {
    const userPayload = {
      profile: activeUser,
      connections: connections.filter(c => c.participantIds.includes(activeUserId)),
      memories: memories.filter(m => m.ownerUserId === activeUserId),
      followUps: followUps.filter(f => f.ownerUserId === activeUserId),
      timeline: timeline.filter(t => t.ownerUserId === activeUserId),
      rooms: roomMembers.filter(m => m.userId === activeUserId),
      exportedAt: new Date().toISOString(),
      platform: 'NexusConnect',
    };
    return JSON.stringify(userPayload, null, 2);
  };

  const deleteAccount = () => {
    setProfiles(prev => prev.filter(p => p.userId !== activeUserId));
    setConnections(prev => prev.filter(c => !c.participantIds.includes(activeUserId)));
    setMemories(prev => prev.filter(m => m.ownerUserId !== activeUserId));
    setFollowUps(prev => prev.filter(f => f.ownerUserId !== activeUserId));
    setTimeline(prev => prev.filter(t => t.ownerUserId !== activeUserId));
    setRoomMembers(prev => prev.filter(m => m.userId !== activeUserId));
    const nextUser = profiles.find(p => p.userId !== activeUserId) || SEED_PROFILES[0];
    setActiveUserId(nextUser.userId);
  };

  const resetToInitialDemoData = () => {
    localStorage.clear();
    setProfiles(SEED_PROFILES);
    setActiveUserId(SEED_PROFILES[0].userId);
    setRooms(SEED_ROOMS);
    setRoomMembers(SEED_ROOM_MEMBERS);
    setConnections(SEED_CONNECTIONS);
    setConnectionRequests([]);
    setMemories(SEED_MEMORIES);
    setTimeline(SEED_TIMELINE);
    setFollowUps(SEED_FOLLOWUPS);
    setOrganizations(SEED_ORGANIZATIONS);
    setNotifications(SEED_NOTIFICATIONS);
    setBlockedUserIds([]);
  };

  return (
    <StoreContext.Provider
      value={{
        activeUser,
        setActiveUserById,
        availableProfiles: profiles,
        updateProfile,
        updateVisibilityPreferences,
        getProfileByIdOrSlug,
        getPermittedFieldsForViewer,
        rooms,
        roomMembers,
        getRoomBySlug,
        joinRoom,
        isMemberOfRoom,
        getRoomAttendees,
        connections,
        connectionRequests,
        sendConnectionRequest,
        respondToConnectionRequest,
        disconnectUser,
        getConnectionBetween,
        memories,
        addMemory,
        updateMemory,
        deleteMemory,
        getMemoriesForConnection,
        timeline,
        getTimelineForConnection,
        followUps,
        addFollowUp,
        updateFollowUp,
        deleteFollowUp,
        toggleFollowUpStatus,
        organizations,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        blockedUserIds,
        blockUser,
        unblockUser,
        exportUserData,
        deleteAccount,
        resetToInitialDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
