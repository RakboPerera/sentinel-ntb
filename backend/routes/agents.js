import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { creditPrompt } from '../prompts/credit.js';
import { transactionPrompt } from '../prompts/transaction.js';
import { suspensePrompt } from '../prompts/suspense.js';
import { kycPrompt } from '../prompts/kyc.js';
import { internalControlsPrompt } from '../prompts/internalControls.js';
import { digitalFraudPrompt } from '../prompts/digitalFraud.js';
import { tradeTreasuryPrompt } from '../prompts/tradeTreasury.js';
import { insiderRiskPrompt } from '../prompts/insiderRisk.js';
import { mjePrompt } from '../prompts/mje.js';

const router = Router();

const PROMPTS = {
  credit: creditPrompt,
  transaction: transactionPrompt,
  suspense: suspensePrompt,
  kyc: kycPrompt,
  controls: internalControlsPrompt,
  digital: digitalFraudPrompt,
  trade: tradeTreasuryPrompt,
  insider: insiderRiskPrompt,
  mje: mjePrompt,
};

router.post('/:agentName', async (req, res) => {
  const { agentName } = req.params;
  const apiKey = req.headers['x-api-key'];
  const { data, context } = req.body;

  if (!apiKey) return res.status(401).json({ error: 'API key required. Enter your Anthropic API key in Settings.' });
  if (!PROMPTS[agentName]) return res.status(400).json({ error: `Unknown agent: ${agentName}` });
  if (!data || !Array.isArray(data) || data.length === 0) return res.status(400).json({ error: 'No data provided. Please upload a valid CSV file.' });

  const prompt = PROMPTS[agentName];
  const userMessage = `Analyze the following data and return ONLY valid JSON matching the schema defined in your instructions. Do not include any text before or after the JSON object.\n\nData (${data.length} records):\n${JSON.stringify(data, null, 2)}${context ? `\n\nAdditional context: ${context}` : ''}`;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: prompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const rawText = message.content[0].text.trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Agent did not return valid JSON');
    const result = JSON.parse(jsonMatch[0]);
    res.json({ success: true, agentName, result, timestamp: new Date().toISOString() });
  } catch (err) {
    if (err.status === 401) return res.status(401).json({ error: 'Invalid API key. Please check your Anthropic API key in Settings.' });
    if (err.status === 429) return res.status(429).json({ error: 'Rate limit reached. Please wait a moment and try again.' });
    console.error(`Agent ${agentName} error:`, err.message);
    res.status(500).json({ error: `Agent analysis failed: ${err.message}` });
  }
});

export default router;
