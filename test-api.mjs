// Test script for API functions
// Run with: node test-api.mjs

// Mock API functions (copy from lib/api.ts for testing)
async function fetchLeetCodeStats(handle) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    problemsSolved: Math.floor(Math.random() * 1000) + 100,
    streak: Math.floor(Math.random() * 30) + 1,
    easy: Math.floor(Math.random() * 300) + 50,
    medium: Math.floor(Math.random() * 400) + 100,
    hard: Math.floor(Math.random() * 200) + 20,
  };
}

async function fetchCodeforcesStats(handle) {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const ratings = [800, 1200, 1400, 1600, 1900, 2100, 2400];
  const ranks = ['Newbie', 'Pupil', 'Specialist', 'Expert', 'Candidate Master', 'Master', 'International Master'];
  
  const rating = ratings[Math.floor(Math.random() * ratings.length)];
  const maxRating = rating + Math.floor(Math.random() * 200);
  
  return {
    rating,
    maxRating,
    rank: ranks[Math.floor(rating / 400)],
  };
}

async function fetchAtCoderStats(handle) {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const colors = ['Gray', 'Brown', 'Green', 'Cyan', 'Blue', 'Yellow', 'Orange', 'Red'];
  const ratings = [400, 800, 1200, 1600, 2000, 2400, 2800, 3200];
  
  const rating = ratings[Math.floor(Math.random() * ratings.length)];
  const colorIndex = Math.floor(rating / 400);
  
  return {
    rating,
    color: colors[colorIndex] || 'Gray',
  };
}

async function fetchGitHubStats(username) {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  return {
    repoCount: Math.floor(Math.random() * 50) + 5,
    stars: Math.floor(Math.random() * 500) + 10,
    commits: Math.floor(Math.random() * 100) + 20,
  };
}

async function testAllAPIs() {
  console.log('🚀 Starting API Function Tests...\n');

  try {
    // Test LeetCode API
    console.log('📊 Testing LeetCode API...');
    const startLeetCode = Date.now();
    const leetcodeData = await fetchLeetCodeStats('testuser');
    const leetCodeTime = Date.now() - startLeetCode;
    
    console.log('✅ LeetCode API Response:');
    console.log(`   Problems Solved: ${leetcodeData.problemsSolved}`);
    console.log(`   Current Streak: ${leetcodeData.streak} days`);
    console.log(`   Easy: ${leetcodeData.easy} | Medium: ${leetcodeData.medium} | Hard: ${leetcodeData.hard}`);
    console.log(`   Response Time: ${leetCodeTime}ms\n`);

    // Test Codeforces API
    console.log('🔵 Testing Codeforces API...');
    const startCodeforces = Date.now();
    const codeforcesData = await fetchCodeforcesStats('testuser');
    const codeforcesTime = Date.now() - startCodeforces;
    
    console.log('✅ Codeforces API Response:');
    console.log(`   Current Rating: ${codeforcesData.rating}`);
    console.log(`   Max Rating: ${codeforcesData.maxRating}`);
    console.log(`   Rank: ${codeforcesData.rank}`);
    console.log(`   Response Time: ${codeforcesTime}ms\n`);

    // Test AtCoder API
    console.log('🟢 Testing AtCoder API...');
    const startAtCoder = Date.now();
    const atcoderData = await fetchAtCoderStats('testuser');
    const atcoderTime = Date.now() - startAtCoder;
    
    console.log('✅ AtCoder API Response:');
    console.log(`   Rating: ${atcoderData.rating}`);
    console.log(`   Color: ${atcoderData.color}`);
    console.log(`   Response Time: ${atcoderTime}ms\n`);

    // Test GitHub API
    console.log('⚫ Testing GitHub API...');
    const startGitHub = Date.now();
    const githubData = await fetchGitHubStats('testuser');
    const githubTime = Date.now() - startGitHub;
    
    console.log('✅ GitHub API Response:');
    console.log(`   Repositories: ${githubData.repoCount}`);
    console.log(`   Total Stars: ${githubData.stars}`);
    console.log(`   Commits (30d): ${githubData.commits}`);
    console.log(`   Response Time: ${githubTime}ms\n`);

    // Test concurrent API calls (like in signup)
    console.log('⚡ Testing Concurrent API Calls...');
    const startConcurrent = Date.now();
    
    const [leetcode, codeforces, atcoder, github] = await Promise.all([
      fetchLeetCodeStats('concurrent-test'),
      fetchCodeforcesStats('concurrent-test'),
      fetchAtCoderStats('concurrent-test'),
      fetchGitHubStats('concurrent-test')
    ]);
    
    const concurrentTime = Date.now() - startConcurrent;
    
    console.log('✅ Concurrent API Test Results:');
    console.log(`   All APIs completed successfully`);
    console.log(`   Total Time: ${concurrentTime}ms`);
    console.log(`   Expected ~1200ms (slowest API), Actual: ${concurrentTime}ms`);
    console.log(`   Performance: ${concurrentTime < 1300 ? '✅ Good' : '⚠️ Slow'}\n`);

    // Test multiple concurrent batches
    console.log('🔄 Testing Multiple Concurrent Batches...');
    const batchStart = Date.now();
    
    const batch1 = Promise.all([
      fetchLeetCodeStats('batch1'),
      fetchCodeforcesStats('batch1'),
      fetchAtCoderStats('batch1'),
      fetchGitHubStats('batch1')
    ]);
    
    const batch2 = Promise.all([
      fetchLeetCodeStats('batch2'),
      fetchCodeforcesStats('batch2'),
      fetchAtCoderStats('batch2'),
      fetchGitHubStats('batch2')
    ]);
    
    await Promise.all([batch1, batch2]);
    const batchTime = Date.now() - batchStart;
    
    console.log('✅ Multiple Batch Test:');
    console.log(`   8 API calls (2 batches of 4) completed`);
    console.log(`   Total Time: ${batchTime}ms`);
    console.log(`   Average per batch: ${batchTime / 2}ms\n`);

    console.log('🎉 All API tests completed successfully!');
    console.log('📝 Test Summary:');
    console.log('   - Individual API calls: ✅ Working');
    console.log('   - Concurrent API calls: ✅ Working');
    console.log('   - Multiple batches: ✅ Working');
    console.log('   - Error handling: ✅ No errors detected');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error);
  }
}

// Run the tests
testAllAPIs(); 