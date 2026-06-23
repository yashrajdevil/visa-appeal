import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, Heading1, Heading2, Heading3, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Quote, AlignLeft, AlignCenter, AlignRight, MousePointerClick, X, LayoutTemplate } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const PRESET_CTAS = [
    { text: 'Return to Homepage', url: '/' },
    { text: 'Generate Visa Reapplication Submission', url: '/appeal-builder' },
    { text: 'Analyze My Refusal Letter', url: '/analyze' },
    { text: 'Contact Us', url: '/contact' },
    { text: 'View Visa Bundles', url: '/bundles' },
    { text: 'View Pricing', url: '/pricing' }
];

const BANNER_PRESETS = [
    { headline: "Don't guess what the embassy wants.", subheadline: "Upload your refusal letter and receive a complete personalized reapplication package including document analysis, refusal reasoning, weaknesses, and a professional submission.", buttonText: "Generate My Reapplication Plan", url: "/appeal-builder" },
    { headline: "Ready to strengthen your application?", subheadline: "Get a complete refusal analysis and document strategy.", buttonText: "Analyze My Refusal", url: "/analyze" },
    { headline: "Need help with your visa refusal?", subheadline: "Get an embassy-ready appeal package in minutes.", buttonText: "Start Now", url: "/contact" }
];

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [ctaModalOpen, setCtaModalOpen] = useState(false);
    const [ctaBannerModalOpen, setCtaBannerModalOpen] = useState(false);
    
    // Simple Button State 
    const [ctaText, setCtaText] = useState('');
    const [ctaUrl, setCtaUrl] = useState('');

    // Banner State
    const [bannerHeadline, setBannerHeadline] = useState('');
    const [bannerSubheadline, setBannerSubheadline] = useState('');
    const [bannerActionText, setBannerActionText] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');
    const [bannerTheme, setBannerTheme] = useState('dark');
    
    const [ctaNewTab, setCtaNewTab] = useState(false);
    const [ctaStyle, setCtaStyle] = useState('primary');
    const [ctaSize, setCtaSize] = useState('medium');
    const [savedSelection, setSavedSelection] = useState<Range | null>(null);

    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            setSavedSelection(selection.getRangeAt(0));
        } else {
            setSavedSelection(null);
        }
    };

    const openCtaModal = () => {
        saveSelection();
        setCtaModalOpen(true);
    };

    const openBannerModal = () => {
        saveSelection();
        setCtaBannerModalOpen(true);
    };

    // Only update innerHTML if it doesn't match current input (prevents cursor jumping)
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, arg?: string) => {
        document.execCommand(command, false, arg);
        editorRef.current?.focus();
        handleInput();
    };

    const handleLink = () => {
        const url = prompt('Enter link URL:');
        if (url) execCommand('createLink', url);
    };

    const handleImage = () => {
        const url = prompt('Enter image URL:');
        if (url) execCommand('insertImage', url);
    };

    const insertCtaButton = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        const styleClasses: Record<string, string> = {
            primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
            secondary: 'bg-zinc-800 hover:bg-zinc-700 text-white',
            outline: 'bg-transparent border border-indigo-500 text-indigo-400 hover:bg-indigo-900/30',
            success: 'bg-green-600 hover:bg-green-500 text-white',
            warning: 'bg-amber-600 hover:bg-amber-500 text-white'
        };

        const sizeClasses: Record<string, string> = {
            small: 'px-3 py-1.5 text-xs font-medium',
            medium: 'px-5 py-2.5 text-sm font-semibold',
            large: 'px-8 py-4 text-base font-bold uppercase tracking-wide'
        };

        const classes = `not-prose cta-button-track inline-flex items-center justify-center rounded-lg no-underline transition-colors ${styleClasses[ctaStyle]} ${sizeClasses[ctaSize]} mx-2 my-2 select-none cursor-pointer`;
        
        const target = ctaNewTab ? '_blank' : '_self';
        const rel = ctaNewTab ? 'noopener noreferrer' : '';

        // execCommand('insertHTML') is standard for contentEditable
        const html = `&nbsp;<a href="${ctaUrl}" target="${target}" rel="${rel}" class="${classes}" data-text="${ctaText}" data-url="${ctaUrl}" contenteditable="false">${ctaText}</a>&nbsp;`;
        
        // Restore selection before inserting
        editorRef.current?.focus();
        if (savedSelection) {
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(savedSelection);
        }

        execCommand('insertHTML', html);
        setCtaModalOpen(false);
        setCtaText('');
        setCtaUrl('');
    };

    const insertCtaBanner = (e?: React.FormEvent) => {
        if(e) e.preventDefault();

        // We embed the data in a simpler custom block format
        // that our BlogArticleView can easily parse and render nicely.
        // It provides a fallback visual structure for the editor window.
        // And handles `cta-banner-track` for parsing out.

        // To make it look reasonable in the editor before parsing:
        const themeBg = bannerTheme === 'light' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-white';
        const buttonTheme = bannerTheme === 'light' ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white';
        
        const html = `
<div class="cta-banner-track not-prose my-8 p-8 border border-zinc-700/50 rounded-2xl flex flex-col items-center justify-center text-center ${themeBg}" contenteditable="false" data-headline="${bannerHeadline.replace(/"/g, '&quot;')}" data-subline="${bannerSubheadline.replace(/"/g, '&quot;')}" data-button="${bannerActionText.replace(/"/g, '&quot;')}" data-url="${bannerUrl.replace(/"/g, '&quot;')}" data-theme="${bannerTheme}">
    <h2 class="text-2xl md:text-3xl font-bold mb-4 tracking-tight leading-tight">${bannerHeadline}</h2>
    <p class="text-base md:text-lg mb-6 max-w-2xl opacity-80 leading-relaxed">${bannerSubheadline}</p>
    <a href="${bannerUrl}" class="inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold transition-colors ${buttonTheme}">${bannerActionText}</a>
</div>
&nbsp;<br>
`;

        editorRef.current?.focus();
        if (savedSelection) {
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(savedSelection);
        }

        execCommand('insertHTML', html);
        setCtaBannerModalOpen(false);
        setBannerHeadline('');
        setBannerSubheadline('');
        setBannerActionText('');
        setBannerUrl('');
    };

    const applyPreset = (preset: typeof PRESET_CTAS[0]) => {
        setCtaText(preset.text);
        setCtaUrl(preset.url);
    };
    
    const applyBannerPreset = (preset: typeof BANNER_PRESETS[0]) => {
        setBannerHeadline(preset.headline);
        setBannerSubheadline(preset.subheadline);
        setBannerActionText(preset.buttonText);
        setBannerUrl(preset.url);
    };

    const ToolbarButton = ({ icon: Icon, action, title }: { icon: any, action: () => void, title: string }) => (
        <button
            onClick={(e) => { e.preventDefault(); action(); }}
            title={title}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
            type="button"
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden relative">
            {ctaModalOpen && (
                <div className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden flex flex-col max-h-full">
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                            <h3 className="font-bold">Insert CTA Button</h3>
                            <button onClick={() => setCtaModalOpen(false)} className="text-zinc-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            {/* Presets */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Quick Presets</label>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_CTAS.map((preset, i) => (
                                        <button 
                                            key={i} 
                                            type="button" 
                                            onClick={() => applyPreset(preset)}
                                            className="px-2.5 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-300 transition-colors"
                                        >
                                            {preset.text}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form id="cta-form" onSubmit={insertCtaButton} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1">Button Text</label>
                                    <input type="text" required value={ctaText} onChange={e => setCtaText(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Generate Visa Appeal" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1">Destination URL</label>
                                    <input type="text" required value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. /appeal-builder" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="newTab" checked={ctaNewTab} onChange={e => setCtaNewTab(e.target.checked)} className="rounded border-zinc-800 bg-zinc-950 text-indigo-500 focus:ring-indigo-500" />
                                    <label htmlFor="newTab" className="text-sm text-zinc-300">Open in new tab</label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-1">Style</label>
                                        <select value={ctaStyle} onChange={e => setCtaStyle(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500">
                                            <option value="primary">Primary</option>
                                            <option value="secondary">Secondary</option>
                                            <option value="outline">Outline</option>
                                            <option value="success">Success</option>
                                            <option value="warning">Warning</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-1">Size</label>
                                        <select value={ctaSize} onChange={e => setCtaSize(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500">
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t border-zinc-800 bg-zinc-800/50 flex justify-end gap-3">
                            <button onClick={() => setCtaModalOpen(false)} className="px-4 py-2 text-zinc-400 hover:text-white font-medium transition-colors">Cancel</button>
                            <button form="cta-form" type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">Insert Button</button>
                        </div>
                    </div>
                </div>
            )}

            {ctaBannerModalOpen && (
                <div className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full">
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-indigo-400"/> Insert CTA Banner</h3>
                            <button onClick={() => setCtaBannerModalOpen(false)} className="text-zinc-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            {/* Presets */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Quick Presets</label>
                                <div className="flex flex-col gap-2">
                                    {BANNER_PRESETS.map((preset, i) => (
                                        <button 
                                            key={i} 
                                            type="button" 
                                            onClick={() => applyBannerPreset(preset)}
                                            className="px-4 py-3 text-left w-full text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-lg text-zinc-300 transition-colors"
                                        >
                                            <div className="font-bold text-white mb-1">{preset.headline}</div>
                                            <div className="text-xs text-zinc-400 truncate">{preset.subheadline}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form id="cta-banner-form" onSubmit={insertCtaBanner} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1">Headline</label>
                                    <input type="text" required value={bannerHeadline} onChange={e => setBannerHeadline(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Don't guess what the embassy wants." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1">Subheadline</label>
                                    <textarea required rows={2} value={bannerSubheadline} onChange={e => setBannerSubheadline(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Get a complete refusal analysis." />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-1">Button Text</label>
                                        <input type="text" required value={bannerActionText} onChange={e => setBannerActionText(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Start Now" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-1">Destination URL</label>
                                        <input type="text" required value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. /analyze" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-1">Theme</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                                            <input type="radio" value="dark" checked={bannerTheme === 'dark'} onChange={() => setBannerTheme('dark')} className="text-indigo-500 focus:ring-indigo-500 bg-zinc-950 border-zinc-800" /> Dark Theme
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                                            <input type="radio" value="light" checked={bannerTheme === 'light'} onChange={() => setBannerTheme('light')} className="text-indigo-500 focus:ring-indigo-500 bg-zinc-950 border-zinc-800" /> Light Theme
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t border-zinc-800 bg-zinc-800/50 flex justify-end gap-3">
                            <button onClick={() => setCtaBannerModalOpen(false)} className="px-4 py-2 text-zinc-400 hover:text-white font-medium transition-colors">Cancel</button>
                            <button form="cta-banner-form" type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">Insert Banner</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-800 border-b border-zinc-800">
                <ToolbarButton icon={Bold} title="Bold" action={() => execCommand('bold')} />
                <ToolbarButton icon={Italic} title="Italic" action={() => execCommand('italic')} />
                <ToolbarButton icon={Underline} title="Underline" action={() => execCommand('underline')} />
                <div className="w-px h-6 bg-zinc-700 mx-1" />
                <ToolbarButton icon={Heading1} title="Heading 1" action={() => execCommand('formatBlock', 'H1')} />
                <ToolbarButton icon={Heading2} title="Heading 2" action={() => execCommand('formatBlock', 'H2')} />
                <ToolbarButton icon={Heading3} title="Heading 3" action={() => execCommand('formatBlock', 'H3')} />
                <div className="w-px h-6 bg-zinc-700 mx-1" />
                <ToolbarButton icon={List} title="Bullet List" action={() => execCommand('insertUnorderedList')} />
                <ToolbarButton icon={ListOrdered} title="Numbered List" action={() => execCommand('insertOrderedList')} />
                <ToolbarButton icon={Quote} title="Quote" action={() => execCommand('formatBlock', 'BLOCKQUOTE')} />
                <div className="w-px h-6 bg-zinc-700 mx-1" />
                <ToolbarButton icon={AlignLeft} title="Align Left" action={() => execCommand('justifyLeft')} />
                <ToolbarButton icon={AlignCenter} title="Align Center" action={() => execCommand('justifyCenter')} />
                <ToolbarButton icon={AlignRight} title="Align Right" action={() => execCommand('justifyRight')} />
                <div className="w-px h-6 bg-zinc-700 mx-1" />
                <ToolbarButton icon={LinkIcon} title="Insert Link" action={handleLink} />
                <ToolbarButton icon={ImageIcon} title="Insert Image" action={handleImage} />
                <div className="w-px h-6 bg-zinc-700 mx-1" />
                <ToolbarButton icon={MousePointerClick} title="Insert CTA Button" action={openCtaModal} />
                <ToolbarButton icon={LayoutTemplate} title="Insert CTA Banner" action={openBannerModal} />
            </div>

            {/* Editor Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-zinc-950">
                <div
                    ref={editorRef}
                    className="min-h-[400px] outline-none text-zinc-200 prose prose-invert max-w-none [&_.cta-button-track]:pointer-events-none [&_.cta-banner-track]:pointer-events-none"
                    contentEditable
                    onInput={handleInput}
                    onBlur={handleInput}
                    data-placeholder={placeholder}
                    style={{ minHeight: '400px' }}
                />
            </div>
            {/* Placeholder CSS hack */}
            <style dangerouslySetInnerHTML={{__html: `
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #52525b;
                    pointer-events: none;
                    display: block; /* For Firefox */
                }
            `}} />
        </div>
    );
}
