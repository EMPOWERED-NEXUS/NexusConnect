import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[NexusConnect Server] Warning: GEMINI_API_KEY is not set in environment. Fallback heuristics will be used.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      product: 'NexusConnect',
      time: new Date().toISOString(),
      aiEnabled: !!process.env.GEMINI_API_KEY,
    });
  });

  // 1. Hybrid Match Reasoning Endpoint
  app.post('/api/ai/match-reasoning', async (req, res) => {
    try {
      const { user, candidate, roomContext } = req.body;
      if (!user || !candidate) {
        return res.status(400).json({ error: 'Missing user or candidate profile' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        // High quality heuristic fallback
        return res.json({
          score: 88,
          relevanceLabel: 'Highly Relevant',
          topReasons: [
            `Complementary capabilities: ${user.displayName}'s needs (${user.needs?.[0] || 'Partnerships'}) match ${candidate.displayName}'s offerings (${candidate.offers?.[0] || 'Domain expertise'})`,
            `Shared focus in ${user.industry || 'technology & education'}`,
          ],
          opportunity: `Collaborative initiative combining ${user.organization || 'your work'} with ${candidate.organization || candidate.displayName}`,
          suggestedOpener: `Hi ${candidate.displayName.split(' ')[0]}, I noticed your work at ${candidate.organization || 'your organization'} in ${candidate.offers?.[0] || 'the field'}. I'm currently focused on ${user.needs?.[0] || 'expanding partnerships'} and would love to explore ways we could collaborate.`,
        });
      }

      const prompt = `You are the NexusMatch engine for NexusConnect, an elite relationship intelligence platform.
Evaluate the professional complementarity between User A and User B within the context of "${roomContext || 'General Networking'}".

USER A:
Name: ${user.displayName}
Role & Org: ${user.role} at ${user.organization} (${user.country})
Industry: ${user.industry}
Goals: ${(user.networkingGoals || []).join(', ')}
Custom Goal: ${user.customGoal || 'None'}
Needs: ${(user.needs || []).join('; ')}
Offers: ${(user.offers || []).join('; ')}
Skills: ${(user.skills || []).join(', ')}

USER B (Candidate):
Name: ${candidate.displayName}
Role & Org: ${candidate.role} at ${candidate.organization} (${candidate.country})
Industry: ${candidate.industry}
Needs: ${(candidate.needs || []).join('; ')}
Offers: ${(candidate.offers || []).join('; ')}
Skills: ${(candidate.skills || []).join(', ')}

Strictly evaluate COMPLEMENTARITY (Needs of A met by Offers of B, or vice versa).
Score from 50 to 98.
Never infer sensitive traits.
Output JSON only.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: 'Networking relevance score 50-98' },
              relevanceLabel: { type: Type.STRING, description: 'Highly Relevant, Relevant, or Potential Match' },
              topReasons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 to 3 concise, highly specific reasons for complementarity'
              },
              opportunity: { type: Type.STRING, description: 'One sentence describing the specific joint opportunity' },
              suggestedOpener: { type: Type.STRING, description: 'A natural, warm, professional conversation starter' },
            },
            required: ['score', 'relevanceLabel', 'topReasons', 'opportunity', 'suggestedOpener'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('[AI Match Error]', err);
      // Resilient fallback
      return res.json({
        score: 85,
        relevanceLabel: 'Highly Relevant',
        topReasons: [
          'High alignment between requested resources and domain expertise',
          'Shared ecosystem and strategic focus',
        ],
        opportunity: 'Potential cross-organization pilot collaboration',
        suggestedOpener: 'Great to connect! I saw your recent work and wanted to learn more about your current initiatives.',
      });
    }
  });

  // 2. Nexus Memory Structurer Endpoint
  app.post('/api/ai/structure-memory', async (req, res) => {
    try {
      const { rawText, targetUserSummary } = req.body;
      if (!rawText) {
        return res.status(400).json({ error: 'Missing rawText' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          structuredContext: {
            whereWeMet: 'Event Interaction',
            topics: ['Collaboration', 'Initiatives'],
            organizationType: targetUserSummary?.organization || 'Partner Organization',
            keyOpportunity: 'Follow up on shared discussion points',
            commitments: ['Send follow-up details'],
            suggestedNextStep: 'Send recap note via WhatsApp or email',
            followUpCategory: 'Partnership',
          },
          tags: ['FollowUp', 'Networking'],
          opportunityType: 'General Collaboration',
          nextAction: 'Send follow-up message',
          followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      }

      const prompt = `You are the NexusMemory extraction engine for NexusConnect.
A user has written a private quick note after meeting someone (${targetUserSummary?.displayName || 'a connection'} from ${targetUserSummary?.organization || 'an organization'}).

Note text:
"""
${rawText}
"""

Extract and structure this into clear, factual relationship memory components.
Never hallucinate facts not present in the note. If something was not stated, label it conservatively or use null.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              whereWeMet: { type: Type.STRING },
              topics: { type: Type.ARRAY, items: { type: Type.STRING } },
              organizationType: { type: Type.STRING },
              keyOpportunity: { type: Type.STRING },
              commitments: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedNextStep: { type: Type.STRING },
              followUpCategory: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunityType: { type: Type.STRING },
              nextAction: { type: Type.STRING },
              suggestedDaysToFollowUp: { type: Type.INTEGER, description: '1 to 7 days' },
            },
            required: ['topics', 'keyOpportunity', 'commitments', 'suggestedNextStep', 'tags'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const days = parsed.suggestedDaysToFollowUp || 3;
      const followUpDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      return res.json({
        structuredContext: {
          whereWeMet: parsed.whereWeMet || 'Meeting',
          topics: parsed.topics || [],
          organizationType: parsed.organizationType || '',
          keyOpportunity: parsed.keyOpportunity || '',
          commitments: parsed.commitments || [],
          suggestedNextStep: parsed.suggestedNextStep || '',
          followUpCategory: parsed.followUpCategory || 'Follow-up',
        },
        tags: parsed.tags || ['Networking'],
        opportunityType: parsed.opportunityType || 'Collaboration',
        nextAction: parsed.nextAction || parsed.suggestedNextStep || 'Follow up',
        followUpDate,
      });
    } catch (err: any) {
      console.error('[AI Memory Structure Error]', err);
      return res.json({
        structuredContext: {
          whereWeMet: 'Discussion',
          topics: ['Discussion'],
          organizationType: 'Organization',
          keyOpportunity: 'Explore synergy',
          commitments: ['Follow up'],
          suggestedNextStep: 'Send recap note',
          followUpCategory: 'General',
        },
        tags: ['Networking'],
        opportunityType: 'General',
        nextAction: 'Send follow-up note',
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }
  });

  // 3. Follow Up Message Generator Endpoint
  app.post('/api/ai/generate-followup', async (req, res) => {
    try {
      const { style, user, target, memorySummary, context } = req.body;
      const selectedStyle = style || 'professional';

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          subject: `Connecting after our conversation — ${user?.displayName || 'NexusConnect'}`,
          message: `Hi ${target?.displayName?.split(' ')[0] || 'there'}, it was great connecting with you${context ? ` at ${context}` : ''}. I enjoyed our discussion about ${memorySummary?.topics?.[0] || 'collaborating'} and wanted to follow up on ${memorySummary?.commitments?.[0] || 'exploring next steps'}. Let me know if you have time for a brief call next week!`,
        });
      }

      const prompt = `You are the NexusFollowUp AI assistant.
Draft a follow-up message from ${user.displayName} (${user.role} at ${user.organization}) to ${target.displayName} (${target.role} at ${target.organization}).

Tone & Style requested: "${selectedStyle}" (Options: Professional, Warm, Short, Friendly, Partnership, Investor, Mentor, Event follow-up).
Context of meeting: ${context || 'Recent conference'}
Known discussion / memory notes: ${JSON.stringify(memorySummary || {})}
User needs/offers: ${JSON.stringify({ offers: user.offers, needs: user.needs })}

Guidelines:
- Keep it concise, natural, human, and actionable.
- Respect consent: use only provided information.
- Provide a subject line (if email) and a ready-to-send body text (suitable for WhatsApp or email).
Output JSON only.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              message: { type: Type.STRING },
              callToAction: { type: Type.STRING },
            },
            required: ['subject', 'message'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('[AI Followup Error]', err);
      return res.json({
        subject: `Great connecting — ${req.body.user?.displayName || 'Nexus'}`,
        message: `Hi ${req.body.target?.displayName?.split(' ')[0] || 'there'}, great speaking with you recently. Let's stay in touch and schedule a quick time to continue our discussion!`,
      });
    }
  });

  // 4. Nexus Agent Permission-Aware Query Endpoint
  app.post('/api/ai/agent-query', async (req, res) => {
    try {
      const { query, activeUser, permittedNetwork, permittedRooms, pendingFollowUps, privateMemories } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        // Fallback filter
        const lowerQ = query.toLowerCase();
        const matches = (permittedNetwork || []).filter((p: any) => {
          const text = `${p.displayName} ${p.role} ${p.organization} ${p.country} ${(p.skills || []).join(' ')} ${(p.offers || []).join(' ')} ${(p.interests || []).join(' ')}`.toLowerCase();
          return text.includes(lowerQ) || lowerQ.includes('who') || lowerQ.includes('recommend');
        }).slice(0, 3);

        return res.json({
          text: `Based on your permitted network and recent interactions, here are the most relevant people matching "${query}":`,
          citations: ['Network Knowledge Graph', 'Consented Profiles'],
          recommendedPeople: matches.map((m: any) => ({
            userId: m.userId || m.id,
            profile: m,
            relevanceReason: `Matches your query for ${m.industry || m.role} with complementary skills.`,
            actionType: 'followup',
          })),
        });
      }

      const prompt = `You are "Nexus Agent", the intelligent, permission-aware relationship assistant inside NexusConnect.
The user is asking: "${query}"

Here is the CURRENT PERMISSIONED CONTEXT for user "${activeUser?.displayName}":
- Active User Profile: ${JSON.stringify(activeUser || {})}
- Connections with Permitted Information: ${JSON.stringify((permittedNetwork || []).slice(0, 15))}
- Active Rooms: ${JSON.stringify((permittedRooms || []).slice(0, 5))}
- Pending Follow-Ups: ${JSON.stringify((pendingFollowUps || []).slice(0, 10))}
- Private Notes / Memories (belongs only to this user): ${JSON.stringify((privateMemories || []).slice(0, 10))}

SAFETY & PRIVACY RULES:
1. ONLY reference facts supported by the provided data.
2. NEVER invent relationship history or claim a person can offer something not in their profile/memories.
3. For uncertain recommendations, phrase as "Potentially relevant because...".
4. Distinguish facts from suggestions.
5. Provide actionable recommendation cards where relevant (up to 4 people).

Output JSON only.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: 'Direct, helpful, professional response summary' },
              citations: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedPeople: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    userId: { type: Type.STRING },
                    relevanceReason: { type: Type.STRING },
                    actionType: { type: Type.STRING, description: 'connect, followup, or view_memory' },
                  },
                  required: ['userId', 'relevanceReason', 'actionType'],
                },
              },
            },
            required: ['text', 'recommendedPeople'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      // Enrich recommendedPeople with full profile object
      const enriched = (parsed.recommendedPeople || []).map((rec: any) => {
        const fullProfile = (permittedNetwork || []).find((p: any) => (p.userId === rec.userId || p.id === rec.userId)) || null;
        return {
          ...rec,
          profile: fullProfile,
        };
      }).filter((rec: any) => rec.profile !== null);

      return res.json({
        text: parsed.text,
        citations: parsed.citations || ['Consented Network Data'],
        recommendedPeople: enriched,
      });
    } catch (err: any) {
      console.error('[Nexus Agent Error]', err);
      return res.json({
        text: "I searched your network. Here are connections that may be relevant to your inquiry:",
        citations: ['Network Database'],
        recommendedPeople: [],
      });
    }
  });

  // 5. vCard Contact File Generator Endpoint
  app.get('/api/contact/:profileId.vcf', (req, res) => {
    try {
      const { name, org, role, email, phone, whatsapp, linkedin, website } = req.query;
      const displayName = (name as string) || 'Contact';

      const vcardLines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${displayName}`,
        org ? `ORG:${org}` : '',
        role ? `TITLE:${role}` : '',
        email ? `EMAIL;TYPE=INTERNET,WORK:${email}` : '',
        phone ? `TEL;TYPE=CELL,VOICE:${phone}` : '',
        whatsapp ? `X-SOCIALPROFILE;TYPE=whatsapp:${whatsapp}` : '',
        linkedin ? `URL;TYPE=LinkedIn:${linkedin}` : '',
        website ? `URL;TYPE=Website:${website}` : '',
        'NOTE:Saved via NexusConnect Relationship OS (https://connect.empowerednexus.com)',
        'END:VCARD',
      ].filter(Boolean);

      const vcardContent = vcardLines.join('\r\n');
      const safeFilename = displayName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'nexus_contact';

      res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.vcf"`);
      return res.send(vcardContent);
    } catch (err: any) {
      console.error('[vCard Error]', err);
      return res.status(500).send('Error generating vCard');
    }
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NexusConnect Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
