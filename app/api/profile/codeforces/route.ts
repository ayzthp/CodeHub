import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`, {
      headers: {
        'User-Agent': 'CodeHub-Profile-Fetcher'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Codeforces API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Codeforces API error: ${data.comment || 'Unknown error'}`);
    }

    if (!data.result || data.result.length === 0) {
      throw new Error(`Codeforces user "${handle}" not found`);
    }

    const user = data.result[0];

    const result: CodeforcesStats = {
      handle: user.handle,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
      organization: user.organization,
      contribution: user.contribution || 0,
      rank: user.rank || 'unrated',
      rating: user.rating || 0,
      maxRank: user.maxRank || 'unrated',
      maxRating: user.maxRating || 0,
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Codeforces API Error:', error);
    // Return fallback data
    const fallbackResult: CodeforcesStats = {
      handle,
      contribution: 0,
      rank: 'unrated',
      rating: 0,
      maxRank: 'unrated',
      maxRating: 0,
    };
    
    return NextResponse.json(fallbackResult, { status: 200 });
  }
} 