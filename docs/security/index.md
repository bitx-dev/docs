---
title: Security
description: Security best practices and guidelines for integrating BitXPay.
---

# Security

Security is paramount when handling cryptocurrency payments. This section covers security best practices and guidelines for your BitXPay integration.

## Topics

### [Authentication Security](./authentication)
Secure your API credentials and implement proper authentication.

### [Best Practices](./best-practices)
General security recommendations for your integration.

## Security Features

BitXPay provides several security features out of the box:

| Feature | Description |
|---------|-------------|
| **HMAC Authentication** | Every request is signed with your secret key |
| **TLS Encryption** | All communications use TLS 1.3 |
| **Webhook Signatures** | Verify webhook authenticity |
| **Rate Limiting** | Protection against abuse |
| **IP Whitelisting** | Optional IP-based access control |
| **2FA** | Two-factor authentication for dashboard |

## Security Compliance

BitXPay is compliant with:

- **PCI DSS** - Payment Card Industry Data Security Standard
- **SOC 2 Type II** - Service Organization Control
- **GDPR** - General Data Protection Regulation

## Reporting Security Issues

If you discover a security vulnerability, please report it to:

- Email: security@bitxpay.com
- Bug Bounty: https://bitxpay.com/security/bug-bounty

::: warning
Never disclose security vulnerabilities publicly before they have been addressed.
:::
