# HTTPS Configuration for Local Development

This guide explains how to configure HTTPS with self-signed certificates for local development of Musira.

## 🚀 Quick Start

### 1. Generate SSL Certificates

```bash
npm run generate-ssl
```

### 2. Start the Application

```bash
npm start
```

The application will be accessible at:

- **Frontend (HTTPS)**: https://localhost:4200
- **Backend (HTTP)**: http://localhost:3000/api

## 🔧 Architecture

```
Browser → HTTPS → Angular Dev Server → HTTP → NestJS Backend
        (secure)                     (proxy)      (internal)
```

- **Angular**: Serves the application over HTTPS with self-signed certificates
- **Angular Proxy**: Translates HTTPS → HTTP requests to the backend
- **NestJS**: Remains on HTTP (simpler, no direct exposure)
- **JWT Cookies**: `secure: true` works because the browser sees HTTPS

## ⚠️ Browser Configuration

When first accessing https://localhost:4200, your browser will display a security warning because the certificate is self-signed.

### Chrome/Edge

1. Click "Advanced"
2. Click "Proceed to localhost (unsafe)"

### Firefox

1. Click "Advanced"
2. Click "Accept the Risk and Continue"

### Safari

1. Click "Show Details"
2. Click "Visit this website"

## 🔍 Verification

Once configured, you can verify everything is working:

1. Go to https://localhost:4200
2. Open DevTools → Network
3. Create an account with email
4. Verify that cookies are properly set (🔒 secure)

## 📁 Generated Files

```
certs/
├── localhost-key.pem  # Private key
└── localhost-cert.pem # Public certificate
```

These files are ignored by Git (.gitignore) and must be regenerated on each development machine.

## 🛠 Certificate Regeneration

If you have issues with certificates:

```bash
rm -rf certs/
npm run generate-ssl
```

Certificates are valid for 365 days.
