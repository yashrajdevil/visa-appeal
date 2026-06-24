import React from 'react';
import { motion } from 'motion/react';
import { Lock, ShieldCheck, Globe2, Cpu, Zap, FileText, Server, CreditCard } from 'lucide-react';

const OpenAILogo = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 md:h-6">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2057 5.9847 5.9847 0 0 0 3.9893-2.9001 6.0557 6.0557 0 0 0-.7391-7.0731zM11.4087 22.4206a4.4068 4.4068 0 0 1-3.1418-1.3093 3.9922 3.9922 0 0 1-1.0776-3.082l2.302-1.328a6.388 6.388 0 0 0 5.7718-.112.9288.9288 0 0 0 0-1.6116l-2.0003-1.1555a6.45 6.45 0 0 0-5.4678.016 6.31 6.31 0 0 0-2.8858 2.593A1.036 1.036 0 0 0 5.06 17.5h.0016a3.978 3.978 0 0 1-2.903-2.1818 4.398 4.398 0 0 1 .491-4.103 3.9961 3.9961 0 0 1 2.8797-1.84h2.6288v2.316a6.3478 6.3478 0 0 0 5.462 5.4418.914.914 0 0 0 1.002-.511l1-1.7335a6.388 6.388 0 0 0-1.003-6.4255 6.3195 6.3195 0 0 0-3.324-2.1091A1.0385 1.0385 0 0 0 10.3807 5.61h-.001a3.985 3.985 0 0 1 1.764-2.7302 4.4032 4.4032 0 0 1 4.1026-.491 3.9922 3.9922 0 0 1 1.84 2.8797v5.2573a6.4024 6.4024 0 0 0-5.7718.112zM21.238 6.91a3.9877 3.9877 0 0 1 2.903 2.1818 4.398 4.398 0 0 1-.491 4.103 3.9961 3.9961 0 0 1-2.8797 1.84h-2.6288v-2.316a6.348 6.348 0 0 0-5.462-5.4418.914.914 0 0 0-1.002.511l-1 1.7335a6.388 6.388 0 0 0 1.003 6.4255 6.3195 6.3195 0 0 0 3.324 2.1091A1.0385 1.0385 0 0 0 15.914 19.39h.0016A3.985 3.985 0 0 1 14.15 22.12a4.4032 4.4032 0 0 1-4.1026.491 3.9922 3.9922 0 0 1-1.84-2.8797v-5.2574A6.4024 6.4024 0 0 0 13.979 14.36z" />
    </svg>
);

const GeminiLogo = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 md:h-6">
        <path d="M12.062 0l1.455 9.074 9.076 1.458-9.076 1.457L12.062 21.06 10.605 11.99 1.528 10.53 10.605 9.074z" />
    </svg>
);

interface NetworkNode {
    id: string;
    label: string;
    description: string;
    cat: 'brand' | 'tech' | 'coverage' | 'payment';
    x: number;
    y: number;
    icon: React.ReactNode;
}

const nodes: NetworkNode[] = [
    { id: 'center', label: 'Lumera AI', description: 'Core intelligence engine powering the appeal process.', cat: 'brand', x: 0, y: 0, icon: <ShieldCheck className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" /> },
    
    // AI & Platform (Tech)
    { id: 'openai', label: 'OpenAI', description: 'Advanced GPT models for legal text analysis.', cat: 'tech', x: 60, y: -104, icon: <OpenAILogo /> },
    { id: 'gemini', label: 'Gemini', description: 'Multimodal AI processing and contextual embedding.', cat: 'tech', x: 120, y: 0, icon: <GeminiLogo /> },
    { id: 'ai_analysis', label: 'AI-Powered Analysis', description: 'Advanced refusal assessment and appeal generation.', cat: 'tech', x: 60, y: 104, icon: <Cpu className="w-5 h-5 text-indigo-400" /> },
    { id: 'instant_export', label: 'Instant PDF Export', description: 'Download professional appeal packages instantly.', cat: 'tech', x: -60, y: 104, icon: <FileText className="w-5 h-5 text-indigo-400" /> },
    { id: 'global_support', label: 'Global Support', description: 'Built for applicants worldwide.', cat: 'tech', x: 0, y: 208, icon: <Globe2 className="w-5 h-5 text-indigo-300" /> },
    { id: '24_7', label: '24/7 Availability', description: 'Access your appeal package anytime.', cat: 'tech', x: -60, y: 312, icon: <Zap className="w-5 h-5 text-purple-400" /> },
    
    // Security & Payment
    { id: 'secure_proc', label: 'Secure Processing', description: 'Protected document handling and transactions.', cat: 'payment', x: -120, y: 0, icon: <ShieldCheck className="w-5 h-5 text-emerald-400" /> },
    { id: 'ssl', label: 'SSL Secure', description: 'End-to-end 256-bit encryption.', cat: 'payment', x: -60, y: -104, icon: <Lock className="w-5 h-5 text-emerald-500" /> },
    { id: 'encrypted', label: 'Encrypted Data', description: 'Secure storage and transmission.', cat: 'payment', x: -120, y: 208, icon: <Server className="w-5 h-5 text-emerald-400" /> },
    { id: 'enterprise_sec', label: 'Enterprise Security', description: 'SOC 2 compliant infrastructure with end-to-end protection.', cat: 'payment', x: -120, y: -208, icon: <ShieldCheck className="w-5 h-5 text-emerald-400" /> },
    { id: 'privacy', label: 'Data Privacy', description: 'Strict confidentiality and zero-retention policies.', cat: 'payment', x: -60, y: -312, icon: <ShieldCheck className="w-5 h-5 text-emerald-300" /> },
    
    { id: 'visa', label: 'Visa', description: 'Verified Visa payment processing.', cat: 'payment', x: -180, y: -104, icon: <span className="font-bold text-sm md:text-lg italic tracking-tighter text-white">VISA</span> },
    { id: 'mastercard', label: 'Mastercard', description: 'Secure Mastercard transactions.', cat: 'payment', x: -240, y: 0, icon: (
        <div className="flex -space-x-1.5 md:-space-x-2">
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-orange-500 opacity-80 mix-blend-screen mix-blend-color-dodge"></div>
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-red-500 opacity-80 mix-blend-screen mix-blend-color-dodge"></div>
        </div>
    ) },
    { id: 'amex', label: 'AMEX', description: 'American Express network partner.', cat: 'payment', x: -180, y: 104, icon: <span className="font-bold text-[8px] sm:text-[10px] tracking-tighter border-2 border-current px-1.5 py-0.5 rounded-sm">AMEX</span> },

    // Coverage
    { id: 'us', label: 'United States', description: 'Support for B1/B2, F1, H1B and other US visas.', cat: 'coverage', x: 180, y: -104, icon: <span className="text-xl md:text-2xl drop-shadow-md">🇺🇸</span> },
    { id: 'uk', label: 'United Kingdom', description: 'Tourist, Student, and Tier 2 visa appeals.', cat: 'coverage', x: 240, y: 0, icon: <span className="text-xl md:text-2xl drop-shadow-md">🇬🇧</span> },
    { id: 'canada', label: 'Canada', description: 'TRV, Study Permit, and PR refusal analysis.', cat: 'coverage', x: 180, y: 104, icon: <span className="text-xl md:text-2xl drop-shadow-md">🇨🇦</span> },
    { id: 'eu', label: 'European Union', description: 'Comprehensive coverage for EU member states.', cat: 'coverage', x: 120, y: -208, icon: <span className="text-xl md:text-2xl drop-shadow-md">🇪🇺</span> },
    { id: 'au', label: 'Australia', description: 'Tourist, Student, and Partner visa support.', cat: 'coverage', x: 120, y: 208, icon: <span className="text-xl md:text-2xl drop-shadow-md">🇦🇺</span> },
    { id: 'nz', label: 'New Zealand', description: 'Visitor and Resident visa refusal strategies.', cat: 'coverage', x: 60, y: -312, icon: <span className="text-xl md:text-2xl drop-shadow-md">🇳🇿</span> },
    { id: 'schengen', label: 'Schengen Area', description: 'Specialized Schengen refusal code analysis.', cat: 'coverage', x: 60, y: 312, icon: <Globe2 className="w-5 h-5 text-amber-500/80" /> },
    { id: 'singapore', label: 'Singapore', description: 'IPA refusal and appeal processing.', cat: 'coverage', x: 0, y: -208, icon: <span className="text-xl md:text-2xl drop-shadow-md">🇸🇬</span> },
];

const edges: [string, string][] = [];
for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2));
        if (dist < 125) { 
            edges.push([nodes[i].id, nodes[j].id]);
        }
    }
}

const HexagonNode = ({ node }: { node: NetworkNode }) => {
    const isCenter = node.id === 'center';
    const baseW = isCenter ? 134 : 116;
    const baseH = isCenter ? 154 : 134;
    
    // Calculate dynamic hover delay based on coordinates
    const delay = (Math.abs(node.x) + Math.abs(node.y)) / 400; 
    
    let glowColor = 'rgba(255,255,255,0.3)';
    if (node.cat === 'tech') glowColor = 'rgba(99,102,241,0.5)'; // indigo
    else if (node.cat === 'payment') glowColor = 'rgba(16,185,129,0.5)'; // emerald
    else if (node.cat === 'coverage') glowColor = 'rgba(245,158,11,0.4)'; // amber/gold
    if (isCenter) glowColor = 'rgba(255,255,255,0.8)';

    return (
        <motion.div 
            className={`absolute flex items-center justify-center group cursor-default z-10 hover:z-50`}
            style={{ 
                left: `calc(50% + ${node.x}px)`, 
                top: `calc(50% + ${node.y}px)`,
                width: baseW,
                height: baseH,
                marginLeft: -baseW/2,
                marginTop: -baseH/2
            }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, delay, ease: 'easeInOut' }}
        >
            {/* Tooltip */}
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-[180px] bg-zinc-900 border border-zinc-700 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-lg px-3 py-2 text-center opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 pointer-events-none z-[60]">
                <p className="text-[11px] font-bold text-white mb-0.5">{node.label}</p>
                <p className="text-[9px] text-zinc-400 leading-tight">{node.description}</p>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900 border-b border-r border-zinc-700 rotate-45"></div>
            </div>

            {/* Soft background glow */}
            <div 
                className="absolute inset-0 -z-10 blur-[25px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"
                style={{ backgroundColor: glowColor, transform: 'scale(1.2)' }}
            />
            {isCenter && (
                 <div 
                    className="absolute inset-0 -z-10 blur-[45px] opacity-70 transition-opacity duration-500 rounded-full animate-pulse"
                    style={{ backgroundColor: glowColor, transform: 'scale(1.3)' }}
                />
            )}

            <motion.div 
                className={`absolute inset-0 ${isCenter ? 'bg-white/20' : 'bg-white/5'} transition-colors duration-500 group-hover:bg-white/10`}
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                whileHover={{ scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
                <div 
                    className={`absolute inset-[1px] ${isCenter ? 'bg-zinc-800' : 'bg-zinc-950/90'} backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-300 px-2`}
                    style={{ 
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b opacity-10 group-hover:opacity-30 transition-opacity duration-300" 
                         style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${glowColor})` }} />
                    
                    <div className={`${isCenter ? 'mb-2' : 'mb-1.5'} text-zinc-300 group-hover:text-white transition-colors duration-300 flex items-center justify-center`}>
                        {node.icon}
                    </div>
                    {(!isCenter || true) && (
                        <span className={`${isCenter ? 'text-xs md:text-sm font-bold tracking-tight text-white drop-shadow-md' : 'text-[9px] md:text-[10px] font-medium text-zinc-400 group-hover:text-zinc-200'} text-center leading-tight transition-colors duration-300 max-w-[85%]`} style={{ letterSpacing: isCenter ? '0.02em' : 'normal'}}>
                            {node.label}
                        </span>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function TrustSection() {
    return (
        <section className="py-24 px-6 overflow-hidden">
            <div className="max-w-screen-xl mx-auto">
                <div className="text-center mb-16 relative z-20">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Trusted Technology • Secure Payments • Global Coverage</h2>
                    <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto">Built on an elite ecosystem of AI infrastructure, secure payment networks, and international processing standard components.</p>
                </div>

                <div className="relative w-full h-[700px] md:h-[800px] lg:h-[900px] flex items-center justify-center mt-8 md:mt-0">
                    {/* Dark gradient fade for edges */}
                    <div className="absolute inset-0 z-30 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, #09090b 70%)' }}></div>
                    
                    <div className="relative w-full h-full scale-[0.65] sm:scale-75 md:scale-95 lg:scale-110 xl:scale-[1.15]" style={{ transformOrigin: 'center center' }}>
                        {/* Background edges */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
                            <motion.g 
                                style={{ transform: 'translate(50%, 50%)' }}
                                animate={{ opacity: [0.5, 0.9, 0.5] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                {edges.map((e, idx) => {
                                    const n1 = nodes.find(n => n.id === e[0]);
                                    const n2 = nodes.find(n => n.id === e[1]);
                                    if (!n1 || !n2) return null;
                                    return (
                                        <motion.line 
                                            key={idx}
                                            x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} 
                                            stroke="rgba(255,255,255,0.06)" 
                                            strokeWidth="2"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            whileInView={{ pathLength: 1, opacity: 1 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ duration: 1.5, delay: 0.2 + (idx * 0.03), ease: "easeOut" }}
                                        />
                                    )
                                })}
                            </motion.g>
                        </svg>

                        {/* Honeycomb Nodes */}
                        {nodes.map(node => (
                             <HexagonNode key={node.id} node={node} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

