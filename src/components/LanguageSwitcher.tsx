import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppLanguage } from '../types';
import { Globe, Check, ChevronDown } from 'lucide-react';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
  shortCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    flag: '🇬🇧',
    shortCode: 'EN'
  },
  {
    code: 'ur',
    label: 'Urdu',
    nativeLabel: 'اردو',
    flag: '🇵🇰',
    shortCode: 'UR'
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    flag: '🇮🇳',
    shortCode: 'HI'
  }
];

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'segmented';
  className?: string;
  showFlag?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  className = '',
  showFlag = true
}) => {
  const { language, setLanguage, updateUserSettings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption =
    SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code: AppLanguage) => {
    setLanguage(code);
    if (updateUserSettings) {
      updateUserSettings({ language: code });
    }
    try {
      localStorage.setItem('fixora_lang', code);
    } catch {
      // ignore storage error
    }
    setIsOpen(false);
  };

  if (variant === 'segmented') {
    return (
      <div
        id="navbar-language-segmented"
        className={`inline-flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xs ${className}`}
        role="radiogroup"
        aria-label="Select Language"
      >
        {SUPPORTED_LANGUAGES.map(option => {
          const isActive = option.code === language;
          return (
            <button
              key={option.code}
              id={`lang-segmented-${option.code}`}
              type="button"
              onClick={() => handleSelectLanguage(option.code)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
              }`}
              title={`${option.label} (${option.nativeLabel})`}
            >
              {showFlag && <span className="text-xs leading-none">{option.flag}</span>}
              <span>{option.nativeLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown Variant
  return (
    <div
      ref={dropdownRef}
      id="navbar-language-switcher"
      className={`relative inline-block text-left ${className}`}
    >
      <button
        id="navbar-language-btn"
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white text-xs font-bold transition flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 shadow-xs cursor-pointer group"
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={`Language: ${currentOption.label} (${currentOption.nativeLabel})`}
      >
        <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform shrink-0" />
        {showFlag && <span className="text-xs leading-none shrink-0">{currentOption.flag}</span>}
        <span className="font-mono font-black text-[11px] tracking-wide">
          {currentOption.shortCode}
        </span>
        <span className="hidden md:inline font-medium text-[11px] text-slate-600 dark:text-slate-300">
          {currentOption.nativeLabel}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id="navbar-language-menu"
          className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
            Choose Language / زبان / भाषा
          </div>

          {SUPPORTED_LANGUAGES.map(option => {
            const isSelected = option.code === language;
            return (
              <button
                key={option.code}
                id={`lang-option-${option.code}`}
                type="button"
                onClick={() => handleSelectLanguage(option.code)}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm leading-none">{option.flag}</span>
                  <div>
                    <span className="block font-bold">{option.nativeLabel}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                      {option.label}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
