module.exports = {
  ci: {
    collect: {
      url: ['https://localhost:8443'],
      numberOfRuns: 3,
      settings: { onlyCategories: ['accessibility'], chromeFlags: '--headless' },
    },
    assert: { assertions: { 'categories:accessibility': ['error', { minScore: 0.95 }] } },
    upload: { target: 'filesystem', outputDir: 'artifacts/ci/lighthouse' },
  },
};
