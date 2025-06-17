import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export interface AtCoderStats {
  rating: number;
  maxRating: number;
  color: string;
  rank: number;
  competitions: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://atcoder.jp/users/${handle}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`AtCoder user "${handle}" not found`);
      }
      throw new Error(`AtCoder request failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try to extract rating from various possible selectors
    let rating = 0;
    const ratingElements = [
      'span.user-red', 'span.user-orange', 'span.user-yellow', 
      'span.user-blue', 'span.user-cyan', 'span.user-green', 
      'span.user-brown', 'span.user-gray'
    ];
    
    for (const selector of ratingElements) {
      const element = $(selector).first();
      if (element.length) {
        const ratingText = element.text().trim();
        rating = parseInt(ratingText.replace(/[^0-9]/g, '')) || 0;
        break;
      }
    }

    // Determine color based on rating
    let color = 'Gray';
    if (rating >= 2800) color = 'Red';
    else if (rating >= 2400) color = 'Orange';
    else if (rating >= 2000) color = 'Yellow';
    else if (rating >= 1600) color = 'Blue';
    else if (rating >= 1200) color = 'Cyan';
    else if (rating >= 800) color = 'Green';
    else if (rating >= 400) color = 'Brown';

    const result: AtCoderStats = {
      rating,
      maxRating: rating, // Simplified - would need more scraping for accurate max rating
      color,
      rank: 0, // Would need more detailed scraping
      competitions: 0, // Would need more detailed scraping
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('AtCoder API Error:', error);
    // Return fallback data
    const fallbackResult: AtCoderStats = {
      rating: 0,
      maxRating: 0,
      color: 'Gray',
      rank: 0,
      competitions: 0,
    };
    
    return NextResponse.json(fallbackResult, { status: 200 });
  }
} 