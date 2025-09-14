// React namespace not needed directly here
import { Globe } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { useLanguage } from '../contexts/LanguageContext';

const languages = [
  { code: 'hi', name: 'हिंदी', english: 'Hindi' },
  { code: 'en', name: 'English', english: 'English' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
  { code: 'gu', name: 'ગુજરાતી', english: 'Gujarati' },
  { code: 'te', name: 'తెలుగు', english: 'Telugu' },
  { code: 'ta', name: 'தமிழ்', english: 'Tamil' },
  { code: 'kn', name: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'mr', name: 'मराठी', english: 'Marathi' },
  { code: 'bn', name: 'বাংলা', english: 'Bengali' }
];

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact';
}

export function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={variant === 'compact' ? 'sm' : 'default'}
          className="bg-black text-white border border-green-500/50 
                     hover:bg-green-500/20 hover:border-green-500 transition-colors"
        >
          <Globe className="w-4 h-4 mr-2 text-green-400" />
          {variant === 'compact' ? currentLanguage.code.toUpperCase() : currentLanguage.name}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-black text-white border border-green-500/30 shadow-lg"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer hover:bg-green-500/20 focus:bg-green-500/20 ${language === lang.code
              ? 'bg-green-500/30 text-green-400'
              : 'text-gray-200'
              }`}
          >
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="font-medium">{lang.name}</div>
                <div className="text-sm text-gray-400">{lang.english}</div>
              </div>
              {language === lang.code && (
                <div className="w-2 h-2 bg-green-400 rounded-full" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
