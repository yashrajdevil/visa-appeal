const CREEM_API_KEY = (process.env.CREEM_API_KEY || '').trim();

const isTestKey = CREEM_API_KEY.startsWith('creem_test');
const CREEM_API_URL = isTestKey ? 'https://test-api.creem.io/v1' : 'https://api.creem.io/v1';

function getCreemApiKey(): string {
  return CREEM_API_KEY;
}

export async function createCheckoutSession(params: {
  plan: 'starter' | 'standard' | 'premium';
  uid: string;
  caseId: string;
  successUrl: string;
}) {
  const apiKey = getCreemApiKey();
  if (!apiKey) {
    throw new Error('CREEM_API_KEY is not configured');
  }

  const priceId = getPriceId(params.plan);

  const requestBody = {
    product_id: priceId,
    success_url: params.successUrl,
    request_id: params.caseId,
    metadata: {
      uid: params.uid,
      caseId: params.caseId,
      plan: params.plan,
    },
  };

  const endpointUrl = `${CREEM_API_URL}/checkouts`;

  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(`Creem API error: ${response.status} ${responseBody}`);
  }

  const parsed = JSON.parse(responseBody);
  return parsed as { checkout_url: string; id: string };
}

import crypto from 'crypto';

export async function verifyWebhookSignature(body: string, signature: string): Promise<boolean> {
  const secret = (process.env.CREEM_WEBHOOK_SECRET || '').trim();
  if (!secret) return false;

  try {
    const computed = crypto.createHmac('sha256', secret).update(body).digest('hex');
    const match = crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(signature, 'hex'));
    return match;
  } catch (err) {
    console.error('[Webhook] Signature verification error:', err);
    return false;
  }
}

function getPriceId(plan: string): string {
  const raw = (() => {
    switch (plan) {
      case 'starter': return process.env.CREEM_STARTER_PRICE_ID || '';
      case 'standard': return process.env.CREEM_STANDARD_PRICE_ID || '';
      case 'premium': return process.env.CREEM_PREMIUM_PRICE_ID || '';
      default: return '';
    }
  })();
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error(`No price_id configured for plan: ${plan}`);
  }
  return trimmed;
}
