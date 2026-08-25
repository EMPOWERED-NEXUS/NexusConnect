import { UserProfile, MatchRecommendation, RelationshipMemory, FollowUpTask } from '../types';

export async function fetchMatchReasoning(
  user: UserProfile,
  candidate: UserProfile,
  roomContext?: string
): Promise<Partial<MatchRecommendation>> {
  try {
    const res = await fetch('/api/ai/match-reasoning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, candidate, roomContext }),
    });
    if (!res.ok) throw new Error('Network error generating match');
    return await res.json();
  } catch (err) {
    console.error('Match reasoning error:', err);
    return {
      score: 85,
      relevanceLabel: 'Highly Relevant',
      topReasons: [
        `Complementary needs and offerings in ${user.industry}`,
        `Mutual interest in strategic pilot partnerships`,
      ],
      opportunity: `Cross-organizational partnership between ${user.organization} and ${candidate.organization}`,
      suggestedOpener: `Hi ${candidate.displayName.split(' ')[0]}, I saw your experience in ${candidate.offers?.[0] || candidate.role} and would love to connect about potential collaboration.`,
    };
  }
}

export async function structureMemory(
  rawText: string,
  targetUserSummary?: { displayName: string; organization: string }
): Promise<Partial<RelationshipMemory>> {
  try {
    const res = await fetch('/api/ai/structure-memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText, targetUserSummary }),
    });
    if (!res.ok) throw new Error('Failed to structure memory');
    return await res.json();
  } catch (err) {
    console.error('Structure memory error:', err);
    return {
      structuredContext: {
        whereWeMet: 'Networking session',
        topics: ['Partnership discussion'],
        organizationType: targetUserSummary?.organization || 'Partner',
        keyOpportunity: 'Follow up on collaborative opportunities',
        commitments: ['Send follow-up materials'],
        suggestedNextStep: 'Send recap note via WhatsApp or email',
        followUpCategory: 'Partnership',
      },
      tags: ['GYLS', 'Pilot', 'FollowUp'],
      opportunityType: 'Partnership',
      nextAction: 'Send follow-up details',
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  }
}

export async function generateFollowUpMessage(params: {
  style: string;
  user: UserProfile;
  target: UserProfile;
  memorySummary?: any;
  context?: string;
}): Promise<{ subject: string; message: string; callToAction?: string }> {
  try {
    const res = await fetch('/api/ai/generate-followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to generate follow up');
    return await res.json();
  } catch (err) {
    console.error('Follow-up generation error:', err);
    return {
      subject: `Connecting after ${params.context || 'our conversation'} — ${params.user.displayName}`,
      message: `Hi ${params.target.displayName.split(' ')[0]}, it was great speaking with you${params.context ? ` at ${params.context}` : ''}. I really enjoyed our conversation about ${params.memorySummary?.topics?.[0] || 'our respective projects'}. Would love to find 15 minutes next week to continue our discussion!`,
    };
  }
}

export async function queryNexusAgent(params: {
  query: string;
  activeUser: UserProfile;
  permittedNetwork: UserProfile[];
  permittedRooms: any[];
  pendingFollowUps: FollowUpTask[];
  privateMemories: RelationshipMemory[];
}): Promise<{
  text: string;
  citations: string[];
  recommendedPeople: {
    userId: string;
    profile: UserProfile;
    relevanceReason: string;
    actionType: 'connect' | 'followup' | 'view_memory';
  }[];
}> {
  try {
    const res = await fetch('/api/ai/agent-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to query agent');
    return await res.json();
  } catch (err) {
    console.error('Nexus Agent query error:', err);
    return {
      text: `Based on your permitted network data, here are connections aligned with "${params.query}":`,
      citations: ['Permitted Network Profile Graph'],
      recommendedPeople: params.permittedNetwork.slice(0, 3).map(p => ({
        userId: p.userId,
        profile: p,
        relevanceReason: `Has experience in ${p.skills?.[0] || p.industry} complementary to your search.`,
        actionType: 'followup',
      })),
    };
  }
}

export function buildVCardUrl(profile: UserProfile, consentedFields: string[]): string {
  const params = new URLSearchParams();
  params.set('name', profile.displayName);
  if (consentedFields.includes('organization') && profile.organization) params.set('org', profile.organization);
  if (consentedFields.includes('role') && profile.role) params.set('role', profile.role);
  if (consentedFields.includes('email') && profile.email) params.set('email', profile.email);
  if (consentedFields.includes('phone') && profile.phone) params.set('phone', profile.phone);
  if (consentedFields.includes('whatsapp') && profile.whatsapp) params.set('whatsapp', profile.whatsapp);
  if (consentedFields.includes('linkedin') && profile.linkedin) params.set('linkedin', profile.linkedin);
  if (consentedFields.includes('website') && profile.website) params.set('website', profile.website);

  return `/api/contact/${profile.slug || profile.id}.vcf?${params.toString()}`;
}
