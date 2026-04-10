import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { orchestratorPrompt } from '../prompts/orchestrator.js';

const router = Router();

router.post('/', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  const { signals, agentSummaries } = req.body;

  if (!apiKey) return res.status(401).json({ error: 'API key required.' });
  if (!signals || signals.length < 2) return res.status(400).json({ error: 'At least 2 agent signals required for orchestration.' });

  const userMessage = `Analyze the following cross-agent signals and return ONLY valid JSON.\n\nAgent signals:\n${JSON.stringify(signals, null, 2)}\n\nAgent summaries:\n${JSON.stringify(agentSummaries || {}, null, 2)}`;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: orchestratorPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const rawText = message.content[0].text.trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Orchestrator did not return valid JSON');
    const result = JSON.parse(jsonMatch[0]);
    res.json({ success: true, result, timestamp: new Date().toISOString() });
  } catch (err) {
    if (err.status === 401) return res.status(401).json({ error: 'Invalid API key.' });
    console.error('Orchestrator error:', err.message);
    res.status(500).json({ error: `Orchestration failed: ${err.message}` });
  }
});

export default router;
