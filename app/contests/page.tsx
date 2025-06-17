'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Trophy, 
  Bell, 
  BellOff, 
  ExternalLink,
  ArrowLeft,
  Target,
  Users,

  Timer,
  Globe,
  Code,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, format, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';

interface Contest {
  name: string;
  url: string;
  start_time: string;
  end_time: string;
  duration: string;
  site: string;
  in_24_hours: string;
  status: string;
}

interface UserReminders {
  contestReminders: string[];
}

export default function ContestsPage() {
  const { user } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [userReminders, setUserReminders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingReminder, setIsUpdatingReminder] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchContests();
      if (user) {
        await fetchUserReminders();
      }
    };
    loadData();
  }, [user]);

  const fetchContests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/contests');
      if (!response.ok) throw new Error('Failed to fetch contests');
      
      // Check if we're using mock data
      const isMock = response.headers.get('X-Data-Source') === 'mock';
      setIsUsingMockData(isMock);
      
      const data: Contest[] = await response.json();
      setContests(data);
      
      if (isMock) {
        toast.info('Using sample contest data - external API unavailable');
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
      toast.error('Failed to load contests. Please try again.');
      setContests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserReminders = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserReminders;
        setUserReminders(userData.contestReminders || []);
      }
    } catch (error) {
      console.error('Error fetching user reminders:', error);
    }
  };

  const toggleReminder = async (contestName: string) => {
    if (!user) {
      toast.error('Please login to set reminders');
      return;
    }

    if (isUpdatingReminder) return;

    setIsUpdatingReminder(contestName);
    try {
      const userRef = doc(db, 'users', user.uid);
      const isReminderSet = userReminders.includes(contestName);

      if (isReminderSet) {
        // Remove reminder
        await updateDoc(userRef, {
          contestReminders: arrayRemove(contestName)
        });
        setUserReminders(prev => prev.filter(name => name !== contestName));
        toast.success('Reminder removed');
      } else {
        // Add reminder
        await updateDoc(userRef, {
          contestReminders: arrayUnion(contestName)
        });
        setUserReminders(prev => [...prev, contestName]);
        toast.success('Reminder set! You\'ll be notified before the contest');
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
    } finally {
      setIsUpdatingReminder(null);
    }
  };

  const getContestStatus = (contest: Contest) => {
    const now = new Date();
    const startTime = new Date(contest.start_time);
    const endTime = new Date(contest.end_time);

    if (isBefore(now, startTime)) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800', text: 'Upcoming' };
    } else if (isAfter(now, startTime) && isBefore(now, endTime)) {
      return { status: 'live', color: 'bg-green-100 text-green-800', text: 'Live Now' };
    } else {
      return { status: 'ended', color: 'bg-gray-100 text-gray-800', text: 'Ended' };
    }
  };

  const getPlatformIcon = (site: string) => {
    const siteLower = site.toLowerCase();
    if (siteLower.includes('codeforces')) return <Code className="h-4 w-4" />;
    if (siteLower.includes('leetcode')) return <Target className="h-4 w-4" />;
    if (siteLower.includes('atcoder')) return <Zap className="h-4 w-4" />;
    if (siteLower.includes('codechef')) return <Trophy className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  const filteredContests = selectedPlatform === 'all' 
    ? contests 
    : contests.filter(contest => 
        contest.site.toLowerCase().includes(selectedPlatform.toLowerCase())
      );

  const upcomingContests = filteredContests.filter(contest => getContestStatus(contest).status === 'upcoming');
  const liveContests = filteredContests.filter(contest => getContestStatus(contest).status === 'live');
  const platforms = Array.from(new Set(contests.map(contest => contest.site))).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-green-600 hover:text-green-800">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">Contest Reminders</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={fetchContests}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <Timer className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Mock Data Notice */}
        {isUsingMockData && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-yellow-400 rounded-full"></div>
              <p className="text-yellow-800 font-medium">
                Demo Mode: Showing sample contest data
              </p>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              External contest API is currently unavailable. The reminder functionality works with real data when available.
            </p>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Contests</CardTitle>
              <Zap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{liveContests.length}</div>
              <p className="text-xs text-muted-foreground">Happening now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingContests.length}</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Reminders</CardTitle>
              <Bell className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{userReminders.length}</div>
              <p className="text-xs text-muted-foreground">Active reminders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platforms</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{platforms.length}</div>
              <p className="text-xs text-muted-foreground">Different sites</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Filter by Platform</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedPlatform === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform('all')}
              >
                All Platforms ({contests.length})
              </Button>
              {platforms.map(platform => {
                const count = contests.filter(c => c.site === platform).length;
                return (
                  <Button
                    key={platform}
                    variant={selectedPlatform === platform ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPlatform(platform)}
                    className="flex items-center space-x-2"
                  >
                    {getPlatformIcon(platform)}
                    <span>{platform} ({count})</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Contest Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Contests ({filteredContests.length})</TabsTrigger>
            <TabsTrigger value="live">Live Now ({liveContests.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingContests.length})</TabsTrigger>
          </TabsList>

          {/* All Contests Tab */}
          <TabsContent value="all">
            <ContestList 
              contests={filteredContests}
              userReminders={userReminders}
              onToggleReminder={toggleReminder}
              isUpdatingReminder={isUpdatingReminder}
              isLoading={isLoading}
              user={user}
            />
          </TabsContent>

          {/* Live Contests Tab */}
          <TabsContent value="live">
            <ContestList 
              contests={liveContests}
              userReminders={userReminders}
              onToggleReminder={toggleReminder}
              isUpdatingReminder={isUpdatingReminder}
              isLoading={isLoading}
              user={user}
            />
          </TabsContent>

          {/* Upcoming Contests Tab */}
          <TabsContent value="upcoming">
            <ContestList 
              contests={upcomingContests}
              userReminders={userReminders}
              onToggleReminder={toggleReminder}
              isUpdatingReminder={isUpdatingReminder}
              isLoading={isLoading}
              user={user}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

interface ContestListProps {
  contests: Contest[];
  userReminders: string[];
  onToggleReminder: (contestName: string) => void;
  isUpdatingReminder: string | null;
  isLoading: boolean;
  user: { uid: string } | null;
}

function ContestList({ 
  contests, 
  userReminders, 
  onToggleReminder, 
  isUpdatingReminder, 
  isLoading,
  user 
}: ContestListProps) {
  const getContestStatus = (contest: Contest) => {
    const now = new Date();
    const startTime = new Date(contest.start_time);
    const endTime = new Date(contest.end_time);

    if (isBefore(now, startTime)) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800', text: 'Upcoming' };
    } else if (isAfter(now, startTime) && isBefore(now, endTime)) {
      return { status: 'live', color: 'bg-green-100 text-green-800', text: 'Live Now' };
    } else {
      return { status: 'ended', color: 'bg-gray-100 text-gray-800', text: 'Ended' };
    }
  };

  const getPlatformIcon = (site: string) => {
    const siteLower = site.toLowerCase();
    if (siteLower.includes('codeforces')) return <Code className="h-4 w-4" />;
    if (siteLower.includes('leetcode')) return <Target className="h-4 w-4" />;
    if (siteLower.includes('atcoder')) return <Zap className="h-4 w-4" />;
    if (siteLower.includes('codechef')) return <Trophy className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  const getPlatformColor = (site: string) => {
    const siteLower = site.toLowerCase();
    if (siteLower.includes('codeforces')) return 'border-blue-200 bg-blue-50';
    if (siteLower.includes('leetcode')) return 'border-orange-200 bg-orange-50';
    if (siteLower.includes('atcoder')) return 'border-purple-200 bg-purple-50';
    if (siteLower.includes('codechef')) return 'border-yellow-200 bg-yellow-50';
    return 'border-gray-200 bg-gray-50';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (contests.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No contests found</h3>
          <p className="text-gray-500">Check back later for upcoming programming contests!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {contests.map((contest, index) => {
        const status = getContestStatus(contest);
        const isReminderSet = userReminders.includes(contest.name);
        const startTime = new Date(contest.start_time);
        const endTime = new Date(contest.end_time);
        
        return (
          <Card 
            key={index} 
            className={`hover:shadow-lg transition-shadow duration-200 ${getPlatformColor(contest.site)}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 flex items-center space-x-2">
                    {getPlatformIcon(contest.site)}
                    <span className="line-clamp-2">{contest.name}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(startTime, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Timer className="h-4 w-4" />
                      <span>{contest.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={status.color}>
                    {status.text}
                  </Badge>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    {getPlatformIcon(contest.site)}
                    <span>{contest.site}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>
                    {status.status === 'upcoming' 
                      ? `Starts ${formatDistanceToNow(startTime, { addSuffix: true })}` 
                      : status.status === 'live'
                      ? `Ends ${formatDistanceToNow(endTime, { addSuffix: true })}`
                      : `Ended ${formatDistanceToNow(endTime, { addSuffix: true })}`
                    }
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Reminder Toggle */}
                  {user && status.status === 'upcoming' && (
                    <div className="flex items-center space-x-2">
                      <label htmlFor={`reminder-${index}`} className="text-sm font-medium cursor-pointer">
                        {isReminderSet ? (
                          <Bell className="h-4 w-4 text-purple-600" />
                        ) : (
                          <BellOff className="h-4 w-4 text-gray-400" />
                        )}
                      </label>
                      <Switch
                        id={`reminder-${index}`}
                        checked={isReminderSet}
                        onCheckedChange={() => onToggleReminder(contest.name)}
                        disabled={isUpdatingReminder === contest.name}
                      />
                    </div>
                  )}
                  
                  {/* Contest Link */}
                  <Button asChild size="sm">
                    <a 
                      href={contest.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2"
                    >
                      <span>{status.status === 'live' ? 'Join Now' : 'View Contest'}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 