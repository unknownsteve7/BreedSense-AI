import { Button } from './ui/button';
import {
    Home,
    Camera,
    Video,
    Database,
    FileText,
    Phone,
    History,
    Settings,
    User,
    Bell
} from 'lucide-react';

interface NavigationProps {
    currentPage: string;
    onNavigate: (page: string) => void;
}

export function SimpleNavigation({ currentPage, onNavigate }: NavigationProps) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview & Statistics' },
        { id: 'camera', label: 'Camera', icon: Camera, description: 'Capture & Identify' },
        { id: 'video', label: 'Video', icon: Video, description: 'Process Videos' },
        { id: 'breeds', label: 'Breeds', icon: Database, description: 'Browse Breeds' },
        { id: 'reports', label: 'Reports', icon: FileText, description: 'FLW Reports' },
        { id: 'contacts', label: 'Contacts', icon: Phone, description: 'Emergency Contacts' },
        { id: 'history', label: 'History', icon: History, description: 'Past Identifications' },
        { id: 'settings', label: 'Settings', icon: Settings, description: 'App Settings' },
    ];

    return (
        <nav className="bg-slate-800/50 backdrop-blur border-b border-green-500/20">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <span className="text-black font-bold text-sm">BP</span>
                            </div>
                            <span className="text-white font-semibold">Bharath Pasudhan</span>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.id;

                            return (
                                <Button
                                    key={item.id}
                                    variant={isActive ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => onNavigate(item.id)}
                                    className={`flex items-center space-x-2 ${isActive
                                        ? "bg-green-500 text-black hover:bg-green-400"
                                        : "text-gray-300 hover:text-white hover:bg-slate-700"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden lg:inline">{item.label}</span>
                                </Button>
                            );
                        })}
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                            <Bell className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                            <User className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}