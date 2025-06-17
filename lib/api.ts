// Client-side API functions that call server-side routes
// This avoids CORS issues by proxying requests through Next.js API routes

// Updated interfaces to match real API responses
export interface LeetCodeStats {
  problemsSolved: number;
  totalQuestions: number;
  streak: number;
  easy: number;
  medium: number;
  hard: number;
  acceptanceRate: number;
  ranking: number | null;
  reputation: number;
}

export interface CodeforcesStats {
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
}

export interface AtCoderStats {
  rating: number;
  maxRating: number;
  color: string;
  rank: number;
  competitions: number;
}

export interface GitHubStats {
  repoCount: number;
  stars: number;
  commits: number;
  followers: number;
  following: number;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
}

/**
 * Fetch LeetCode stats via server-side API route
 */
export async function fetchLeetCodeStats(username: string): Promise<LeetCodeStats> {
  try {
    const response = await fetch(`/api/profile/leetcode?username=${encodeURIComponent(username)}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('LeetCode API Error:', error);
    // Return fallback data instead of throwing to prevent UI breaks
    return {
      problemsSolved: 0,
      totalQuestions: 0,
      streak: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      acceptanceRate: 0,
      ranking: null,
      reputation: 0,
    };
  }
}

/**
 * Fetch Codeforces stats via server-side API route
 */
export async function fetchCodeforcesStats(handle: string): Promise<CodeforcesStats> {
  try {
    const response = await fetch(`/api/profile/codeforces?handle=${encodeURIComponent(handle)}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Codeforces API Error:', error);
    // Return fallback data
    return {
      handle,
      contribution: 0,
      rank: 'unrated',
      rating: 0,
      maxRank: 'unrated',
      maxRating: 0,
    };
  }
}

/**
 * Fetch AtCoder stats via server-side API route
 */
export async function fetchAtCoderStats(handle: string): Promise<AtCoderStats> {
  try {
    const response = await fetch(`/api/profile/atcoder?handle=${encodeURIComponent(handle)}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('AtCoder API Error:', error);
    // Return fallback data
    return {
      rating: 0,
      maxRating: 0,
      color: 'Gray',
      rank: 0,
      competitions: 0,
    };
  }
}

/**
 * Fetch GitHub stats via server-side API route
 */
export async function fetchGitHubStats(username: string): Promise<GitHubStats> {
  try {
    const response = await fetch(`/api/profile/github?username=${encodeURIComponent(username)}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('GitHub API Error:', error);
    // Return fallback data
    return {
      repoCount: 0,
      stars: 0,
      commits: 0,
      followers: 0,
      following: 0,
      name: null,
      bio: null,
      location: null,
      company: null,
    };
  }
} 