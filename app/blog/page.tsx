import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  FileText,
  Trophy,
  BarChart2,
  Users2,
  Info,
  Plus,
  Clock,
  Tag,
} from "lucide-react";
import Link from "next/link";

const dummyBlogs = [
  {
    id: 1,
    title: "How to Ace Your Next Coding Interview",
    content:
      "Here are some tips and tricks to help you prepare for your next technical interview. Practice problems, mock interviews, and more...",
    tags: ["interview", "career"],
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    title: "Campus Coding Contest Recap",
    content:
      "Last weekend, our campus hosted a thrilling coding contest. Here are the highlights and top performers...",
    tags: ["contest", "recap"],
    timestamp: "5 hours ago",
  },
  {
    id: 3,
    title: "5 Dynamic Programming Patterns",
    content:
      "Dynamic programming can be tricky. Here are 5 patterns that will help you solve most DP problems...",
    tags: ["dp", "algorithms"],
    timestamp: "1 day ago",
  },
];

const upcomingContests = [
  { name: "LeetCode Weekly #345", time: "Sun 8:00pm" },
  { name: "Codeforces Round #900", time: "Mon 6:30pm" },
  { name: "AtCoder Beginner #400", time: "Sat 5:30pm" },
];

const recommendedProblems = [
  "LeetCode: Two Sum",
  "DP: Longest Increasing Subsequence",
  "Graphs: Dijkstra's Algorithm",
];

const quickStats = [
  { label: "Problems Solved", value: 42 },
  { label: "Rating", value: 1820 },
  { label: "Blog Posts", value: 5 },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <main className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <aside className="hidden md:block md:col-span-2">
          <nav className="flex flex-col gap-2 bg-white rounded-2xl shadow-md border p-4 min-h-screen sticky top-0">
            <Link href="/blog" className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-purple-50 font-semibold">
              <Home className="h-5 w-5 text-purple-600" /> Home
            </Link>
            <Link href="/blog/mine" className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-purple-50">
              <FileText className="h-5 w-5 text-purple-600" /> My Posts
            </Link>
            <Link href="/contests" className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-purple-50">
              <Trophy className="h-5 w-5 text-purple-600" /> Contests
            </Link>
            <Link href="/leaderboard" className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-purple-50">
              <BarChart2 className="h-5 w-5 text-purple-600" /> Leaderboard
            </Link>
            <Link href="/room/new" className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-purple-50">
              <Users2 className="h-5 w-5 text-purple-600" /> Coding Rooms
            </Link>
            <Link href="/blog/guidelines" className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-purple-50">
              <Info className="h-5 w-5 text-purple-600" /> Guidelines
            </Link>
          </nav>
        </aside>

        {/* Middle Blog Feed */}
        <section className="md:col-span-7 flex flex-col gap-6 max-h-[calc(100vh-2rem)]">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-purple-800">Campus Feed</h1>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" /> Create Post
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="flex flex-col gap-4">
              {dummyBlogs.map((blog) => (
                <Card key={blog.id} className="rounded-xl shadow border bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {blog.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-gray-700 line-clamp-3">
                      {blog.content}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs flex items-center">
                          <Tag className="h-3 w-3 mr-1" /> {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                      <Clock className="h-3 w-3" />
                      <span>{blog.timestamp}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="hidden md:block md:col-span-3 space-y-6">
          {/* Upcoming Contests */}
          <Card className="rounded-2xl shadow-md border p-4 sticky top-4">
            <CardHeader>
              <CardTitle className="text-base font-semibold">🔔 Upcoming Contests</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {upcomingContests.map((contest) => (
                  <li key={contest.name} className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span>{contest.name}</span>
                    <span className="ml-auto text-xs text-gray-500">{contest.time}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          {/* Recommended Problems */}
          <Card className="rounded-2xl shadow-md border p-4">
            <CardHeader>
              <CardTitle className="text-base font-semibold">🎯 Recommended Problems</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {recommendedProblems.map((prob) => (
                  <li key={prob}>• {prob}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          {/* Quick Stats */}
          <Card className="rounded-2xl shadow-md border p-4">
            <CardHeader>
              <CardTitle className="text-base font-semibold">📊 Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {quickStats.map((stat) => (
                  <li key={stat.label} className="flex justify-between">
                    <span>{stat.label}:</span>
                    <span className="font-semibold text-purple-700">{stat.value}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
} 