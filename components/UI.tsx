import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface A4PageProps {
  children?: React.ReactNode;
  className?: string;
  teacherName?: string;
}

export const A4Page = ({ children, className = '', teacherName }: A4PageProps) => {
  const email = typeof window !== 'undefined' ? (localStorage.getItem("rpm_user_email") || "User") : "User";
  const displayName = teacherName || email;
  return (
    <div className={`a4-page relative bg-white shadow-lg mx-auto mb-8 p-8 overflow-visible ${className}`} style={{ width: '210mm', minHeight: '297mm' }}>
        {children}
        <div className="absolute bottom-4 left-0 w-full text-center text-[9px] text-gray-500 font-medium z-20 print-footer print:fixed print:bottom-0">
            RPM Pro © 2026 | {displayName}
        </div>
    </div>
  );
};

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'word' | 'outline' | 'active' | 'magic' | 'ai_small';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  icon: Icon, 
  isLoading = false, 
  size = 'md',
  ...props 
}) => {
  const baseStyle = `rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md active:scale-95 print:hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`;
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base",
  };

  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-blue-500/30 hover:to-blue-800 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1",
    secondary: "bg-white text-blue-700 border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50",
    accent: "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-orange-500/30 hover:to-orange-700 border-b-4 border-orange-800 active:border-b-0 active:translate-y-1",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1",
    word: "bg-blue-800 text-white hover:bg-blue-900",
    outline: "bg-transparent border-2 border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800 hover:bg-gray-50",
    active: "bg-blue-100 border-2 border-blue-500 text-blue-700 shadow-inner",
    magic: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-500/30 hover:to-indigo-700 border border-purple-400 border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1",
    ai_small: "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 text-xs py-1 px-2 shadow-sm"
  };

  return (
    <button disabled={props.disabled || isLoading} className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {isLoading ? <Loader2 size={size === 'sm' ? 14 : 20} className="animate-spin" /> : (Icon && <Icon size={size === 'sm' ? 16 : 20} />)}
      {children}
    </button>
  );
};

interface InputGroupProps {
  label: string;
  subLabel?: string;
  children: React.ReactNode;
  required?: boolean;
  onGenerateAI?: () => void;
  isGenerating?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, subLabel, children, required, onGenerateAI, isGenerating }) => (
  <div className="mb-5 group relative">
    <div className="flex flex-row justify-between items-start sm:items-end mb-1 gap-2 flex-wrap">
        <label className="block text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
        {label} {required && <span className="text-red-500">*</span>}
        </label>
        {onGenerateAI && (
            <button 
                type="button" 
                onClick={onGenerateAI} 
                disabled={isGenerating}
                className="text-xs flex items-center gap-1 text-purple-600 bg-purple-50 px-2.5 py-1.5 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 shrink-0"
            >
                {isGenerating ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                AI Inspirasi
            </button>
        )}
    </div>
    {subLabel && <p className="text-xs text-gray-400 mb-2">{subLabel}</p>}
    {children}
  </div>
);

export const SectionTitle = ({ title, icon: Icon }: { title: string; icon: React.ElementType }) => (
  <div className="flex items-center gap-3 mb-6 border-b-2 border-orange-100 pb-2 mt-2">
    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shadow-sm">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
  </div>
);