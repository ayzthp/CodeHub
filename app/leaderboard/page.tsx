'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Target, 
  GitBranch, 
  TrendingUp,
  ArrowLeft,
  Star
} from 'lucide-react';
import Link from 'next/link';

// Mock leaderboard data - in a real app, this would come from a database
const mockLeaderboardData = {
  leetcode: [
    { name: 'Alice Chen', handle: 'alice_codes', problemsSolved: 1247, easy: 423, medium: 567, hard: 257, rank: 1 },
    { name: 'Bob Wilson', handle: 'bobcoder', problemsSolved: 1156, easy: 398, medium: 521, hard: 237, rank: 2 },
    { name: 'Carol Davis', handle: 'carol_dev', problemsSolved: 1089, easy: 367, medium: 489, hard: 233, rank: 3 },
    { name: 'David Kim', handle: 'davidk', problemsSolved: 987, easy: 345, medium: 432, hard: 210, rank: 4 },
    { name: 'Emma Rodriguez', handle: 'emma_r', problemsSolved: 923, easy: 321, medium: 398, hard: 204, rank: 5 },
    { name: 'Frank Zhang', handle: 'frankz', problemsSolved: 876, easy: 298, medium: 367, hard: 211, rank: 6 },
    { name: 'Grace Liu', handle: 'grace_l', problemsSolved: 834, easy: 289, medium: 345, hard: 200, rank: 7 },
    { name: 'Henry Park', handle: 'henryp', problemsSolved: 789, easy: 267, medium: 334, hard: 188, rank: 8 },
    { name: 'Ivy Johnson', handle: 'ivy_j', problemsSolved: 745, easy: 245, medium: 312, hard: 188, rank: 9 },
    { name: 'Jack Brown', handle: 'jackb', problemsSolved: 698, easy: 234, medium: 287, hard: 177, rank: 10 }
  ],
  codeforces: [
    { name: 'Alice Chen', handle: 'alice_cf', rating: 2134, maxRating: 2267, cfRank: 'Master', rank: 1 },
    { name: 'David Kim', handle: 'david_cf', rating: 1987, maxRating: 2043, cfRank: 'Candidate Master', rank: 2 },
    { name: 'Bob Wilson', handle: 'bob_cf', rating: 1876, maxRating: 1923, cfRank: 'Expert', rank: 3 },
    { name: 'Emma Rodriguez', handle: 'emma_cf', rating: 1743, maxRating: 1798, cfRank: 'Expert', rank: 4 },
    { name: 'Carol Davis', handle: 'carol_cf', rating: 1654, maxRating: 1687, cfRank: 'Specialist', rank: 5 },
    { name: 'Frank Zhang', handle: 'frank_cf', rating: 1587, maxRating: 1634, cfRank: 'Specialist', rank: 6 },
    { name: 'Grace Liu', handle: 'grace_cf', rating: 1523, maxRating: 1567, cfRank: 'Specialist', rank: 7 },
    { name: 'Henry Park', handle: 'henry_cf', rating: 1456, maxRating: 1489, cfRank: 'Specialist', rank: 8 },
    { name: 'Ivy Johnson', handle: 'ivy_cf', rating: 1398, maxRating: 1423, cfRank: 'Pupil', rank: 9 },
    { name: 'Jack Brown', handle: 'jack_cf', rating: 1334, maxRating: 1356, cfRank: 'Pupil', rank: 10 }
  ],
  github: [
    { name: 'Frank Zhang', handle: 'frankz', repos: 67, stars: 1234, followers: 456, rank: 1 },
    { name: 'Grace Liu', handle: 'grace_l', repos: 54, stars: 987, followers: 389, rank: 2 },
    { name: 'Alice Chen', handle: 'alice_codes', repos: 43, stars: 876, followers: 334, rank: 3 },
    { name: 'Henry Park', handle: 'henryp', repos: 39, stars: 743, followers: 298, rank: 4 },
    { name: 'Emma Rodriguez', handle: 'emma_r', repos: 36, stars: 654, followers: 267, rank: 5 },
    { name: 'David Kim', handle: 'davidk', repos: 33, stars: 589, followers: 245, rank: 6 },
    { name: 'Bob Wilson', handle: 'bobcoder', repos: 31, stars: 534, followers: 223, rank: 7 },
    { name: 'Ivy Johnson', handle: 'ivy_j', repos: 28, stars: 467, followers: 198, rank: 8 },
    { name: 'Carol Davis', handle: 'carol_dev', repos: 25, stars: 398, followers: 176, rank: 9 },
    { name: 'Jack Brown', handle: 'jackb', repos: 22, stars: 334, followers: 154, rank: 10 }
  ]
};

export default function LeaderboardPage() {
  const [selectedTab, setSelectedTab] = useState('leetcode');

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{position}</span>;
    }
  };

  const getRankBadge = (position: number) => {
    switch (position) {
      case 1:
        return <Badge className="bg-yellow-500 text-white">🥇 Champion</Badge>;
      case 2:
        return <Badge className="bg-gray-400 text-white">🥈 Runner-up</Badge>;
      case 3:
        return <Badge className="bg-amber-600 text-white">🥉 Third Place</Badge>;
      default:
        return <Badge variant="outline">#{position}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
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
                <span className="text-2xl font-bold text-gray-900">Community Leaderboard</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Competitors</CardTitle>
              <Trophy className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">Active this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47,892</div>
              <p className="text-xs text-muted-foreground">Across all platforms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GitHub Stars</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,456</div>
              <p className="text-xs text-muted-foreground">Community projects</p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leetcode" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>LeetCode</span>
            </TabsTrigger>
            <TabsTrigger value="codeforces" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Codeforces</span>
            </TabsTrigger>
            <TabsTrigger value="github" className="flex items-center space-x-2">
              <GitBranch className="h-4 w-4" />
              <span>GitHub</span>
            </TabsTrigger>
          </TabsList>

          {/* LeetCode Leaderboard */}
          <TabsContent value="leetcode" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <span>LeetCode Champions</span>
                </CardTitle>
                <CardDescription>Top performers by problems solved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLeaderboardData.leetcode.map((user, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${
                      index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10">
                          {getRankIcon(user.rank)}
                        </div>
                        <Avatar>
                          <AvatarFallback className="bg-orange-100 text-orange-600">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-lg">{user.name}</div>
                          <div className="text-sm text-gray-600">@{user.handle}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          {getRankBadge(user.rank)}
                        </div>
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                          {user.problemsSolved}
                        </div>
                        <div className="text-sm text-gray-600">
                          Easy: {user.easy} • Medium: {user.medium} • Hard: {user.hard}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Codeforces Leaderboard */}
          <TabsContent value="codeforces" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-blue-600" />
                  <span>Codeforces Masters</span>
                </CardTitle>
                <CardDescription>Top performers by current rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLeaderboardData.codeforces.map((user, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${
                      index < 3 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10">
                          {getRankIcon(user.rank)}
                        </div>
                        <Avatar>
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-lg">{user.name}</div>
                          <div className="text-sm text-gray-600">@{user.handle}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          {getRankBadge(user.rank)}
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {user.rating}
                        </div>
                                                 <div className="text-sm text-gray-600">
                           {user.cfRank} • Max: {user.maxRating}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GitHub Leaderboard */}
          <TabsContent value="github" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GitBranch className="h-5 w-5 text-gray-600" />
                  <span>GitHub Stars</span>
                </CardTitle>
                <CardDescription>Top contributors by total stars earned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLeaderboardData.github.map((user, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${
                      index < 3 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10">
                          {getRankIcon(user.rank)}
                        </div>
                        <Avatar>
                          <AvatarFallback className="bg-gray-100 text-gray-600">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-lg">{user.name}</div>
                          <div className="text-sm text-gray-600">@{user.handle}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          {getRankBadge(user.rank)}
                        </div>
                        <div className="text-2xl font-bold text-yellow-600 mb-1">
                          ⭐ {user.stars}
                        </div>
                        <div className="text-sm text-gray-600">
                          {user.repos} repos • {user.followers} followers
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="mt-8">
          <CardContent className="text-center py-8">
            <Trophy className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Want to Join the Leaderboard?</h3>
            <p className="text-gray-600 mb-4">
              Keep solving problems and contributing to open source to climb the rankings!
            </p>
            <Button asChild>
              <Link href="/dashboard">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Your Progress
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 