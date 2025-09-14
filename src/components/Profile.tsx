import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  User,
  ArrowLeft,
  Edit,
  Activity,
  Trophy,
  Bell,
  Settings as SettingsIcon,
  History
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileProps {
  onNavigate?: (page: string) => void;
}

export function Profile({ onNavigate }: ProfileProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'Field Worker',
    employeeId: 'FW001',
    email: 'rajesh.kumar@gov.in',
    phone: '+91 98765 43210',
    district: 'Demo District',
    block: 'Haveli Block',
    village: 'Kharadi Village'
  });

  const activityStats = {
    totalUploads: 127,
    thisMonth: 23,
    accuracyRate: 94
  };

  // achievements placeholder removed to avoid unused variable warnings

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <Card className="bg-card/90 border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate?.('dashboard')}
                className="text-green-400 hover:bg-green-500/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <User className="w-5 h-5 text-green-500" />
              User Profile
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            onClick={() => onNavigate?.('history')}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            onClick={() => onNavigate?.('notifications')}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
            onClick={() => onNavigate?.('settings')}
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card className="bg-card/90 border-green-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-green-400">Profile Information</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Manage your personal details
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="border-green-500/30 hover:bg-green-500/10 text-green-400"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* User Avatar and Role */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 bg-green-500">
                      <AvatarFallback className="text-black font-bold text-lg">
                        FW
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-white">Field Worker</h3>
                      <p className="text-sm text-muted-foreground">Employee ID: {profileData.employeeId}</p>
                      <Badge className="mt-1 bg-green-500/20 text-green-400 border-green-500/30">
                        Field Level Worker
                      </Badge>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-green-400 block mb-2">Full Name</label>
                      <Input
                        value={profileData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        disabled={!isEditing}
                        className="bg-muted/50 border-green-500/30 text-white disabled:opacity-70"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-green-400 block mb-2">Email</label>
                      <Input
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="bg-muted/50 border-green-500/30 text-white disabled:opacity-70"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-green-400 block mb-2">Phone</label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="bg-muted/50 border-green-500/30 text-white disabled:opacity-70"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-green-400 block mb-2">District</label>
                      <Input
                        value={profileData.district}
                        onChange={(e) => handleInputChange('district', e.target.value)}
                        disabled={!isEditing}
                        className="bg-muted/50 border-green-500/30 text-white disabled:opacity-70"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-green-400 block mb-2">Block</label>
                      <Input
                        value={profileData.block}
                        onChange={(e) => handleInputChange('block', e.target.value)}
                        disabled={!isEditing}
                        className="bg-muted/50 border-green-500/30 text-white disabled:opacity-70"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-green-400 block mb-2">Village</label>
                      <Input
                        value={profileData.village}
                        onChange={(e) => handleInputChange('village', e.target.value)}
                        disabled={!isEditing}
                        className="bg-muted/50 border-green-500/30 text-white disabled:opacity-70"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-green-500 hover:bg-green-600 text-black"
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="border-green-500/30 hover:bg-green-500/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Activity Stats and Achievements */}
            <div className="space-y-6">
              {/* Activity Stats */}
              <Card className="bg-gradient-to-br from-green-600 to-green-500 border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Activity className="w-5 h-5" />
                    Activity Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-black font-medium">Total Uploads</span>
                    <span className="text-black font-bold text-xl">{activityStats.totalUploads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black font-medium">This Month</span>
                    <span className="text-black font-bold text-xl">{activityStats.thisMonth}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black font-medium">Accuracy Rate</span>
                    <span className="text-black font-bold text-xl">{activityStats.accuracyRate}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card className="bg-card/90 border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Trophy className="w-5 h-5 text-green-500" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-green-500/30 bg-green-500/5">
                    <div className="text-2xl">🏆</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm">Expert User</h4>
                      <p className="text-xs text-muted-foreground">100+ successful identifications</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg border border-green-500/30 bg-green-500/5">
                    <div className="text-2xl">⭐</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm">Consistent Reporter</h4>
                      <p className="text-xs text-muted-foreground">6 months of regular reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}