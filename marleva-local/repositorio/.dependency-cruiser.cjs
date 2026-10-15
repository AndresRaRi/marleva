module.exports = {
  forbidden: [
    {
      name: 'domain-independent',
      severity: 'error',
      from: { path: '/domain/' },
      to: { path: '/(infrastructure|presentation|application)/' },
    },
    {
      name: 'application-no-infrastructure',
      severity: 'error',
      from: { path: '/application/' },
      to: { path: '/(infrastructure|presentation)/' },
    },
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
    {
      name: 'no-module-crossing',
      severity: 'error',
      from: { path: '^apps/api/src/modules/([^/]+)/' },
      to: { path: '^apps/api/src/modules/', pathNot: '^apps/api/src/modules/$1/' },
    },
  ],
  options: {
    tsPreCompilationDeps: true,
    tsConfig: { fileName: require('node:path').resolve(__dirname, 'apps/api/tsconfig.json') },
    doNotFollow: { path: 'node_modules|src/generated' },
    exclude: 'src/generated',
  },
};
