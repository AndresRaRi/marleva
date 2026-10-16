import { randomUUID } from 'node:crypto';

export function cloudNegativeFixture() {
  const identity = randomUUID().replaceAll('-', '');
  const input = 'value' + identity;
  return {
    file: `apps/api/src/sonar-negative-${identity}.ts`,
    content:
      `export function sonarNegativeFixture${identity}(${input}: string): boolean {\n` +
      `  return ${input}.length > 0 && ${input}.length > 0;\n}\n`,
  };
}
