import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import {
  Settings as SettingsIcon,
  Bell,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  // Removed unused destructuring from useLanguage

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    autoSync: true,
    offlineMode: false,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast.success('Settings updated');
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <Card className="bg-card/90 border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-green-400 hover:bg-green-500/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <SettingsIcon className="w-5 h-5 text-green-500" />
              Application Settings
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Customize your Bharath Pasudhan experience
          </p>
        </CardHeader>
      </Card>

      {/* Notifications Section */}
      <Card className="bg-card/90 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Bell className="w-5 h-5 text-green-500" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Email Notifications</div>
              <div className="text-sm text-muted-foreground">Receive updates via email</div>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked: boolean) => handleSettingChange('emailNotifications', checked)}
              className="data-[state=checked]:bg-green-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">SMS Notifications</div>
              <div className="text-sm text-muted-foreground">Receive updates via SMS</div>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(checked: boolean) => handleSettingChange('smsNotifications', checked)}
              className="data-[state=checked]:bg-green-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Push Notifications</div>
              <div className="text-sm text-muted-foreground">Receive browser notifications</div>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked: boolean) => handleSettingChange('pushNotifications', checked)}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Sync Section */}
      <Card className="bg-card/90 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <RefreshCw className="w-5 h-5 text-green-500" />
            Data & Sync
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Auto Sync</div>
              <div className="text-sm text-muted-foreground">Automatically sync data when online</div>
            </div>
            <Switch
              checked={settings.autoSync}
              onCheckedChange={(checked: boolean) => handleSettingChange('autoSync', checked)}
              className="data-[state=checked]:bg-green-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Offline Mode</div>
              <div className="text-sm text-muted-foreground">Enable offline functionality</div>
            </div>
            <Switch
              checked={settings.offlineMode}
              onCheckedChange={(checked: boolean) => handleSettingChange('offlineMode', checked)}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card className="bg-card/90 border-green-500/20">
        <CardContent className="pt-6">
          <Button
            onClick={handleSaveSettings}
            className="bg-green-500 hover:bg-green-600 text-black font-medium px-6"
          >
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}