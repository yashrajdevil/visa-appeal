import { AppealFormData, GenerateAppealResponse } from '../types';
import { auth } from '../firebase';

export const generateAppeal = async (data: AppealFormData): Promise<{ caseId: string }> => {
  let fileBase64 = '';
  let mimeType = 'application/pdf';

  if (data.file) {
    mimeType = data.file.type || 'application/pdf';
    fileBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(data.file as Blob);
    });
  }

  const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      country: data.country,
      visaType: data.visaType,
      purpose: data.purpose,
      travelHistory: data.travelHistory,
      refusalReasons: data.refusalReasons,
      questionnaireResponses: data.questionnaireResponses,
      fileBase64,
      mimeType
    }),
  });

  if (!response.ok) {
    let errorData;
    let fallbackText = '';
    try {
      const text = await response.text();
      fallbackText = text;
      errorData = JSON.parse(text);
    } catch (e) {
      errorData = null;
    }
    const err: any = new Error(errorData?.error || `Server Error ${response.status}: ` + (fallbackText.substring(0, 100)) || 'Failed to generate appeal');
    err.details = errorData?.details || `The server returned an HTTP ${response.status} error. This often means the uploaded file was too large (413), or the Vercel function execution timed out (504). Try a smaller file size (under 1.5MB). Original error: ${fallbackText.substring(0, 50)}`;
    throw err;
  }

  return response.json();
};
