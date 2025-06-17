'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Trophy, 
  Target, 
  GitBranch, 
  Award, 
  ArrowLeft,
  Search,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { fetchLeetCodeStats, fetchCodeforcesStats, fetchAtCoderStats, fetchGitHubStats } from '@/lib/api';
import type { LeetCodeStats, CodeforcesStats, AtCoderStats, GitHubStats } from '@/lib/api';

interface CompareProfile {
  name: string;
  handles: {
    leetcode: string;
    codeforces: string;
    atcoder: string;
    github: string;
  };
  stats: {
    leetcode: LeetCodeStats;
    codeforces: CodeforcesStats;
    atcoder: AtCoderStats;
    github: GitHubStats;
  };
}

export default function ComparePage() {
  const [profiles, setProfiles] = useState<CompareProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    leetcode: '',
    codeforces: '',
    atcoder: '',
    github: ''
  });

  const addProfile = async () => {
    if (!newProfile.name || (!newProfile.leetcode && !newProfile.codeforces && !newProfile.atcoder && !newProfile.github)) {
      return;
    }

    setIsLoading(true);
    try {
      const [leetcodeStats, codeforcesStats, atcoderStats, githubStats] = await Promise.all([
        newProfile.leetcode ? fetchLeetCodeStats(newProfile.leetcode) : Promise.resolve({
          problemsSolved: 0, totalQuestions: 0, streak: 0, easy: 0, medium: 0, hard: 0,
          acceptanceRate: 0, ranking: null, reputation: 0
        }),
        newProfile.codeforces ? fetchCodeforcesStats(newProfile.codeforces) : Promise.resolve({
          rating: 0, maxRating: 0, rank: 'unrated', maxRank: 'unrated', handle: '',
          contribution: 0
        }),
        newProfile.atcoder ? fetchAtCoderStats(newProfile.atcoder) : Promise.resolve({
          rating: 0, maxRating: 0, color: 'Gray', rank: 0, competitions: 0
        }),
        newProfile.github ? fetchGitHubStats(newProfile.github) : Promise.resolve({
          repoCount: 0, stars: 0, commits: 0, followers: 0, following: 0,
          name: null, bio: null, location: null, company: null
        })
      ]);

      const profile: CompareProfile = {
        name: newProfile.name,
        handles: {
          leetcode: newProfile.leetcode,
          codeforces: newProfile.codeforces,
          atcoder: newProfile.atcoder,
          github: newProfile.github
        },
        stats: {
          leetcode: leetcodeStats,
          codeforces: codeforcesStats,
          atcoder: atcoderStats,
          github: githubStats
        }
      };

      setProfiles(prev => [...prev, profile]);
      setNewProfile({ name: '', leetcode: '', codeforces: '', atcoder: '', github: '' });
    } catch (error) {
      console.error('Error adding profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeProfile = (index: number) => {
    setProfiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-purple-600 hover:text-purple-800">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">Profile Comparison</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Add Profile Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Add Profile to Compare</span>
            </CardTitle>
            <CardDescription>
              Enter a name and at least one platform handle to add a profile for comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <Input
                placeholder="Name"
                value={newProfile.name}
                onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="LeetCode handle"
                value={newProfile.leetcode}
                onChange={(e) => setNewProfile(prev => ({ ...prev, leetcode: e.target.value }))}
              />
              <Input
                placeholder="Codeforces handle"
                value={newProfile.codeforces}
                onChange={(e) => setNewProfile(prev => ({ ...prev, codeforces: e.target.value }))}
              />
              <Input
                placeholder="AtCoder handle"
                value={newProfile.atcoder}
                onChange={(e) => setNewProfile(prev => ({ ...prev, atcoder: e.target.value }))}
              />
              <Input
                placeholder="GitHub username"
                value={newProfile.github}
                onChange={(e) => setNewProfile(prev => ({ ...prev, github: e.target.value }))}
              />
            </div>
            <Button onClick={addProfile} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Add Profile
            </Button>
          </CardContent>
        </Card>

        {profiles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Profiles Added Yet</h3>
              <p className="text-gray-500">Add some profiles above to start comparing coding stats!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile, index) => (
              <Card key={index} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  onClick={() => removeProfile(index)}
                >
                  ×
                </Button>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{profile.name}</CardTitle>
                      <CardDescription>Coding Profile</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* LeetCode Stats */}
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-800">LeetCode</span>
                      </div>
                      <Badge variant="outline" className="text-orange-600">
                        {profile.stats.leetcode.problemsSolved} solved
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Easy: {profile.stats.leetcode.easy} • Medium: {profile.stats.leetcode.medium} • Hard: {profile.stats.leetcode.hard}
                    </div>
                  </div>

                  {/* Codeforces Stats */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Codeforces</span>
                      </div>
                      <Badge variant="outline" className="text-blue-600">
                        {profile.stats.codeforces.rating} rating
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      Rank: {profile.stats.codeforces.rank} • Max: {profile.stats.codeforces.maxRating}
                    </div>
                  </div>

                  {/* AtCoder Stats */}
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">AtCoder</span>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        {profile.stats.atcoder.color}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Rating: {profile.stats.atcoder.rating} • Max: {profile.stats.atcoder.maxRating}
                    </div>
                  </div>

                  {/* GitHub Stats */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <GitBranch className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-800">GitHub</span>
                      </div>
                      <Badge variant="outline" className="text-gray-600">
                        {profile.stats.github.repoCount} repos
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      ⭐ {profile.stats.github.stars} • {profile.stats.github.followers} followers
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 