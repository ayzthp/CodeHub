// JavaScript runner for testing real profile fetchers
// Run with: node runTests.mjs

import * as cheerio from 'cheerio';

// Test handles
const TEST_HANDLES = {
  leetcode: 'ayzthp',
  codeforces: 'ambassador',
  atcoder: 'ayzthp',
  github: 'ayzthp'
};

/**
 * Fetch LeetCode stats using GraphQL API
 */
async function fetchLeetcodeStats(username) {
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

    submitStats.forEach((stat) => {
      if (stat.difficulty === 'Easy') easySolved = stat.count;
      if (stat.difficulty === 'Medium') mediumSolved = stat.count;
      if (stat.difficulty === 'Hard') hardSolved = stat.count;
    });

    data.data.allQuestionsCount.forEach((count) => {
      if (count.difficulty === 'Easy') easyTotal = count.count;
      if (count.difficulty === 'Medium') mediumTotal = count.count;
      if (count.difficulty === 'Hard') hardTotal = count.count;
    });

    const totalSolved = easySolved + mediumSolved + hardSolved;
    const totalQuestions = easyTotal + mediumTotal + hardTotal;

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
    throw new Error(`Failed to fetch LeetCode stats for "${username}": ${error.message}`);
  }
}

/**
 * Fetch Codeforces stats using official API
 */
async function fetchCodeforcesStats(handle) {
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
    throw new Error(`Failed to fetch Codeforces stats for "${handle}": ${error.message}`);
  }
}

/**
 * Fetch AtCoder stats by scraping profile page
 */
async function fetchAtcoderStats(handle) {
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

    return {
      username: handle,
      rating,
      maxRating: rating, // Simplified - would need more scraping for accurate max rating
      rank: 0, // Would need more detailed scraping
      color,
      competitions: 0, // Would need more detailed scraping
      wins: 0,
    };

  } catch (error) {
    throw new Error(`Failed to fetch AtCoder stats for "${handle}": ${error.message}`);
  }
}

/**
 * Fetch GitHub stats using official API
 */
async function fetchGithubStats(username) {
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
      reposData.forEach((repo) => {
        totalStars += repo.stargazers_count || 0;
        totalForks += repo.forks_count || 0;
      });

      // Rough estimate for commits
      totalCommits = reposData.length * 10;
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
    throw new Error(`Failed to fetch GitHub stats for "${username}": ${error.message}`);
  }
}

// Test functions
async function testLeetCode() {
  const startTime = Date.now();
  
  try {
    console.log(`🟠 Testing LeetCode API for handle: ${TEST_HANDLES.leetcode}`);
    const data = await fetchLeetcodeStats(TEST_HANDLES.leetcode);
    const responseTime = Date.now() - startTime;
    
    console.log('✅ LeetCode API Success!');
    console.log(`📊 Stats for ${data.username}:`);
    console.log(`   Total Problems Solved: ${data.totalSolved}/${data.totalQuestions}`);
    console.log(`   Easy: ${data.easySolved} | Medium: ${data.mediumSolved} | Hard: ${data.hardSolved}`);
    console.log(`   Acceptance Rate: ${data.acceptanceRate.toFixed(2)}%`);
    console.log(`   Ranking: ${data.ranking || 'N/A'}`);
    console.log(`   Reputation: ${data.reputation}`);
    console.log(`   Response Time: ${responseTime}ms\n`);
    
    return { platform: 'LeetCode', success: true, data, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log('❌ LeetCode API Failed!');
    console.log(`   Error: ${error.message}`);
    console.log(`   Response Time: ${responseTime}ms\n`);
    return { platform: 'LeetCode', success: false, error: error.message, responseTime };
  }
}

async function testCodeforces() {
  const startTime = Date.now();
  
  try {
    console.log(`🔵 Testing Codeforces API for handle: ${TEST_HANDLES.codeforces}`);
    const data = await fetchCodeforcesStats(TEST_HANDLES.codeforces);
    const responseTime = Date.now() - startTime;
    
    console.log('✅ Codeforces API Success!');
    console.log(`📊 Stats for ${data.handle}:`);
    if (data.firstName || data.lastName) {
      console.log(`   Name: ${data.firstName || ''} ${data.lastName || ''}`.trim());
    }
    console.log(`   Current Rating: ${data.rating} (${data.rank})`);
    console.log(`   Max Rating: ${data.maxRating} (${data.maxRank})`);
    console.log(`   Contribution: ${data.contribution}`);
    if (data.country) console.log(`   Country: ${data.country}`);
    if (data.organization) console.log(`   Organization: ${data.organization}`);
    console.log(`   Registration: ${new Date(data.registrationTimeSeconds * 1000).toLocaleDateString()}`);
    console.log(`   Response Time: ${responseTime}ms\n`);
    
    return { platform: 'Codeforces', success: true, data, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log('❌ Codeforces API Failed!');
    console.log(`   Error: ${error.message}`);
    console.log(`   Response Time: ${responseTime}ms\n`);
    return { platform: 'Codeforces', success: false, error: error.message, responseTime };
  }
}

async function testAtCoder() {
  const startTime = Date.now();
  
  try {
    console.log(`🟢 Testing AtCoder API for handle: ${TEST_HANDLES.atcoder}`);
    const data = await fetchAtcoderStats(TEST_HANDLES.atcoder);
    const responseTime = Date.now() - startTime;
    
    console.log('✅ AtCoder API Success!');
    console.log(`📊 Stats for ${data.username}:`);
    console.log(`   Current Rating: ${data.rating} (${data.color})`);
    console.log(`   Max Rating: ${data.maxRating}`);
    console.log(`   Rank: ${data.rank}`);
    console.log(`   Competitions: ${data.competitions}`);
    console.log(`   Response Time: ${responseTime}ms\n`);
    
    return { platform: 'AtCoder', success: true, data, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log('❌ AtCoder API Failed!');
    console.log(`   Error: ${error.message}`);
    console.log(`   Response Time: ${responseTime}ms\n`);
    return { platform: 'AtCoder', success: false, error: error.message, responseTime };
  }
}

async function testGitHub() {
  const startTime = Date.now();
  
  try {
    console.log(`⚫ Testing GitHub API for handle: ${TEST_HANDLES.github}`);
    const data = await fetchGithubStats(TEST_HANDLES.github);
    const responseTime = Date.now() - startTime;
    
    console.log('✅ GitHub API Success!');
    console.log(`📊 Stats for ${data.username}:`);
    if (data.name) console.log(`   Name: ${data.name}`);
    if (data.bio) console.log(`   Bio: ${data.bio}`);
    if (data.company) console.log(`   Company: ${data.company}`);
    if (data.location) console.log(`   Location: ${data.location}`);
    console.log(`   Public Repos: ${data.publicRepos}`);
    console.log(`   Followers: ${data.followers} | Following: ${data.following}`);
    console.log(`   Total Stars: ${data.totalStars}`);
    console.log(`   Total Forks: ${data.totalForks}`);
    console.log(`   Account Created: ${new Date(data.createdAt).toLocaleDateString()}`);
    console.log(`   Response Time: ${responseTime}ms\n`);
    
    return { platform: 'GitHub', success: true, data, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log('❌ GitHub API Failed!');
    console.log(`   Error: ${error.message}`);
    console.log(`   Response Time: ${responseTime}ms\n`);
    return { platform: 'GitHub', success: false, error: error.message, responseTime };
  }
}

// Main test runner
async function main() {
  console.log('🚀 Real Profile Fetchers Test Suite');
  console.log('='.repeat(50));
  console.log(`📅 Test Date: ${new Date().toISOString()}`);
  console.log(`🎯 Test Handles:`);
  console.log(`   LeetCode: ${TEST_HANDLES.leetcode}`);
  console.log(`   Codeforces: ${TEST_HANDLES.codeforces}`);
  console.log(`   AtCoder: ${TEST_HANDLES.atcoder}`);
  console.log(`   GitHub: ${TEST_HANDLES.github}`);
  console.log('='.repeat(50));
  console.log();
  
  try {
    // Run all tests
    const results = [];
    
    results.push(await testLeetCode());
    results.push(await testCodeforces());
    results.push(await testAtCoder());
    results.push(await testGitHub());
    
    // Print summary
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(50));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}`);
    
    if (successful.length > 0) {
      console.log('\n🎉 Successful Fetchers:');
      successful.forEach(result => {
        console.log(`   ${result.platform}: ${result.responseTime}ms`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n💥 Failed Fetchers:');
      failed.forEach(result => {
        console.log(`   ${result.platform}: ${result.error}`);
      });
    }
    
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    console.log(`\n⏱️  Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
    
    console.log('\n✨ Test completed successfully!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Run the test suite
main().catch(console.error); 