'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Target, 
  GitBranch, 
  Star,
  ArrowUpDown,
  School
} from 'lucide-react';

export interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  college: string;
  stats: {
    leetcode: {
      totalSolved: number;
      easy: number;
      medium: number;
      hard: number;
    };
    codeforces: {
      rating: number;
      maxRating: number;
    };
    github: {
      followers: number;
      publicRepos: number;
    };
    atcoder: {
      rating: number;
    };
  };
}

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  isLoading?: boolean;
  college?: string;
}

type SortBy = 'leetcode' | 'codeforces' | 'github' | 'atcoder';

export default function LeaderboardTable({ users, isLoading = false, college }: LeaderboardTableProps) {
  const [sortBy, setSortBy] = useState<SortBy>('leetcode');

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



  const sortUsers = (users: LeaderboardUser[], sortBy: SortBy): LeaderboardUser[] => {
    return [...users].sort((a, b) => {
      switch (sortBy) {
        case 'leetcode':
          return b.stats.leetcode.totalSolved - a.stats.leetcode.totalSolved;
        case 'codeforces':
          return b.stats.codeforces.rating - a.stats.codeforces.rating;
        case 'github':
          return b.stats.github.followers - a.stats.github.followers;
        case 'atcoder':
          return b.stats.atcoder.rating - a.stats.atcoder.rating;
        default:
          return 0;
      }
    });
  };

  const sortedUsers = sortUsers(users, sortBy);

  const getSortValue = (user: LeaderboardUser, sortBy: SortBy): number => {
    switch (sortBy) {
      case 'leetcode':
        return user.stats.leetcode.totalSolved;
      case 'codeforces':
        return user.stats.codeforces.rating;
      case 'github':
        return user.stats.github.followers;
      case 'atcoder':
        return user.stats.atcoder.rating;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="ml-auto">
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {college ? (
            <>
              <School className="h-6 w-6 text-blue-600" />
              <span>{college} Leaderboard</span>
            </>
          ) : (
            <>
              <Trophy className="h-6 w-6 text-orange-600" />
              <span>Global Leaderboard</span>
            </>
          )}
        </CardTitle>
        <CardDescription>
          {college 
            ? `Top performers from ${college}` 
            : 'Top performers across all colleges'
          } • {users.length} participants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="atcoder" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>AtCoder</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={sortBy} className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSortBy(sortBy)}
                        className="h-auto p-0 font-medium"
                      >
                        {sortBy === 'leetcode' && 'Problems Solved'}
                        {sortBy === 'codeforces' && 'Rating'}
                        {sortBy === 'github' && 'Followers'}
                        {sortBy === 'atcoder' && 'Rating'}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((user, index) => {
                    const position = index + 1;
                    const isTopThree = position <= 3;
                    
                    return (
                      <TableRow 
                        key={user.id} 
                        className={isTopThree ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}
                      >
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getRankIcon(position)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{user.name}</div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline">{user.college}</Badge>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {getSortValue(user, sortBy).toLocaleString()}
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          {sortBy === 'leetcode' && (
                            <div className="text-sm text-gray-600">
                              E:{user.stats.leetcode.easy} • M:{user.stats.leetcode.medium} • H:{user.stats.leetcode.hard}
                            </div>
                          )}
                          {sortBy === 'codeforces' && (
                            <div className="text-sm text-gray-600">
                              Max: {user.stats.codeforces.maxRating}
                            </div>
                          )}
                          {sortBy === 'github' && (
                            <div className="text-sm text-gray-600">
                              {user.stats.github.publicRepos} repos
                            </div>
                          )}
                          {sortBy === 'atcoder' && (
                            <div className="text-sm text-gray-600">
                              AtCoder Rating
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {sortedUsers.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Users Found</h3>
                <p className="text-gray-500">
                  {college 
                    ? `No users found from ${college}` 
                    : 'No users in the leaderboard yet'
                  }
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 