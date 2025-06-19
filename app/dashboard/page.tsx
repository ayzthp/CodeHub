'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

import { auth, db } from '@/lib/firebase';
import { fetchLeetCodeStats, fetchCodeforcesStats, fetchAtCoderStats, fetchGitHubStats } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Code, LogOut, RefreshCw, Trophy, GitBranch, Target, Zap, Award, Users, TrendingUp, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface UserData {
  name: string;
  college: string;
  year: string;
  department: string;
  email: string;
  handles: {
    leetcode: string;
    codeforces: string;
    atcoder: string;
    github: string;
  };
  stats: {
    leetcode: {
      problemsSolved: number;
      totalQuestions: number;
      streak: number;
      easy: number;
      medium: number;
      hard: number;
      acceptanceRate: number;
      ranking: number | null;
      reputation: number;
    };
    codeforces: {
      rating: number;
      maxRating: number;
      rank: string;
      maxRank: string;
      handle: string;
      firstName?: string;
      lastName?: string;
      country?: string;
      organization?: string;
      contribution: number;
    };
    atcoder: {
      rating: number;
      maxRating: number;
      color: string;
      rank: number;
      competitions: number;
    };
    github: {
      repoCount: number;
      stars: number;
      commits: number;
      followers: number;
      following: number;
      name: string | null;
      bio: string | null;
      location: string | null;
      company: string | null;
    };
  };
  lastUpdated: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch {
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      router.push('/');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const handleSync = async () => {
    if (!user || !userData) return;

    setIsSyncing(true);
    try {
      toast.info('Syncing your latest stats...');

      const [leetcodeStats, codeforcesStats, atcoderStats, githubStats] = await Promise.all([
        fetchLeetCodeStats(userData.handles.leetcode),
        fetchCodeforcesStats(userData.handles.codeforces),
        fetchAtCoderStats(userData.handles.atcoder),
        fetchGitHubStats(userData.handles.github),
      ]);

      const updatedStats = {
        leetcode: leetcodeStats,
        codeforces: codeforcesStats,
        atcoder: atcoderStats,
        github: githubStats,
      };

      await updateDoc(doc(db, 'users', user.uid), {
        stats: updatedStats,
        lastUpdated: new Date().toISOString(),
      });

      setUserData(prev => prev ? { ...prev, stats: updatedStats, lastUpdated: new Date().toISOString() } : null);
      toast.success('Stats updated successfully!');
    } catch {
      toast.error('Failed to sync stats');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User data not found</h2>
          <Button onClick={() => router.push('/signup')}>Complete Profile</Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Code className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">CodeHub</span>
              </div>
              <div className="flex items-center space-x-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/compare">
                    <Users className="h-4 w-4 mr-2" />
                    Compare
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/leaderboard/global">
                    <Trophy className="h-4 w-4 mr-2" />
                    Leaderboard
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/blogs">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Blogs
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/contests">
                    <Trophy className="h-4 w-4 mr-2" />
                    Contests
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/room/new">
                    <Users className="h-4 w-4 mr-2" />
                    Create Room
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/analytics">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics
                  </Link>
                </Button>
                <Button
                  onClick={handleSync}
                  disabled={isSyncing}
                  variant="outline"
                  size="sm"
                >
                  {isSyncing ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Sync Now
                </Button>
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* User Profile Section */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-2xl bg-blue-600 text-white">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{userData.name}</CardTitle>
                    <CardDescription className="text-lg">
                      {userData.year} • {userData.department} • {userData.college}
                    </CardDescription>
                    <p className="text-sm text-gray-500 mt-2">
                      Last updated: {new Date(userData.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Stats Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="leetcode">LeetCode</TabsTrigger>
              <TabsTrigger value="codeforces">Codeforces</TabsTrigger>
              <TabsTrigger value="atcoder">AtCoder</TabsTrigger>
              <TabsTrigger value="github">GitHub</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">LeetCode Problems</CardTitle>
                    <Target className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userData.stats.leetcode.problemsSolved}</div>
                    <p className="text-xs text-muted-foreground">
                      {userData.stats.leetcode.streak} day streak
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Codeforces Rating</CardTitle>
                    <Trophy className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userData.stats.codeforces.rating}</div>
                    <p className="text-xs text-muted-foreground">
                      {userData.stats.codeforces.rank}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">AtCoder Rating</CardTitle>
                    <Award className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userData.stats.atcoder.rating}</div>
                    <p className="text-xs text-muted-foreground">
                      {userData.stats.atcoder.color}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">GitHub Repos</CardTitle>
                    <GitBranch className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userData.stats.github.repoCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {userData.stats.github.stars} stars
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* LeetCode Tab */}
            <TabsContent value="leetcode" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-600">LC</span>
                    </div>
                    <span>LeetCode Stats</span>
                  </CardTitle>
                  <CardDescription>Handle: @{userData.handles.leetcode}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">{userData.stats.leetcode.problemsSolved}</div>
                      <p className="text-sm text-gray-600">Total Solved</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{userData.stats.leetcode.easy}</div>
                      <p className="text-sm text-gray-600">Easy</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">{userData.stats.leetcode.medium}</div>
                      <p className="text-sm text-gray-600">Medium</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{userData.stats.leetcode.hard}</div>
                      <p className="text-sm text-gray-600">Hard</p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-5 w-5 text-orange-600" />
                          <span className="font-semibold text-orange-800">Streak: {userData.stats.leetcode.streak} days</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-800">Acceptance: {userData.stats.leetcode.acceptanceRate.toFixed(1)}%</span>
                        </div>
                        {userData.stats.leetcode.ranking && (
                          <div className="flex items-center space-x-2">
                            <Trophy className="h-5 w-5 text-purple-600" />
                            <span className="font-semibold text-purple-800">Rank: #{userData.stats.leetcode.ranking.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold text-blue-800">Total Questions: {userData.stats.leetcode.totalQuestions.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-indigo-800">Reputation: {userData.stats.leetcode.reputation.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Codeforces Tab */}
            <TabsContent value="codeforces" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">CF</span>
                    </div>
                    <span>Codeforces Stats</span>
                  </CardTitle>
                  <CardDescription>
                    Handle: @{userData.handles.codeforces}
                    {userData.stats.codeforces.firstName && userData.stats.codeforces.lastName && (
                      <span> • {userData.stats.codeforces.firstName} {userData.stats.codeforces.lastName}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{userData.stats.codeforces.rating}</div>
                      <p className="text-sm text-gray-600">Current Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{userData.stats.codeforces.maxRating}</div>
                      <p className="text-sm text-gray-600">Max Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-indigo-600 capitalize">{userData.stats.codeforces.rank}</div>
                      <p className="text-sm text-gray-600">Current Rank</p>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-cyan-600 capitalize">{userData.stats.codeforces.maxRank}</div>
                      <p className="text-sm text-gray-600">Max Rank</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{userData.stats.codeforces.contribution}</div>
                      <p className="text-sm text-gray-600">Contribution</p>
                    </div>
                    {(userData.stats.codeforces.country || userData.stats.codeforces.organization) && (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-1">
                        {userData.stats.codeforces.country && (
                          <p className="text-sm text-gray-700"><strong>Country:</strong> {userData.stats.codeforces.country}</p>
                        )}
                        {userData.stats.codeforces.organization && (
                          <p className="text-sm text-gray-700"><strong>Organization:</strong> {userData.stats.codeforces.organization}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AtCoder Tab */}
            <TabsContent value="atcoder" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">AC</span>
                    </div>
                    <span>AtCoder Stats</span>
                  </CardTitle>
                  <CardDescription>Handle: @{userData.handles.atcoder}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{userData.stats.atcoder.rating}</div>
                      <p className="text-sm text-gray-600">Current Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600">{userData.stats.atcoder.maxRating}</div>
                      <p className="text-sm text-gray-600">Max Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-teal-600">{userData.stats.atcoder.color}</div>
                      <p className="text-sm text-gray-600">Color</p>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{userData.stats.atcoder.competitions}</div>
                      <p className="text-sm text-gray-600">Competitions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* GitHub Tab */}
            <TabsContent value="github" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">GH</span>
                    </div>
                    <span>GitHub Stats</span>
                  </CardTitle>
                  <CardDescription>
                    Username: @{userData.handles.github}
                    {userData.stats.github.name && (
                      <span> • {userData.stats.github.name}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-600">{userData.stats.github.repoCount}</div>
                      <p className="text-sm text-gray-600">Repositories</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">{userData.stats.github.stars}</div>
                      <p className="text-sm text-gray-600">Total Stars</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{userData.stats.github.commits}</div>
                      <p className="text-sm text-gray-600">Est. Commits</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{userData.stats.github.followers}</div>
                      <p className="text-sm text-gray-600">Followers</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{userData.stats.github.following}</div>
                      <p className="text-sm text-gray-600">Following</p>
                    </div>
                  </div>
                  {(userData.stats.github.bio || userData.stats.github.location || userData.stats.github.company) && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                      {userData.stats.github.bio && (
                        <p className="text-sm text-gray-700"><strong>Bio:</strong> {userData.stats.github.bio}</p>
                      )}
                      {userData.stats.github.location && (
                        <p className="text-sm text-gray-700"><strong>Location:</strong> {userData.stats.github.location}</p>
                      )}
                      {userData.stats.github.company && (
                        <p className="text-sm text-gray-700"><strong>Company:</strong> {userData.stats.github.company}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
} 