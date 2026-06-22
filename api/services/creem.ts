console.log('BOOT TRACE - api/services/creem.ts loaded');
const CREEM_API_KEY = (process.env.CREEM_API_KEY || '').trim();

const isTestKey = CREEM_API_KEY.startsWith('creem_test');
const CREEM_API_URL = isTestKey ? 'https://test-api.creem.io/v1' : 'https://api.creem.io/v1';

function getCreemApiKey(): string {
  return CREEM_API_KEY;
}

// Boot diagnostics
console.log('[creem-boot] CREEM_API_KEY length:', CREEM_API_KEY.length);
console.log('[creem-boot] CREEM_API_KEY prefix:', CREEM_API_KEY.slice(0, 10));
console.log('[creem-boot] CREEM_API_KEY suffix:', CREEM_API_KEY.slice(-5));
console.log('[creem-boot] Key type:', isTestKey ? 'TEST (creem_test prefix)' : 'PRODUCTION');
console.log('[creem-boot] CREEM_API_KEY startsWith sk_', CREEM_API_KEY.startsWith('sk_'));
console.log('[creem-boot] CREEM_API_KEY startsWith creem_', CREEM_API_KEY.startsWith('creem_'));
console.log('[creem-boot] CREEM_API_KEY contains newline:', CREEM_API_KEY.includes('\n'));
console.log('[creem-boot] CREEM_API_KEY contains space:', CREEM_API_KEY.includes(' '));
console.log('[creem-boot] CREEM_API_URL:', CREEM_API_URL);
console.log('[creem-boot] Endpoint being used:', `${CREEM_API_URL}/checkouts`);
console.log('[creem-boot] Header format: x-api-key (not Authorization: Bearer)');

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
    request_id: params.caseId,
    metadata: {
      uid: params.uid,
      caseId: params.caseId,
      plan: params.plan,
    },
  };

  const endpointUrl = `${CREEM_API_URL}/checkouts`;
  console.log('[creem] Key length:', apiKey.length);
  console.log('[creem] Key prefix:', apiKey.slice(0, 10));
  console.log('[creem] Key suffix:', apiKey.slice(-5));
  console.log('[creem] Key type:', isTestKey ? 'TEST' : 'PRODUCTION');
  console.log('[creem] Key startsWith sk_:', apiKey.startsWith('sk_'));
  console.log('[creem] Key startsWith creem_:', apiKey.startsWith('creem_'));
  console.log('[creem] Key contains newline:', apiKey.includes('\n'));
  console.log('[creem] Key contains space:', apiKey.includes(' '));
  console.log('[creem] Final endpoint URL:', endpointUrl);
  console.log('[creem] Header format: x-api-key (NOT Authorization: Bearer)');
  console.log('[creem] Request headers:', JSON.stringify({
    'Content-Type': 'application/json',
    'x-api-key': apiKey.slice(0, 8) + '...' + apiKey.slice(-4),
  }));
  console.log('[creem] Request body:', JSON.stringify(requestBody));
  console.log('[creem] product_id (trimmed):', JSON.stringify(priceId));
  console.log('[creem] product_id raw length:', priceId.length);

  const response = await fetch(endpointUrl, {
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
  const raw = (() => {
    switch (plan) {
      case 'starter': return process.env.CREEM_STARTER_PRICE_ID || '';
      case 'standard': return process.env.CREEM_STANDARD_PRICE_ID || '';
      case 'premium': return process.env.CREEM_PREMIUM_PRICE_ID || '';
      default: return '';
    }
  })();
  const trimmed = raw.trim();
  console.log(`[creem] Plan "${plan}" raw price_id length:`, raw.length, 'trimmed:', trimmed.length, 'value:', JSON.stringify(trimmed));
  if (raw !== trimmed) {
    console.warn(`[creem] Plan "${plan}" price_id had whitespace/newline contamination, trimmed`);
  }
  if (!trimmed) {
    throw new Error(`No price_id configured for plan: ${plan}`);
  }
  return trimmed;
}
