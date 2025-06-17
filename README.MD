# 🛡️ Secure Wallet & Authentication Platform

**High-Assurance Digital Wallet System Using Intel SGX + WebAuthn + JWT**

Welcome to the documentation for our **secure transaction signer** and **authentication microservice**, designed with **defense-in-depth** principles and powered by **Intel SGX**, **WebAuthn**, and **modern cryptographic practices**.

---

## 📦 Overview

This system combines two main components:

### 1. [Secure Wallet Signer Architecture](./SECURE_WALLET.md)
> Intel SGX-enforced, passkey-bound wallet signer for confidential transaction authorization.

- 🧠 SGX enclave generates and seals wallet keypairs
- 🔏 WebAuthn ensures user presence and origin binding
- ⛓️ ECDSA signatures on-chain transactions without exposing private keys
- 🔐 Single-use, non-replayable challenges for robust signing

### 2. [Secure Authentication Microservice](./SECURE_AUTHENTICATION.md)
> Password-authenticated JWT issuer with enclave-verified credentials and ES256 signing.

- 🔐 Argon2id password hashing sealed per user inside enclave
- 🗝️ ES256 JWTs signed from enclave-held keys
- 🧾 Remote attestation with Intel DCAP
- ⏱️ Token lifecycle and revocation policies built-in

---

## 🔧 Technologies Used

| Layer           | Technologies                                               |
|----------------|------------------------------------------------------------|
| TEE             | **Intel SGX** (with DCAP for attestation)                 |
| Cryptography    | **ECDSA secp256k1**, **P-256**, **Argon2id**, **AES-GCM** |
| Auth Protocols  | **WebAuthn**, **JWT (RFC 7519)**                          |
| Backend Langs   | **Rust**, **C++**, **Go**                             |
| Frontend Stack  | **JavaScript**, **React**, **WebAuthn API**               |

---

## 🛠️ Key Features

- ✅ **Hardware-enforced key protection** with SGX sealing
- 🔑 **User-bound passkey authentication** with WebAuthn
- 📜 **Cryptographic challenge-response** based signing
- 🧾 **JWT-based session security** with enclave-signed tokens
- 🕵️ **Mitigations for replay, spoofing, and host compromise**
- 🔁 **Key rotation, sealing policies, and attestation enforcement**

---

## 🧭 Documentation Index

| File                    | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| [`SECURE_WALLET.md`](./SECURE_WALLET.md)         | Design & flow for secure wallet key generation and transaction signing |
| [`SECURE_AUTHENTICATION.md`](./SECURE_AUTHENTICATION.md) | Password-based login, JWT signing, and remote attestation framework   |

---

## 🔐 Security Philosophy

This project follows **zero trust** for host environments. All sensitive operations, such as:

- Private key management
- Password verification
- Transaction signing

...are performed **exclusively** inside SGX enclaves. Enclave state is sealed using strict **MRENCLAVE** or **MRSIGNER** policies and verified via **remote attestation**.

---

## 📚 Further Reading

- [Intel SGX Developer Guide](https://software.intel.com/sgx)
- [WebAuthn Specification (W3C)](https://www.w3.org/TR/webauthn/)
- [JWT (RFC 7519)](https://datatracker.ietf.org/doc/html/rfc7519)
- [Argon2 Password Hashing](https://datatracker.ietf.org/doc/draft-irtf-cfrg-argon2/)

---

## 🤝 Contributions & Security Reports

If you want to contribute or report a vulnerability, please contact the security team via the secure reporting channel defined in our internal policy.

---

> **Warning:** This system assumes genuine SGX hardware and an audited enclave build pipeline. Always verify with remote attestation and signed measurements before deploying.

