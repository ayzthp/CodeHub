import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    // Fetch user profile
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CodeHub-Profile-Fetcher'
      }
    });

    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        throw new Error(`GitHub user "${username}" not found`);
      }
      throw new Error(`GitHub API error: ${userResponse.status}`);
    }

    const userData = await userResponse.json();

    // Fetch repositories to calculate stars
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CodeHub-Profile-Fetcher'
      }
    });

    let totalStars = 0;

    if (reposResponse.ok) {
      const reposData = await reposResponse.json();
      
      // Calculate total stars
      reposData.forEach((repo: { stargazers_count?: number }) => {
        totalStars += repo.stargazers_count || 0;
      });
    }

    const result: GitHubStats = {
      repoCount: userData.public_repos || 0,
      stars: totalStars,
      commits: userData.public_repos * 10, // Rough estimate
      followers: userData.followers || 0,
      following: userData.following || 0,
      name: userData.name,
      bio: userData.bio,
      location: userData.location,
      company: userData.company,
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('GitHub API Error:', error);
    // Return fallback data
    const fallbackResult: GitHubStats = {
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
    
    return NextResponse.json(fallbackResult, { status: 200 });
  }
} 