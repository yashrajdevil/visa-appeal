import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'motion/react';
import { FileText, Cpu, CheckCircle2, FileDown, ShieldCheck, FileCheck2, Lightbulb, PieChart, BarChart3, Fingerprint, Lock } from 'lucide-react';

export const ShowcaseSection = () => {
    const sectionRef = React.useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
    
    return (
        <section ref={sectionRef} className="py-32 px-6 relative border-t border-zinc-900 bg-[#09090b] overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
            <div className="absolute -top-40 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-24 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider rounded-full mb-6 ring-1 ring-indigo-500/20">
                            <Cpu className="w-3.5 h-3.5" />
                            <span>Automated Intelligence</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white leading-tight">
                            From Refusal Letter To <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Complete Appeal Package</span>
                        </h2>
                        <p className="text-zinc-400 text-xl leading-relaxed">
                            Upload one refusal letter and receive a complete personalized appeal package built specifically around your rejection reasons.
                        </p>
                    </motion.div>
                </div>

                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20">
                    {/* Left Side: Process Flow */}
                    <div className="w-full lg:w-5/12 flex flex-col gap-4">
                        {/* Step 1 */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 relative"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 shadow-inner">
                                    <FileText className="w-6 h-6 text-zinc-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-white font-medium">Refusal Letter</h3>
                                        <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full ring-1 ring-emerald-400/20">Uploaded</span>
                                    </div>
                                    <p className="text-sm text-zinc-500">visa_refusal_notice.pdf</p>
                                    <div className="mt-4 h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={isInView ? { width: "100%" } : { width: 0 }}
                                            transition={{ duration: 0.8, delay: 0.5 }}
                                            className="h-full bg-emerald-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Connector */}
                        <div className="flex justify-center -my-2 relative z-0">
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={isInView ? { height: 40, opacity: 1 } : { height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, delay: 1.0 }}
                                className="w-px bg-gradient-to-b from-emerald-500/50 via-indigo-500/50 to-indigo-500/50"
                            />
                        </div>

                        {/* Step 2 */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                            transition={{ duration: 0.6, delay: 1.4 }}
                            className="bg-indigo-950/20 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
                            
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/30">
                                    <Cpu className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-white font-medium">AI Analysis</h3>
                                        <motion.span 
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.4, delay: 2.8 }}
                                            className="text-xs font-medium text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full ring-1 ring-indigo-500/30"
                                        >
                                            Analysis Complete
                                        </motion.span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {[
                                            { text: "Financial concerns detected", delay: 1.8 },
                                            { text: "Travel intent concerns detected", delay: 2.1 },
                                            { text: "Documentation gaps identified", delay: 2.4 }
                                        ].map((item, i) => (
                                            <motion.div 
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                                                transition={{ duration: 0.4, delay: item.delay }}
                                                className="flex items-center gap-3 text-sm text-indigo-200"
                                            >
                                                <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                                                <span>{item.text}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Connector */}
                        <div className="flex justify-center -my-2 relative z-0">
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={isInView ? { height: 40, opacity: 1 } : { height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, delay: 3.0 }}
                                className="w-px bg-gradient-to-b from-indigo-500/50 to-purple-500/50"
                            />
                        </div>

                        {/* Step 3 */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                            transition={{ duration: 0.6, delay: 3.4 }}
                            className="bg-zinc-950/80 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 relative shadow-[0_0_30px_rgba(168,85,247,0.1)]"
                        >
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/30">
                                    <FileCheck2 className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-white font-medium">Appeal Package Generated</h3>
                                        <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full ring-1 ring-emerald-400/20">Ready</span>
                                    </div>
                                    <p className="text-sm text-zinc-500">Optimized for highest success probability</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: Dashboard Mockup */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                        transition={{ duration: 0.8, delay: 4.0 }}
                        className="w-full lg:w-7/12 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-xl rounded-[2rem]"></div>
                        
                        <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col">
                            {/* Dashboard Header */}
                            <div className="px-8 py-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
                                <h3 className="text-lg font-semibold text-white">Appeal Package Overview</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    <span className="text-xs font-medium text-emerald-400">System Ready</span>
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0a0a0c]">
                                {/* Score Card */}
                                <div className="md:col-span-2 bg-gradient-to-br from-indigo-950/40 to-zinc-900/40 border border-indigo-500/20 rounded-2xl p-6 flex items-center gap-6 relative overflow-hidden group">
                                     <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative">
                                        <svg className="w-24 h-24 transform -rotate-90">
                                            <circle cx="48" cy="48" r="40" stroke="rgba(99,102,241,0.1)" strokeWidth="8" fill="none" />
                                            <motion.circle 
                                                initial={{ strokeDasharray: "0 251.2" }}
                                                animate={isInView ? { strokeDasharray: "206 251.2" } : { strokeDasharray: "0 251.2" }}
                                                transition={{ duration: 1.5, delay: 4.5, ease: "easeOut" }}
                                                cx="48" cy="48" r="40" stroke="#818cf8" strokeWidth="8" fill="none" strokeLinecap="round" 
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold text-white tracking-tighter">82</span>
                                            <span className="text-[10px] text-zinc-400 uppercase font-medium">/ 100</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-medium text-white mb-1">Appeal Potential Score</h4>
                                        <p className="text-sm text-emerald-400 font-medium">High Improvement Potential</p>
                                        <p className="text-xs text-zinc-500 mt-2">Based on our model, your case has a strong likelihood of overturning the refusal if the identified gaps are addressed.</p>
                                    </div>
                                </div>

                                {/* Items */}
                                {[
                                    { icon: <FileText className="w-5 h-5 text-blue-400" />, title: "Appeal Letter", desc: "Embassy-ready • 3-5 pages" },
                                    { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, title: "Evidence Checklist", desc: "8 required documents" },
                                    { icon: <PieChart className="w-5 h-5 text-rose-400" />, title: "Weakness Analysis", desc: "3 refusal concerns detected" },
                                    { icon: <Lightbulb className="w-5 h-5 text-amber-400" />, title: "Reapplication Strategy", desc: "Recommended next steps" }
                                ].map((item, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.5, delay: 4.8 + (i * 0.1) }}
                                        className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 hover:bg-zinc-900 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                                                {item.icon}
                                            </div>
                                            <CheckCircle2 className="w-5 h-5 text-zinc-700" />
                                        </div>
                                        <h4 className="text-white font-medium mb-1">{item.title}</h4>
                                        <p className="text-xs text-zinc-500">{item.desc}</p>
                                    </motion.div>
                                ))}

                                {/* Export Button Mockup */}
                                <div className="md:col-span-2 pt-4">
                                     <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-white hover:bg-zinc-100 text-zinc-950 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors"
                                    >
                                        <FileDown className="w-5 h-5" />
                                        Export Package (PDF Ready)
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
