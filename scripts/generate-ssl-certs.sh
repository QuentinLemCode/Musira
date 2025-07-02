#!/bin/bash

# Create certs directory if it doesn't exist
mkdir -p certs

# Create OpenSSL config file with proper extensions
cat > certs/localhost.conf << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = FR
ST = France
L = Paris
O = Musira
OU = Dev
CN = localhost

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = 127.0.0.1
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# Generate private key
openssl genrsa -out certs/localhost-key.pem 2048

# Generate certificate directly (no CSR needed)
openssl req -new -x509 -key certs/localhost-key.pem -out certs/localhost-cert.pem -days 365 -config certs/localhost.conf -extensions v3_req

# Clean up config file
rm certs/localhost.conf

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificates location: certs/"
echo "🔑 Private key: certs/localhost-key.pem"
echo "📜 Certificate: certs/localhost-cert.pem"
echo ""
echo "🔧 Certificate details:"
openssl x509 -in certs/localhost-cert.pem -text -noout | grep -A 10 "X509v3 extensions"
echo ""
echo "⚠️  Note: You'll need to accept the certificate in your browser" 