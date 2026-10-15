import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
sharp.cache(false);
sharp.concurrency(1);
const options = { failOn: 'warning' as const, limitInputPixels: 16000000, sequentialRead: true };
async function encode(input: Buffer, size: number) {
  const content = await sharp(input, options)
    .autoOrient()
    .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 82, progressive: true })
    .timeout({ seconds: 3 })
    .toBuffer();
  const info = await sharp(content, options).metadata();
  if (
    info.format !== 'jpeg' ||
    !info.width ||
    !info.height ||
    info.width > size ||
    info.height > size ||
    content.length > 5000000
  )
    throw Error('Invalid output');
  if ((['exif', 'icc', 'iptc', 'xmp'] as const).some((field) => Boolean(info[field])))
    throw Error('Metadata remains');
  return {
    content: content.toString('base64'),
    bytes: content.length,
    sha256: createHash('sha256').update(content).digest('hex'),
    width: info.width,
    height: info.height,
  };
}
function rejectAnimation(input: Buffer): void {
  if (!input.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return;
  for (let offset = 8; offset + 12 <= input.length; offset += input.readUInt32BE(offset) + 12) {
    if (input.toString('ascii', offset + 4, offset + 8) === 'acTL')
      throw Error('Animated PNG rejected');
  }
}
async function main() {
  const input = await readFile(process.argv[2]);
  if (input.length > 5000000) throw Error('Size');
  rejectAnimation(input);
  const info = await sharp(input, options).metadata();
  if (
    !['jpeg', 'png'].includes(info.format ?? '') ||
    !info.width ||
    !info.height ||
    info.width > 8192 ||
    info.height > 8192 ||
    (info.pages ?? 1) !== 1
  )
    throw Error('Format/dimensions');
  process.stdout.write(
    JSON.stringify({ card: await encode(input, 480), detail: await encode(input, 1600) }),
  );
}
main().catch((error: NodeJS.ErrnoException) => {
  process.stderr.write('IMAGE_REJECTED');
  process.exitCode = ['ENOENT', 'EACCES'].includes(error.code ?? '') ? 2 : 1;
});
