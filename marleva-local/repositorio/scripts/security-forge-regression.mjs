import assert from 'node:assert/strict';
import { generateKeyPairSync, sign, verify } from 'node:crypto';
export function checkForge(forge) {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });
  const publicPem = publicKey.export({ type: 'spki', format: 'pem' });
  const privateRsa = forge.pki.privateKeyFromPem(privatePem);
  const publicRsa = forge.pki.publicKeyFromPem(publicPem);
  const message = 'Marleva: fictitious signature compatibility';
  const digest = forge.md.sha256.create().update(message);
  const hash = digest.digest().getBytes();
  assert.equal(
    verify(
      'sha256',
      Buffer.from(message),
      publicKey,
      Buffer.from(privateRsa.sign(digest), 'binary'),
    ),
    true,
  );
  assert.equal(
    publicRsa.verify(hash, sign('sha256', Buffer.from(message), privateKey).toString('binary')),
    true,
  );
  const asn1 = forge.asn1;
  const algorithm = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    asn1.create(
      asn1.Class.UNIVERSAL,
      asn1.Type.OID,
      false,
      asn1.oidToDer(forge.oids.sha256).getBytes(),
    ),
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.NULL, false, ''),
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false, 'unconsumed garbage'),
  ]);
  const encoded = asn1
    .toDer(
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
        algorithm,
        asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false, hash),
      ]),
    )
    .getBytes();
  const malformed = privateRsa.sign(encoded, 'NONE');
  assert.throws(() => publicRsa.verify(hash, malformed), /valid RSASSA-PKCS1-v1_5 DigestInfo/);
  algorithm.value.splice(1, 1);
  const withoutNull = asn1
    .toDer(
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
        algorithm,
        asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false, hash),
      ]),
    )
    .getBytes();
  assert.throws(
    () => publicRsa.verify(hash, privateRsa.sign(withoutNull, 'NONE')),
    /valid RSASSA-PKCS1-v1_5 DigestInfo/,
  );
  return 'node-forge: Node interoperable signatures; nested extra elements rejected with/without NULL';
}
