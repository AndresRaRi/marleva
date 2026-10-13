#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT/infra/local/secrets"
if test -f localhost.crt; then exit 0; fi
umask 077
openssl req -x509 -newkey rsa:3072 -sha256 -days 365 -nodes -keyout ca.key -out ca.crt -subj '/CN=Marleva Local Development CA'
openssl req -new -newkey rsa:2048 -nodes -keyout localhost.key -out localhost.csr -subj '/CN=localhost'
cat > localhost.ext <<'TXT'
subjectAltName=DNS:localhost,IP:127.0.0.1,IP:10.0.2.2
basicConstraints=CA:FALSE
keyUsage=digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
TXT
openssl x509 -req -in localhost.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out localhost.crt -days 365 -sha256 -extfile localhost.ext
openssl verify -CAfile ca.crt localhost.crt
