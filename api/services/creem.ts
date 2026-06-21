console.log('BOOT TRACE - api/services/creem.ts loaded');
const CREEM_API_URL = 'https://api.creem.io/v1';

function getCreemApiKey(): string {
  return process.env.CREEM_API_KEY || '';
}

export async function createCheckoutSession(params: {
  plan: 'starter' | 'standard' | 'premium';
  uid: string;
  caseId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const apiKey = getCreemApiKey();
  if (!apiKey) {
    throw new Error('CREEM_API_KEY is not configured');
  }

  const priceId = getPriceId(params.plan);

  const response = await fetch(`${CREEM_API_URL}/checkout-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      price_id: priceId,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        uid: params.uid,
        caseId: params.caseId,
        plan: params.plan,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Creem API error: ${response.status} ${err}`);
  }

  return response.json() as Promise<{ checkout_url: string; id: string }>;
}

export async function verifyWebhookSignature(body: string, signature: string): Promise<boolean> {
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const sigBytes = new Uint8Array(signature.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(body));
}

function getPriceId(plan: string): string {
  switch (plan) {
    case 'starter':
      return process.env.CREEM_STARTER_PRICE_ID || '';
    case 'standard':
      return process.env.CREEM_STANDARD_PRICE_ID || '';
    case 'premium':
      return process.env.CREEM_PREMIUM_PRICE_ID || '';
    default:
      throw new Error(`Unknown plan: ${plan}`);
  }
}
