'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LeaderboardTable, { LeaderboardUser } from '@/components/LeaderboardTable';
import { ArrowLeft, Trophy, Users, Target, School } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

export default function CollegeLeaderboardPage() {
  const params = useParams();
  const college = decodeURIComponent(params?.college as string || "");
  
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProblems: 0,
    avgRating: 0,
    topUser: null as LeaderboardUser | null
  });

  useEffect(() => {
    if (college) {
      fetchCollegeUsers();
    }
  }, [college]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCollegeUsers = async () => {
    setIsLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('college', '==', college),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const fetchedUsers: LeaderboardUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        const user: LeaderboardUser = {
          id: doc.id,
          name: data.name || 'Unknown User',
          email: data.email || '',
          college: data.college || college,
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
      const totalProblems = fetchedUsers.reduce((sum, u) => sum + u.stats.leetcode.totalSolved, 0);
      const avgRating = fetchedUsers.length > 0 
        ? fetchedUsers.reduce((sum, u) => sum + u.stats.codeforces.rating, 0) / fetchedUsers.length 
        : 0;
      
      // Find top user by LeetCode problems
      const topUser = fetchedUsers.length > 0 
        ? fetchedUsers.reduce((top, current) => 
            current.stats.leetcode.totalSolved > top.stats.leetcode.totalSolved ? current : top
          )
        : null;

      setStats({
        totalUsers: fetchedUsers.length,
        totalProblems,
        avgRating: Math.round(avgRating),
        topUser
      });

    } catch (error) {
      console.error('Error fetching college users:', error);
      toast.error(`Failed to load ${college} leaderboard data`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/leaderboard/global" className="text-blue-600 hover:text-blue-800">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <School className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{college}</h1>
                  <p className="text-sm text-gray-600">College Leaderboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/leaderboard/global">
                  <Trophy className="h-4 w-4 mr-2" />
                  Global Rankings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* College Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Active participants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProblems.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total by all students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg CF Rating</CardTitle>
              <Trophy className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating}</div>
              <p className="text-xs text-muted-foreground">College average</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Performer Highlight */}
        {!isLoading && stats.topUser && (
          <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <span>College Champion</span>
              </CardTitle>
              <CardDescription>Top performer from {college}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{stats.topUser.name}</h3>
                    <p className="text-gray-600">{stats.topUser.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className="bg-orange-100 text-orange-800">
                        {stats.topUser.stats.leetcode.totalSolved} LeetCode
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {stats.topUser.stats.codeforces.rating} CF Rating
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-800">
                        {stats.topUser.stats.github.followers} GitHub Followers
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">🏆</div>
                  <div className="text-sm text-gray-600">Champion</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Leaderboard */}
        <LeaderboardTable users={users} isLoading={isLoading} college={college} />

        {/* Empty State */}
        {!isLoading && users.length === 0 && (
          <Card className="mt-8">
            <CardContent className="text-center py-12">
              <School className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-600 mb-2">No Students Found</h3>
              <p className="text-gray-500 mb-4">
                No students from {college} have joined the platform yet.
              </p>
              <div className="flex justify-center space-x-4">
                <Button asChild>
                  <Link href="/signup">
                    <Users className="h-4 w-4 mr-2" />
                    Join Now
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/leaderboard/global">
                    <Trophy className="h-4 w-4 mr-2" />
                    View Global Rankings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        {!isLoading && users.length > 0 && (
          <Card className="mt-8">
            <CardContent className="text-center py-8">
              <School className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Represent {college}!</h3>
              <p className="text-gray-600 mb-4">
                Keep coding and put your college on the map. Every problem solved contributes to your college&apos;s ranking!
              </p>
              <div className="flex justify-center space-x-4">
                <Button asChild>
                  <Link href="/dashboard">
                    <Target className="h-4 w-4 mr-2" />
                    Start Coding
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/compare">
                    <Users className="h-4 w-4 mr-2" />
                    Compare with Peers
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