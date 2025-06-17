import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    // LeetCode GraphQL endpoint
    const graphqlQuery = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            submitStats: submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
            profile {
              ranking
              reputation
              postViewCount
            }
          }
          allQuestionsCount {
            difficulty
            count
          }
        }
      `,
      variables: { username }
    };

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      body: JSON.stringify(graphqlQuery)
    });

    if (!response.ok) {
      throw new Error(`LeetCode API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data?.matchedUser) {
      throw new Error(`LeetCode user "${username}" not found`);
    }

    const user = data.data.matchedUser;
    const submitStats = user.submitStats.acSubmissionNum;
    
    // Parse difficulty stats
    let easySolved = 0, mediumSolved = 0, hardSolved = 0;
    let easyTotal = 0, mediumTotal = 0, hardTotal = 0;

    submitStats.forEach((stat: { difficulty: string; count: number }) => {
      if (stat.difficulty === 'Easy') easySolved = stat.count;
      if (stat.difficulty === 'Medium') mediumSolved = stat.count;
      if (stat.difficulty === 'Hard') hardSolved = stat.count;
    });

    data.data.allQuestionsCount.forEach((count: { difficulty: string; count: number }) => {
      if (count.difficulty === 'Easy') easyTotal = count.count;
      if (count.difficulty === 'Medium') mediumTotal = count.count;
      if (count.difficulty === 'Hard') hardTotal = count.count;
    });

    const totalSolved = easySolved + mediumSolved + hardSolved;
    const totalQuestions = easyTotal + mediumTotal + hardTotal;

    const result: LeetCodeStats = {
      problemsSolved: totalSolved,
      totalQuestions,
      streak: 0, // LeetCode doesn't provide streak in this API, would need additional call
      easy: easySolved,
      medium: mediumSolved,
      hard: hardSolved,
      acceptanceRate: totalQuestions > 0 ? (totalSolved / totalQuestions) * 100 : 0,
      ranking: user.profile.ranking || null,
      reputation: user.profile.reputation || 0,
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('LeetCode API Error:', error);
    // Return fallback data instead of throwing to prevent UI breaks
    const fallbackResult: LeetCodeStats = {
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
    
    return NextResponse.json(fallbackResult, { status: 200 });
  }
} 