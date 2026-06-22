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

  const requestBody = {
    product_id: priceId,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    request_id: params.caseId,
    metadata: {
      uid: params.uid,
      caseId: params.caseId,
      plan: params.plan,
    },
  };

  console.log('[creem] Request URL:', `${CREEM_API_URL}/checkouts`);
  console.log('[creem] Request headers:', JSON.stringify({
    'Content-Type': 'application/json',
    'x-api-key': apiKey.slice(0, 8) + '...' + apiKey.slice(-4),
  }));
  console.log('[creem] Request body:', JSON.stringify(requestBody));

  const response = await fetch(`${CREEM_API_URL}/checkouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  const responseBody = await response.text();
  console.log('[creem] Response status:', response.status);
  console.log('[creem] Response body:', responseBody);

  if (!response.ok) {
    throw new Error(`Creem API error: ${response.status} ${responseBody}`);
  }

  const parsed = JSON.parse(responseBody);
  console.log('[creem] checkout_url:', parsed.checkout_url);
  console.log('[creem] session id:', parsed.id);

  return parsed as { checkout_url: string; id: string };
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
