import fs from 'fs';

let content = fs.readFileSync('src/components/ResultsDashboard.tsx', 'utf-8');

content = content.replace(
    /onClick=\{\(\) => handlePayment\('standard'\)\} className="text-xs px-4 py-1.5 bg-indigo-500/g,
    'type="button" onClick={(e) => { e.preventDefault(); handlePayment(\'standard\'); }} className="text-xs px-4 py-1.5 bg-indigo-500'
);

content = content.replace(
    /onClick=\{\(\) => handlePayment\('premium'\)\} className="text-xs px-4 py-1.5 bg-purple-500/g,
    'type="button" onClick={(e) => { e.preventDefault(); handlePayment(\'premium\'); }} className="text-xs px-4 py-1.5 bg-purple-500'
);

content = content.replace(
    /onClick=\{\(\) => handlePayment\('standard'\)\} className="text-sm px-6 py-2 bg-indigo-500/g,
    'type="button" onClick={(e) => { e.preventDefault(); handlePayment(\'standard\'); }} className="text-sm px-6 py-2 bg-indigo-500'
);

fs.writeFileSync('src/components/ResultsDashboard.tsx', content);
