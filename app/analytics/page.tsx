'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Zap,
  ArrowLeft,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Trophy,
  GitBranch
} from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
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
                <BarChart3 className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">Analytics & Insights</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Weekly Progress */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-green-600" />
            Weekly Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">LeetCode Problems</CardTitle>
                <Target className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="ml-1">+7 from last week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Codeforces Rating</CardTitle>
                <Trophy className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1456</div>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="ml-1">+33 from last week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">GitHub Contributions</CardTitle>
                <GitBranch className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="ml-1">+4 from last week</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Monthly Goals */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Target className="h-6 w-6 mr-2 text-blue-600" />
            Monthly Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">LeetCode Problems</CardTitle>
                <CardDescription>Target: 100 problems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-orange-600">67</span>
                  <Badge variant="secondary">67%</Badge>
                </div>
                <Progress value={67} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">33 problems to go</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Codeforces Rating</CardTitle>
                <CardDescription>Target: 1600 rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-blue-600">1456</span>
                  <Badge variant="secondary">91%</Badge>
                </div>
                <Progress value={91} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">144 points to go</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GitHub Stars</CardTitle>
                <CardDescription>Target: 20 stars</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-600">12</span>
                  <Badge variant="secondary">60%</Badge>
                </div>
                <Progress value={60} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">8 stars to go</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Streaks */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Zap className="h-6 w-6 mr-2 text-yellow-600" />
            Current Streaks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <div className="text-3xl font-bold text-orange-600">7</div>
                <CardTitle className="text-lg">LeetCode Streak</CardTitle>
                <CardDescription>Days in a row</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-sm text-gray-600">Personal best: 23 days</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="text-3xl font-bold text-green-600">12</div>
                <CardTitle className="text-lg">Daily Coding</CardTitle>
                <CardDescription>Days active</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-sm text-gray-600">Personal best: 45 days</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="text-3xl font-bold text-gray-600">3</div>
                <CardTitle className="text-lg">GitHub Commits</CardTitle>
                <CardDescription>Days with commits</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-sm text-gray-600">Personal best: 18 days</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Insights */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Activity className="h-6 w-6 mr-2 text-purple-600" />
            AI-Powered Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 bg-green-50 border-green-200 text-green-800">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <span className="text-2xl mr-3">💪</span>
                  LeetCode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">You excel at Dynamic Programming problems with 85% success rate</p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-blue-50 border-blue-200 text-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <span className="text-2xl mr-3">📈</span>
                  Codeforces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Focus on Graph algorithms to reach Expert rank faster</p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-purple-50 border-purple-200 text-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <span className="text-2xl mr-3">🎉</span>
                  GitHub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Congratulations! You reached 1000 total stars this month</p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-yellow-50 border-yellow-200 text-yellow-800">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <span className="text-2xl mr-3">💡</span>
                  General
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Try participating in weekend contests to boost your ratings</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
                Time Distribution
              </CardTitle>
              <CardDescription>How you spend your coding time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">LeetCode</span>
                  <span className="text-sm text-gray-600">45%</span>
                </div>
                <Progress value={45} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Codeforces</span>
                  <span className="text-sm text-gray-600">30%</span>
                </div>
                <Progress value={30} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">GitHub</span>
                  <span className="text-sm text-gray-600">15%</span>
                </div>
                <Progress value={15} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">AtCoder</span>
                  <span className="text-sm text-gray-600">10%</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Problem Difficulty
              </CardTitle>
              <CardDescription>Your problem-solving pattern</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">Easy</span>
                  <span className="text-sm text-gray-600">35%</span>
                </div>
                <Progress value={35} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-yellow-600">Medium</span>
                  <span className="text-sm text-gray-600">45%</span>
                </div>
                <Progress value={45} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-600">Hard</span>
                  <span className="text-sm text-gray-600">20%</span>
                </div>
                <Progress value={20} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="mt-8">
          <CardContent className="text-center py-8">
            <Star className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Keep Up the Great Work!</h3>
            <p className="text-gray-600 mb-4">
              Your consistency is paying off. Stay focused on your goals and continue improving!
            </p>
            <Button asChild>
              <Link href="/dashboard">
                <TrendingUp className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 