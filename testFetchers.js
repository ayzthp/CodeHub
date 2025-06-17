// Test file for profileFetchers.ts
// Tests all fetchers with real handles and logs the output
import { fetchLeetcodeStats, fetchCodeforcesStats, fetchAtcoderStats, fetchGithubStats } from './profileFetchers';
// Test handles
const TEST_HANDLES = {
    leetcode: 'ayzthp',
    codeforces: 'ambassador',
    atcoder: 'ayzthp',
    github: 'ayzthp'
};
/**
 * Pretty print JSON with colors (basic implementation)
 */
function prettyPrint(obj) {
    console.log(JSON.stringify(obj, null, 2));
}
/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
/**
 * Test LeetCode fetcher
 */
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
        return {
            platform: 'LeetCode',
            handle: TEST_HANDLES.leetcode,
            success: true,
            data,
            responseTime
        };
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log('❌ LeetCode API Failed!');
        console.log(`   Error: ${errorMessage}`);
        console.log(`   Response Time: ${responseTime}ms\n`);
        return {
            platform: 'LeetCode',
            handle: TEST_HANDLES.leetcode,
            success: false,
            error: errorMessage,
            responseTime
        };
    }
}
/**
 * Test Codeforces fetcher
 */
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
        if (data.country)
            console.log(`   Country: ${data.country}`);
        if (data.organization)
            console.log(`   Organization: ${data.organization}`);
        console.log(`   Registration: ${new Date(data.registrationTimeSeconds * 1000).toLocaleDateString()}`);
        console.log(`   Response Time: ${responseTime}ms\n`);
        return {
            platform: 'Codeforces',
            handle: TEST_HANDLES.codeforces,
            success: true,
            data,
            responseTime
        };
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log('❌ Codeforces API Failed!');
        console.log(`   Error: ${errorMessage}`);
        console.log(`   Response Time: ${responseTime}ms\n`);
        return {
            platform: 'Codeforces',
            handle: TEST_HANDLES.codeforces,
            success: false,
            error: errorMessage,
            responseTime
        };
    }
}
/**
 * Test AtCoder fetcher
 */
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
        return {
            platform: 'AtCoder',
            handle: TEST_HANDLES.atcoder,
            success: true,
            data,
            responseTime
        };
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log('❌ AtCoder API Failed!');
        console.log(`   Error: ${errorMessage}`);
        console.log(`   Response Time: ${responseTime}ms\n`);
        return {
            platform: 'AtCoder',
            handle: TEST_HANDLES.atcoder,
            success: false,
            error: errorMessage,
            responseTime
        };
    }
}
/**
 * Test GitHub fetcher
 */
async function testGitHub() {
    const startTime = Date.now();
    try {
        console.log(`⚫ Testing GitHub API for handle: ${TEST_HANDLES.github}`);
        const data = await fetchGithubStats(TEST_HANDLES.github);
        const responseTime = Date.now() - startTime;
        console.log('✅ GitHub API Success!');
        console.log(`📊 Stats for ${data.username}:`);
        if (data.name)
            console.log(`   Name: ${data.name}`);
        if (data.bio)
            console.log(`   Bio: ${data.bio}`);
        if (data.company)
            console.log(`   Company: ${data.company}`);
        if (data.location)
            console.log(`   Location: ${data.location}`);
        console.log(`   Public Repos: ${data.publicRepos}`);
        console.log(`   Followers: ${data.followers} | Following: ${data.following}`);
        console.log(`   Total Stars: ${data.totalStars}`);
        console.log(`   Total Forks: ${data.totalForks}`);
        console.log(`   Account Created: ${new Date(data.createdAt).toLocaleDateString()}`);
        console.log(`   Response Time: ${responseTime}ms\n`);
        return {
            platform: 'GitHub',
            handle: TEST_HANDLES.github,
            success: true,
            data,
            responseTime
        };
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log('❌ GitHub API Failed!');
        console.log(`   Error: ${errorMessage}`);
        console.log(`   Response Time: ${responseTime}ms\n`);
        return {
            platform: 'GitHub',
            handle: TEST_HANDLES.github,
            success: false,
            error: errorMessage,
            responseTime
        };
    }
}
/**
 * Run all tests sequentially
 */
async function runSequentialTests() {
    console.log('🔄 Running Sequential Tests...\n');
    const results = [];
    results.push(await testLeetCode());
    results.push(await testCodeforces());
    results.push(await testAtCoder());
    results.push(await testGitHub());
    return results;
}
/**
 * Run all tests concurrently
 */
async function runConcurrentTests() {
    console.log('⚡ Running Concurrent Tests...\n');
    const startTime = Date.now();
    const [leetcodeResult, codeforcesResult, atcoderResult, githubResult] = await Promise.allSettled([
        testLeetCode(),
        testCodeforces(),
        testAtCoder(),
        testGitHub()
    ]);
    const totalTime = Date.now() - startTime;
    console.log(`🕐 Total concurrent execution time: ${totalTime}ms\n`);
    const results = [];
    if (leetcodeResult.status === 'fulfilled')
        results.push(leetcodeResult.value);
    if (codeforcesResult.status === 'fulfilled')
        results.push(codeforcesResult.value);
    if (atcoderResult.status === 'fulfilled')
        results.push(atcoderResult.value);
    if (githubResult.status === 'fulfilled')
        results.push(githubResult.value);
    return results;
}
/**
 * Print test summary
 */
function printSummary(results) {
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
}
/**
 * Export full data as JSON
 */
async function exportResults(results) {
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length > 0) {
        console.log('\n📤 Full JSON Export:');
        console.log('='.repeat(50));
        const exportData = successfulResults.reduce((acc, result) => {
            acc[result.platform.toLowerCase()] = result.data;
            return acc;
        }, {});
        prettyPrint(exportData);
    }
}
/**
 * Main test runner
 */
async function main() {
    console.log('🚀 Profile Fetchers Test Suite');
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
        // Run sequential tests first
        const sequentialResults = await runSequentialTests();
        console.log('='.repeat(50));
        printSummary(sequentialResults);
        console.log('='.repeat(50));
        // Export successful results
        await exportResults(sequentialResults);
        console.log('\n✨ Test completed successfully!');
    }
    catch (error) {
        console.error('💥 Test suite failed:', error);
        process.exit(1);
    }
}
// Run the test suite
if (require.main === module) {
    main().catch(console.error);
}
export { main as runTests };
