import { execSync } from 'child_process';
import { createHash } from 'crypto';

// Cache the build info to ensure consistency across multiple calls
let cachedBuildInfo = null;
const CACHE_DURATION_MS = 10000; // 10 seconds - enough for a build process

/**
 * Generates a build hash based on git commit, timestamp, and environment
 */
function generateBuildHash() {
  // Return cached version if available and recent
  if (
    cachedBuildInfo &&
    Date.now() - cachedBuildInfo.generatedAt < CACHE_DURATION_MS
  ) {
    return cachedBuildInfo.buildInfo;
  }

  try {
    // Get current git commit hash (short version)
    const gitHash = execSync('git rev-parse --short HEAD', {
      encoding: 'utf8',
    }).trim();

    // Get current timestamp
    const timestamp = Date.now().toString();

    // Create a combined hash
    const combined = `${gitHash}-${timestamp}`;
    const buildHash = createHash('md5')
      .update(combined)
      .digest('hex')
      .substring(0, 8);

    const buildInfo = {
      hash: buildHash,
      gitHash,
      timestamp: new Date().toISOString(),
      fullHash: `${gitHash}-${buildHash}`,
    };

    // Cache the result
    cachedBuildInfo = {
      buildInfo,
      generatedAt: Date.now(),
    };

    return buildInfo;
  } catch (error) {
    console.warn(
      'Could not generate git-based hash, using timestamp fallback:',
      error.message
    );
    // Fallback if git is not available
    const timestamp = Date.now().toString();
    const fallbackHash = createHash('md5')
      .update(timestamp)
      .digest('hex')
      .substring(0, 8);

    const buildInfo = {
      hash: fallbackHash,
      gitHash: 'unknown',
      timestamp: new Date().toISOString(),
      fullHash: `fallback-${fallbackHash}`,
    };

    // Cache the fallback result too
    cachedBuildInfo = {
      buildInfo,
      generatedAt: Date.now(),
    };

    return buildInfo;
  }
}

// If called directly, print the build hash
if (process.argv[1].endsWith('generate-build-hash.mjs')) {
  const buildInfo = generateBuildHash();
  console.log(`🔨 Build Hash: ${buildInfo.fullHash}`);
  console.log(
    `📝 Details: Git(${buildInfo.gitHash}) + Hash(${buildInfo.hash})`
  );
  console.log(`⏰ Generated: ${buildInfo.timestamp}`);
}

export default generateBuildHash;
