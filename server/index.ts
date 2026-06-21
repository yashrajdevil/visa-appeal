import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import app from '../api/app.js';
import { runAllChecks } from '../api/validate.js';

const PORT = process.env.PORT || 3001;

if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    try {
      const results = await runAllChecks();
      console.log('\n=== Dependency Health ===');
      for (const r of results) {
        const icon = r.status === 'PASS' ? '✓' : '✗';
        console.log(`  ${icon} ${r.name}: ${r.status}${r.message ? ` (${r.message})` : ''}`);
      }
      console.log('=========================\n');

      const failed = results.filter(r => r.status === 'FAIL');
      if (failed.length > 0) {
        console.warn(`WARNING: ${failed.length} dependency check(s) failed. Server will start but some features may not work.`);
      } else {
        console.log('All dependencies passed.');
      }
    } catch (err: any) {
      console.error('Validation error:', err.message);
    }
  });
}
