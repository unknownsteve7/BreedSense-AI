import { Button } from './ui/button';
import {
  Home,
  Camera,
  Video,
  Database,
  Phone,
  History,
  User
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: Home, description: 'Overview & Statistics' },
    { id: 'camera', label: t('nav.camera'), icon: Camera, description: 'Capture & Identify' },
    { id: 'video', label: t('nav.video'), icon: Video, description: 'Process Videos' },
    // { id: 'breeds', label: t('nav.breeds'), icon: Database, description: 'Browse Breeds' },
    // { id: 'reports', label: t('nav.reports'), icon: FileText, description: 'Create Reports' },
    { id: 'contacts', label: t('nav.contacts'), icon: Phone, description: 'Veterinary Directory' },
    { id: 'history', label: t('nav.history'), icon: History, description: 'Past Activities' }
  ];

  return (
    <div className="bg-black border-r border-green-500/20 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-green-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-400 rounded-lg flex items-center justify-center">
            <Database className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-green-400">AI Breed Recognition</h2>
            <p className="text-xs text-green-600">Smart India Hackathon 2025</p>
          </div>
        </div>

        {/* User Info */}
        <div
          className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 cursor-pointer hover:bg-green-500/20 transition-colors"
          onClick={() => onNavigate('profile')}
        >
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <User className="w-4 h-4 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">राम कुमार</p>
            <p className="text-xs text-green-300">FLW • Sohna Block</p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="mt-3 bg-black p-2 rounded-md">
          <LanguageSwitcher
            variant="default"
          // className="text-white border border-gray-700 hover:bg-gray-800 transition-colors"
          />
        </div>

      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              className={`w-full justify-start h-auto p-3 ${currentPage === item.id
                ? "bg-green-500 text-black hover:bg-green-400" 
                  : "text-white bg-black hover:bg-green-500/20 hover:text-green-400"
                }`}
              onClick={() => onNavigate(item.id)}
            >
              <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${currentPage === item.id ? "text-black" : "text-green-400"
                }`} />
              <div className="text-left flex-1">
                <div className="font-medium">{item.label}</div>
                <div className={`text-xs mt-0.5 ${currentPage === item.id ? "text-black" : "text-green-300"
                  }`}>
                  {item.description}
                </div>
              </div>
            </Button>
          ))}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-green-500/20">
        {/* Connection Status */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/20 border border-green-500/30">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">Connected to BPA</span>
        </div>
      </div>
    </div>
  );
}