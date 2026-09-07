import { execSync } from 'node:child_process';
import https from 'node:https';

async function main() {
  console.log('🔍 Retrieving stored GitHub credentials from Git Credential Manager...');
  
  const credInput = 'protocol=https\nhost=github.com\n\n';
  const credOutput = execSync('git credential fill', { input: credInput, encoding: 'utf8' });
  
  let username = '';
  let token = '';
  
  for (const line of credOutput.split('\n')) {
    if (line.startsWith('username=')) username = line.replace('username=', '').trim();
    if (line.startsWith('password=')) token = line.replace('password=', '').trim();
  }

  if (!token) {
    console.error('❌ Could not retrieve GitHub token.');
    process.exit(1);
  }

  console.log(`👤 Authenticated GitHub User: ${username}`);

  // Test token with GitHub API
  function githubRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path,
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'HAB-Deployment-Assistant',
          'Accept': 'application/vnd.github.v3+json',
          ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {})
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ statusCode: res.statusCode, body: data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    });
  }

  const userRes = await githubRequest('/user');
  if (userRes.statusCode !== 200) {
    console.error('❌ Failed to verify user with GitHub API:', userRes.body);
    process.exit(1);
  }
  console.log(`✓ GitHub API connection established for @${userRes.body.login}`);

  const repoName = 'hab-bhutan-platform';
  console.log(`📦 Checking if repository '${repoName}' already exists...`);

  let repoRes = await githubRequest(`/repos/${userRes.body.login}/${repoName}`);
  let cloneUrl = '';

  if (repoRes.statusCode === 200) {
    console.log(`✓ Repository '${repoName}' already exists at ${repoRes.body.html_url}`);
    cloneUrl = repoRes.body.clone_url;
  } else if (repoRes.statusCode === 404) {
    console.log(`🚀 Creating new repository '${repoName}' on GitHub...`);
    const createRes = await githubRequest('/user/repos', 'POST', JSON.stringify({
      name: repoName,
      description: 'Unified digital platform for the Handicrafts Association of Bhutan (HAB): Public Site, Operational CRM & Member Portal',
      private: false,
      auto_init: false
    }));

    if (createRes.statusCode !== 201) {
      console.error('❌ Failed to create repository:', createRes.body);
      process.exit(1);
    }
    console.log(`✓ Successfully created repository: ${createRes.body.html_url}`);
    cloneUrl = createRes.body.clone_url;
  } else {
    console.error('❌ Unexpected status checking repository:', repoRes.statusCode, repoRes.body);
    process.exit(1);
  }

  // Git operations
  console.log('🔧 Initializing git repository and staging files...');
  try {
    execSync('git init', { stdio: 'inherit' });
    execSync('git branch -M main', { stdio: 'inherit' });
    
    // Check if remote origin exists
    let hasOrigin = false;
    try {
      const remotes = execSync('git remote', { encoding: 'utf8' });
      if (remotes.includes('origin')) hasOrigin = true;
    } catch {}

    if (hasOrigin) {
      execSync(`git remote set-url origin ${cloneUrl}`, { stdio: 'inherit' });
    } else {
      execSync(`git remote add origin ${cloneUrl}`, { stdio: 'inherit' });
    }

    console.log('📄 Staging all files according to .gitignore...');
    execSync('git add .', { stdio: 'inherit' });

    console.log('📝 Creating initial commit...');
    execSync('git commit -m "feat: complete live PostgreSQL build-out, admin CRM suite, and verified audit implementations"', { stdio: 'inherit' });

    console.log(`🚀 Pushing to origin main (${cloneUrl})...`);
    execSync('git push -u origin main', { stdio: 'inherit' });

    console.log('\n🎉 ALL DONE! Repository successfully created and code pushed to GitHub!');
    console.log(`🔗 URL: https://github.com/${userRes.body.login}/${repoName}`);
  } catch (err) {
    console.error('❌ Git execution error:', err.message);
    process.exit(1);
  }
}

main().catch(console.error);
