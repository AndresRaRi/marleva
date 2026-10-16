import path from 'node:path';
export function ciStackContext(root, selected = 'ci') {
  if (!['ci', 'b12-source-006'].includes(selected)) throw new Error('Bundle de ensayo desconocido');
  const isolated = selected === 'b12-source-006';
  const project = isolated ? 'marleva-b12-source-006' : 'marleva-ci';
  const base = isolated ? 54700 : 54600;
  return {
    project,
    folder: path.resolve(root, isolated ? 'artifacts/recovery/source-006' : 'artifacts/ci/stack'),
    network: project + '-loopback',
    api: base + 21,
    database: base + 22,
    mail: base + 24,
    smtp: base + 25,
  };
}
export function stackConfiguration(template, context) {
  return template
    .replace('project_id = "marleva-ci"', `project_id = "${context.project}"`)
    .replaceAll(/546(20|21|22|24|25)/g, (port) => String(Number(port) + context.api - 54621));
}
