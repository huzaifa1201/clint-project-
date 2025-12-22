
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { languageOptions } from '../src/locales';

const LanguageSelector: React.FC = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguage = languageOptions.find(l => l.code === i18n.language) || languageOptions[0];

    const handleLanguageChange = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);

        // Update RTL direction for Arabic/Urdu
        if (code === 'ar' || code === 'ur') {
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = code;
        } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = code;
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-zinc-500 hover:text-green-500 transition-colors p-2 rounded-lg"
                title="Change Language"
            >
                <Globe size={18} />
                <span className="text-[10px] uppercase font-black tracking-widest hidden md:block">{currentLanguage.code}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 max-h-96 overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 scrollbar-hide">
                    <div className="sticky top-0 bg-white dark:bg-zinc-950 p-2 border-b border-zinc-100 dark:border-zinc-900 mb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Select Region</p>
                    </div>
                    {languageOptions.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between group transition-colors ${i18n.language === lang.code ? 'bg-green-500/10 text-green-500' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300'}`}
                        >
                            <span className="flex items-center gap-3">
                                <span className="text-lg">{lang.flag}</span>
                                <span className="text-xs font-bold uppercase tracking-wider">{lang.name}</span>
                            </span>
                            {i18n.language === lang.code && <Check size={14} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
