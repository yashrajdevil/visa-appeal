import { auth } from '../firebase';

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function analyzeCase(formData: {
  country: string;
  visaType: string;
  purpose: string;
  travelHistory: string;
  refusalReasons: string[];
  questionnaireResponses: { question: string; answer: string | boolean | string[] }[];
}): Promise<{ caseId: string }> {
  return apiFetch('/api/analyze', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

export async function createCheckout(params: {
  caseId: string;
  plan: 'starter' | 'standard' | 'premium';
}): Promise<{ checkoutUrl: string }> {
  return apiFetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
