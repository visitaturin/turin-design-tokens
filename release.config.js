module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    ["@semantic-release/git", {
      "assets": ['output/**/*.{js,css,json}', 'tokens/**/*.{js,css,json}', 'CHANGELOG.md', 'package.json', 'package-lock.json', 'yarn.lock', 'npm-shrinkwrap.json'],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    '@semantic-release/github',
  ],
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'master',
    'next',
    'next-major',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
  ],
};
