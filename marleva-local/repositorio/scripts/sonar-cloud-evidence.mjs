import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { randomBytes, scryptSync, createCipheriv } from 'node:crypto';
export function encryptCloudEvidence(folder, token) {
  const files = ['summary.json', 'negative-rule.json'];
  for (const label of ['base', 'head', 'negative', 'corrected'])
    files.push(
      label + '.log',
      label + '-task.json',
      label + '-profile.json',
      label + '-result/inventory.json',
    );
  for (const label of ['base', 'head', 'negative', 'corrected']) {
    const result = path.join(folder, label + '-result');
    if (existsSync(result))
      for (const file of readdirSync(result))
        if (/^inventory-attempt-\d+\.json$/.test(file)) files.push(label + '-result/' + file);
  }
  const contents = Object.fromEntries(
    files
      .filter((file) => existsSync(path.join(folder, file)))
      .map((file) => [file, readFileSync(path.join(folder, file), 'utf8')]),
  );
  const salt = randomBytes(16),
    iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', scryptSync(token, salt, 32), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(contents), 'utf8'),
    cipher.final(),
  ]);
  writeFileSync(
    path.join(folder, 'evidence.enc'),
    JSON.stringify({
      version: 1,
      algorithm: 'aes-256-gcm',
      kdf: 'scrypt',
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
      ciphertext: ciphertext.toString('base64'),
    }),
    { mode: 0o600 },
  );
}
