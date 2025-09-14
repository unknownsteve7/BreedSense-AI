import { useState, useMemo, useEffect } from 'react';
import type { VetContact } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import {
  Phone,
  Mail,
  MapPin,
  Search,
  Clock,
  UserCheck,
  Shield,
  AlertTriangle,
  PhoneCall,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

export function ContactDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [contacts, setContacts] = useState<VetContact[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vxai_vet_contacts_v1');
      if (stored) {
        setContacts(JSON.parse(stored));
      } else {
        setContacts([]);
      }
    } catch (e) {
      console.warn('Failed to load contacts from localStorage', e);
      setContacts([]);
    }
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.specialty || []).some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDistrict = districtFilter === 'all' || contact.district === districtFilter;
      const matchesSpecialty = specialtyFilter === 'all' ||
        (contact.specialty || []).some((s: string) => s.toLowerCase().includes(specialtyFilter.toLowerCase()));
      const matchesAvailability = availabilityFilter === 'all' ||
        (availabilityFilter === '24x7' && contact.available24x7) ||
        (availabilityFilter === 'office' && !contact.available24x7);

      return matchesSearch && matchesDistrict && matchesSpecialty && matchesAvailability;
    });
  }, [searchTerm, districtFilter, specialtyFilter, availabilityFilter]);

  const uniqueDistricts = [...new Set(contacts.map(contact => contact.district))];
  const uniqueSpecialties = [...new Set(contacts.flatMap(contact => contact.specialty || []))];

  const handleCall = (phoneNumber: string, contactName: string) => {
    // In a real app, this would initiate a call
    if (navigator.userAgent.match(/Mobile|Android|iPhone/)) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      toast.success(`Calling ${contactName} at ${phoneNumber}`);
    }
  };

  const handleSMS = (phoneNumber: string, contactName: string) => {
    // In a real app, this would open SMS app
    if (navigator.userAgent.match(/Mobile|Android|iPhone/)) {
      window.location.href = `sms:${phoneNumber}`;
    } else {
      toast.success(`Opening SMS to ${contactName} at ${phoneNumber}`);
    }
  };

  const emergencyContacts = [
    {
      name: 'Animal Helpline',
      number: '1962',
      description: 'National Animal Emergency Helpline'
    },
    {
      name: 'DoAH&D Emergency',
      number: '011-23381884',
      description: 'Department of Animal Husbandry Emergency Line'
    },
    {
      name: 'Veterinary Emergency',
      number: '1800-180-1551',
      description: 'State Veterinary Emergency Services'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Emergency Contacts */}
      <Card className="bg-card/90 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Emergency Contacts
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            For immediate veterinary emergencies and animal health crises
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencyContacts.map((contact, idx) => (
              <Card key={idx} className="bg-card/50 border-green-500/20">
                <CardContent className="pt-4 bg-card/50">
                  <div className="text-center">
                    <h3 className="font-medium text-white mb-1">{contact.name}</h3>
                    <p className="text-2xl font-bold text-orange-400 mb-2">{contact.number}</p>
                    <p className="text-xs text-muted-foreground mb-3">{contact.description}</p>
                    <Button
                      onClick={() => handleCall(contact.number, contact.name)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-black"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Emergency Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Directory */}
      <Card className="bg-card/90 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <UserCheck className="w-5 h-5 text-green-500" />
            Veterinary Contact Directory
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Find veterinarians, officers, and animal health experts in your area
          </p>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger>
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {uniqueDistricts.map(district => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {uniqueSpecialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty.toLowerCase()}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="24x7">24x7 Available</SelectItem>
                <SelectItem value="office">Office Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredContacts.length} of {contacts.length} contacts
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setDistrictFilter('all');
                setSpecialtyFilter('all');
                setAvailabilityFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow bg-card/50 border-green-500/20 hover:border-green-500/40">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{contact.name}</h3>
                        <p className="text-sm text-muted-foreground">{contact.designation}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {contact.available24x7 && (
                          <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                            <Clock className="w-3 h-3 mr-1" />
                            24x7
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-green-500/30 text-green-400">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{contact.district}</span>
                      {contact.block && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span>{contact.block}</span>
                        </>
                      )}
                    </div>

                    {/* Specialties */}
                    <div className="flex gap-1 flex-wrap">
                      {contact.specialty.map((specialty, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    {/* Contact Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCall(contact.phone, contact.name)}
                        className="flex-1"
                      >
                        <PhoneCall className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSMS(contact.phone, contact.name)}
                        className="flex-1"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        SMS
                      </Button>
                      {contact.email && (
                        <Button
                          variant="outline"
                          onClick={() => window.location.href = `mailto:${contact.email}`}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Contact Details */}
                    <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        <span>{contact.phone}</span>
                      </div>
                      {contact.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-8">
              <UserCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No contacts found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          <strong>Usage Tips:</strong> For emergencies, always call the emergency numbers first.
          Regular consultations can be scheduled through individual veterinarians.
          Keep this directory updated and report any incorrect information to your block office.
        </AlertDescription>
      </Alert>
    </div>
  );
}