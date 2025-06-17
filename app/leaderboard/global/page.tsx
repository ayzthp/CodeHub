'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LeaderboardTable, { LeaderboardUser } from '@/components/LeaderboardTable';
import { ArrowLeft, Trophy, Users, Target, GitBranch } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function GlobalLeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalColleges: 0,
    totalProblems: 0,
    avgRating: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const fetchedUsers: LeaderboardUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Convert the existing user data structure to LeaderboardUser format
        const user: LeaderboardUser = {
          id: doc.id,
          name: data.name || 'Unknown User',
          email: data.email || '',
          college: data.college || 'Unknown College',
          stats: {
            leetcode: {
              totalSolved: data.stats?.leetcode?.problemsSolved || 0,
              easy: data.stats?.leetcode?.easy || 0,
              medium: data.stats?.leetcode?.medium || 0,
              hard: data.stats?.leetcode?.hard || 0,
            },
            codeforces: {
              rating: data.stats?.codeforces?.rating || 0,
              maxRating: data.stats?.codeforces?.maxRating || 0,
            },
            github: {
              followers: data.stats?.github?.followers || 0,
              publicRepos: data.stats?.github?.repoCount || 0,
            },
            atcoder: {
              rating: data.stats?.atcoder?.rating || 0,
            },
          },
        };
        
        fetchedUsers.push(user);
      });

      setUsers(fetchedUsers);
      
      // Calculate stats
      const colleges = new Set(fetchedUsers.map(u => u.college));
      const totalProblems = fetchedUsers.reduce((sum, u) => sum + u.stats.leetcode.totalSolved, 0);
      const avgRating = fetchedUsers.length > 0 
        ? fetchedUsers.reduce((sum, u) => sum + u.stats.codeforces.rating, 0) / fetchedUsers.length 
        : 0;

      setStats({
        totalUsers: fetchedUsers.length,
        totalColleges: colleges.size,
        totalProblems,
        avgRating: Math.round(avgRating)
      });

    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load leaderboard data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-orange-600 hover:text-orange-800">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">Global Leaderboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/leaderboard">
                  <Trophy className="h-4 w-4 mr-2" />
                  All Leaderboards
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all colleges</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Colleges</CardTitle>
              <Trophy className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalColleges}</div>
              <p className="text-xs text-muted-foreground">Participating institutions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProblems.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total across all users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg CF Rating</CardTitle>
              <GitBranch className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating}</div>
              <p className="text-xs text-muted-foreground">Community average</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Colleges Preview */}
        {!isLoading && users.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span>Top Colleges</span>
              </CardTitle>
              <CardDescription>Leading institutions by total problems solved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from(
                  users.reduce((acc, user) => {
                    const college = user.college;
                    if (!acc.has(college)) {
                      acc.set(college, { 
                        name: college, 
                        totalSolved: 0, 
                        userCount: 0,
                        avgRating: 0,
                        totalRating: 0
                      });
                    }
                    const data = acc.get(college)!;
                    data.totalSolved += user.stats.leetcode.totalSolved;
                    data.userCount += 1;
                    data.totalRating += user.stats.codeforces.rating;
                    data.avgRating = Math.round(data.totalRating / data.userCount);
                    return acc;
                  }, new Map())
                )
                .sort(([,a], [,b]) => b.totalSolved - a.totalSolved)
                .slice(0, 3)
                .map(([college, data], index) => (
                  <div key={college} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-blue-600">
                        #{index + 1}
                      </Badge>
                      <Button asChild variant="link" size="sm" className="h-auto p-0">
                        <Link href={`/leaderboard/${encodeURIComponent(college)}`}>
                          View Details →
                        </Link>
                      </Button>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{college}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{data.totalSolved.toLocaleString()} problems solved</div>
                      <div>{data.userCount} participants</div>
                      <div>Avg Rating: {data.avgRating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Leaderboard */}
        <LeaderboardTable users={users} isLoading={isLoading} />

        {/* Call to Action */}
        {!isLoading && users.length > 0 && (
          <Card className="mt-8">
            <CardContent className="text-center py-8">
              <Trophy className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Join the Competition!</h3>
              <p className="text-gray-600 mb-4">
                Keep coding and climbing the leaderboard. Every problem solved counts!
              </p>
              <div className="flex justify-center space-x-4">
                <Button asChild>
                  <Link href="/dashboard">
                    <Target className="h-4 w-4 mr-2" />
                    View Your Progress
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/profile/settings">
                    <Users className="h-4 w-4 mr-2" />
                    Update Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
} 