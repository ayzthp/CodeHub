// Real profile fetchers for coding platforms
// Uses actual APIs and scraping to get live data

import * as cheerio from 'cheerio';

// LeetCode Stats Interface
export interface LeetCodeStats {
  username: string;
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  ranking: number | null;
  contributionPoints: number;
  reputation: number;
}

// Codeforces Stats Interface
export interface CodeforcesStats {
  handle: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  contribution: number;
  rank: string;
  rating: number;
  maxRank: string;
  maxRating: number;
  lastOnlineTimeSeconds: number;
  registrationTimeSeconds: number;
}

// AtCoder Stats Interface
export interface AtCoderStats {
  username: string;
  rating: number;
  maxRating: number;
  rank: number;
  color: string;
  competitions: number;
  wins: number;
}

// GitHub Stats Interface
export interface GitHubStats {
  username: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  publicRepos: number;
  publicGists: number;
  followers: number;
  following: number;
  createdAt: string;
  updatedAt: string;
  totalStars: number;
  totalForks: number;
  totalCommits: number;
}

/**
 * Fetch LeetCode stats using GraphQL API
 */
export async function fetchLeetcodeStats(username: string): Promise<LeetCodeStats> {
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
              userAvatar
              realName
              aboutMe
              school
              websites
              countryName
              company
              jobTitle
              skillTags
              postViewCount
              postViewCountDiff
              reputation
              reputationDiff
              solutionCount
              solutionCountDiff
              categoryDiscussCount
              categoryDiscussCountDiff
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
    let easySolved = 0, mediumSolved = 0, hardSolved = 0, totalSolved = 0;
    let easyTotal = 0, mediumTotal = 0, hardTotal = 0, totalQuestions = 0;

    submitStats.forEach((stat: any) => {
      if (stat.difficulty === 'Easy') easySolved = stat.count;
      if (stat.difficulty === 'Medium') mediumSolved = stat.count;
      if (stat.difficulty === 'Hard') hardSolved = stat.count;
    });

    data.data.allQuestionsCount.forEach((count: any) => {
      if (count.difficulty === 'Easy') easyTotal = count.count;
      if (count.difficulty === 'Medium') mediumTotal = count.count;
      if (count.difficulty === 'Hard') hardTotal = count.count;
    });

    totalSolved = easySolved + mediumSolved + hardSolved;
    totalQuestions = easyTotal + mediumTotal + hardTotal;

    return {
      username: user.username,
      totalSolved,
      totalQuestions,
      easySolved,
      mediumSolved,
      hardSolved,
      acceptanceRate: totalQuestions > 0 ? (totalSolved / totalQuestions) * 100 : 0,
      ranking: user.profile.ranking || null,
      contributionPoints: user.profile.postViewCount || 0,
      reputation: user.profile.reputation || 0,
    };

  } catch (error) {
    throw new Error(`Failed to fetch LeetCode stats for "${username}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch Codeforces stats using official API
 */
export async function fetchCodeforcesStats(handle: string): Promise<CodeforcesStats> {
  try {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    
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

    return {
      handle: user.handle,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
      city: user.city,
      organization: user.organization,
      contribution: user.contribution || 0,
      rank: user.rank || 'unrated',
      rating: user.rating || 0,
      maxRank: user.maxRank || 'unrated',
      maxRating: user.maxRating || 0,
      lastOnlineTimeSeconds: user.lastOnlineTimeSeconds || 0,
      registrationTimeSeconds: user.registrationTimeSeconds || 0,
    };

  } catch (error) {
    throw new Error(`Failed to fetch Codeforces stats for "${handle}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch AtCoder stats by scraping profile page
 */
export async function fetchAtcoderStats(handle: string): Promise<AtCoderStats> {
  try {
    const response = await fetch(`https://atcoder.jp/users/${handle}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`AtCoder user "${handle}" not found`);
      }
      throw new Error(`AtCoder request failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract rating from the page
    const ratingElement = $('span.user-red, span.user-orange, span.user-yellow, span.user-blue, span.user-cyan, span.user-green, span.user-brown, span.user-gray').first();
    const ratingText = ratingElement.text().trim();
    const rating = ratingText ? parseInt(ratingText.replace(/[^0-9]/g, '')) || 0 : 0;

    // Determine color based on rating
    let color = 'Gray';
    if (rating >= 2800) color = 'Red';
    else if (rating >= 2400) color = 'Orange';
    else if (rating >= 2000) color = 'Yellow';
    else if (rating >= 1600) color = 'Blue';
    else if (rating >= 1200) color = 'Cyan';
    else if (rating >= 800) color = 'Green';
    else if (rating >= 400) color = 'Brown';

    // Extract max rating from history (if available)
    const maxRatingElement = $('.dl-table tr').filter((_, el) => {
      return $(el).find('th').text().includes('Highest Rating');
    }).find('td');
    const maxRatingText = maxRatingElement.text().trim();
    const maxRating = maxRatingText ? parseInt(maxRatingText.replace(/[^0-9]/g, '')) || rating : rating;

    // Extract rank
    const rankElement = $('.dl-table tr').filter((_, el) => {
      return $(el).find('th').text().includes('Rank');
    }).find('td');
    const rankText = rankElement.text().trim();
    const rank = rankText ? parseInt(rankText.replace(/[^0-9]/g, '')) || 0 : 0;

    // Extract competitions count
    const competitionsElement = $('.dl-table tr').filter((_, el) => {
      return $(el).find('th').text().includes('Competitions');
    }).find('td');
    const competitionsText = competitionsElement.text().trim();
    const competitions = competitionsText ? parseInt(competitionsText.replace(/[^0-9]/g, '')) || 0 : 0;

    return {
      username: handle,
      rating,
      maxRating,
      rank,
      color,
      competitions,
      wins: 0, // This would require more detailed scraping
    };

  } catch (error) {
    throw new Error(`Failed to fetch AtCoder stats for "${handle}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch GitHub stats using official API
 */
export async function fetchGithubStats(username: string): Promise<GitHubStats> {
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

    // Fetch repositories to calculate stars and forks
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CodeHub-Profile-Fetcher'
      }
    });

    let totalStars = 0;
    let totalForks = 0;
    let totalCommits = 0;

    if (reposResponse.ok) {
      const reposData = await reposResponse.json();
      
      // Calculate total stars and forks
      reposData.forEach((repo: any) => {
        totalStars += repo.stargazers_count || 0;
        totalForks += repo.forks_count || 0;
      });

      // For commits, we'd need to make additional API calls per repo
      // This is simplified for now due to API rate limits
      totalCommits = reposData.length * 10; // Rough estimate
    }

    return {
      username: userData.login,
      name: userData.name,
      bio: userData.bio,
      company: userData.company,
      location: userData.location,
      publicRepos: userData.public_repos || 0,
      publicGists: userData.public_gists || 0,
      followers: userData.followers || 0,
      following: userData.following || 0,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
      totalStars,
      totalForks,
      totalCommits,
    };

  } catch (error) {
    throw new Error(`Failed to fetch GitHub stats for "${username}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 