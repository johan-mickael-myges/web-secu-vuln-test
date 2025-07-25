#!/bin/bash

# Create SSL certificates for local development
cd "$(dirname "$0")"
mkdir -p certs

# Generate private key
openssl genrsa -out certs/privkey.pem 2048

# Generate certificate signing request
openssl req -new -key certs/privkey.pem -out certs/cert.csr -subj "/C=FR/ST=State/L=City/O=Organization/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -days 365 -in certs/cert.csr -signkey certs/privkey.pem -out certs/fullchain.pem

# Create Let's Encrypt directory structure
mkdir -p certs/live/localhost
cp certs/fullchain.pem certs/live/localhost/
cp certs/privkey.pem certs/live/localhost/

echo "SSL certificates generated successfully!"
echo "For production, replace these with real Let's Encrypt certificates." 