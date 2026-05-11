<script setup>
import { withBase } from "vitepress";
</script>

<template>
  <footer class="bitxpay-footer">
    <div class="footer-container">
      <!-- Company Section -->
      <div class="footer-left">
      <div class="footer-logo-container">
        <div class="footer-logo">
          <img
            :src="withBase('/icons/bitxpay.svg')"
            alt="BITXpay"
            class="footer-logo-img"
          />
        </div>
        <h3 class="footer-title">BITXpay</h3>
      </div>

        <p class="footer-description">
          Enterprise-grade cryptocurrency payment gateway. Move value globally
          with speed, security, and full compliance.
        </p>
        <div class="footer-social">
          <a
            href="https://www.npmjs.com/package/kentucky-signer-viem?activeTabt=readme"
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
          </a>
          <a
            href="https://telegram.me/bitxes"
            target="_blank"
            rel="noopener"
            aria-label="Discord"
          >
           <svg width="24" height="25" stroke="" fill="none" color="" viewBox="0 0 24 25" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.90192C6.48 2.90192 2 7.38192 2 12.9019C2 18.4219 6.48 22.9019 12 22.9019C17.52 22.9019 22 18.4219 22 12.9019C22 7.38192 17.52 2.90192 12 2.90192ZM16.64 9.70192C16.49 11.2819 15.84 15.1219 15.51 16.8919C15.37 17.6419 15.09 17.8919 14.83 17.9219C14.25 17.9719 13.81 17.5419 13.25 17.1719C12.37 16.5919 11.87 16.2319 11.02 15.6719C10.03 15.0219 10.67 14.6619 11.24 14.0819C11.39 13.9319 13.95 11.6019 14 11.3919C14.0069 11.3601 14.006 11.3271 13.9973 11.2957C13.9886 11.2644 13.9724 11.2356 13.95 11.2119C13.89 11.1619 13.81 11.1819 13.74 11.1919C13.65 11.2119 12.25 12.1419 9.52 13.9819C9.12 14.2519 8.76 14.3919 8.44 14.3819C8.08 14.3719 7.4 14.1819 6.89 14.0119C6.26 13.8119 5.77 13.7019 5.81 13.3519C5.83 13.1719 6.08 12.9919 6.55 12.8019C9.47 11.5319 11.41 10.6919 12.38 10.2919C15.16 9.13192 15.73 8.93192 16.11 8.93192C16.19 8.93192 16.38 8.95192 16.5 9.05192C16.6 9.13192 16.63 9.24192 16.64 9.32192C16.63 9.38192 16.65 9.56192 16.64 9.70192Z" fill="#ffffff"></path></svg>
          </a>
        <!--   <a
            href="https://twitter.com/bitxpay"
            target="_blank"
            rel="noopener"
            aria-label="Twitter"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
              />
            </svg>
          </a>
          -->
        </div>
      </div>

      <div class="footer-right">
        <!-- Documentation Section -->
        <div class="footer-section">
          <h4 class="footer-heading">Documentation</h4>
          <ul class="footer-links">
            <li><a :href="withBase('/get-started/')">Get Started</a></li>
            <li>
              <a :href="withBase('/get-started/quick-start')">Quick Start</a>
            </li>
            <li>
              <a :href="withBase('/get-started/authentication')"
                >Authentication</a
              >
            </li>
            <li>
              <a :href="withBase('/get-started/supported-networks')"
                >Supported Networks</a
              >
            </li>
            <li><a :href="withBase('/api-reference/')">API Reference</a></li>
          </ul>
        </div>

        <!-- Resources Section -->
        <div class="footer-section">
          <h4 class="footer-heading">Resources</h4>
          <ul class="footer-links">
            <li>
              <a :href="withBase('/get-started/sdks-libraries')"
                >SDKs & Libraries</a
              >
            </li>
            <li><a :href="withBase('/get-started/webhooks')">Webhooks</a></li>
            <li><a :href="withBase('/testing/')">Testing Tools</a></li>
            <li>
              <a :href="withBase('/integration/environments')">Environments</a>
            </li>
            <li>
              <a :href="withBase('/security/best-practices')">Security</a>
            </li>
          </ul>
        </div>

        <!-- Support Section -->
        <div class="footer-section">
          <h4 class="footer-heading">Support</h4>
          <ul class="footer-links">
            <li>
              <a :href="withBase('/testing/troubleshooting')"
                >Troubleshooting</a
              >
            </li>
            <!-- <li>
              <a href="https://github.com/bitxpay/issues" target="_blank"
                >Report Issues</a
              >
            </li> -->
            <!-- <li>
              <a href="https://discord.gg/bitxpay" target="_blank"
                >Discord Community</a
              >
            </li> -->
            <li><a href="mailto:support@bitxpay.com">Email Support</a></li>
            <li><a :href="withBase('/contribution/')">Contribute</a></li>
          </ul>
        </div>

        <!-- Company Section -->
        <div class="footer-section">
          <h4 class="footer-heading">Company</h4>
          <ul class="footer-links">
            <li>
              <a href="https://bitx.es/" target="_blank">About BITXpay</a>
            </li>
            <li>
              <a href="https://bitx.es/contact-us" target="_blank"
                >Contact Us</a
              >
            </li>
            <li><a :href="withBase('/security/')">Security</a></li>
            <li>
              <a href="https://bitx.es/privacy-policy" target="_blank"
                >Privacy Policy</a
              >
            </li>
            <li>
              <a href="https://bitx.es/terms-and-conditions" target="_blank"
                >Terms of Service</a
              >
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="footer-bottom">
      <div class="footer-bottom-inner">
        <p class="footer-copyright">
          © {{ new Date().getFullYear() }} BITXpay. All rights reserved.
        </p>
        <span class="footer-status"> All Systems Operational </span>
      </div>
    </div>
  </footer>
</template>

<style>
.bitxpay-footer {
  background: #040c17;
  color: var(--bitx-gray-200);
}

.footer-container {
  width: 100%;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 4rem;
}

/* Left: brand block */
.footer-left {
  flex: 0 0 280px;
  max-width: 280px;
}

/* Right: four link columns */
.footer-right {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  justify-items: start;
}

.footer-brand {
  grid-column: span 1;
}

.footer-social {
  display: flex;
  gap: 1rem;
}

.footer-heading {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--bitx-gray-50);
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: var(--bitx-gray-300);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
  display: inline-block;
}

.footer-links a:hover {
  color: var(--bitx-accent-light);
  padding-left: 4px;
}

.footer-bottom {
  border-top: 1px solid var(--bitx-primary-light);
  align-items: center;
  background-color: #000000;
}

.footer-bottom-inner {
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.footer-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--bitx-gray-400);
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-copyright {
  margin: 0;
  font-size: 0.875rem;
  color: var(--bitx-gray-400);
}

.footer-compliance {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.compliance-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  background: var(--bitx-primary-light);
  border: 1px solid var(--bitx-accent);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--bitx-accent-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .footer-container {
    grid-template-columns: repeat(3, 1fr);
  }

  .footer-brand {
    grid-column: span 3;
  }

  .footer-cta {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  .footer-brand {
    grid-column: span 2;
  }

  .footer-cta {
    flex-direction: column;
  }

  .footer-bottom-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .footer-compliance {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer-container {
    grid-template-columns: 1fr;
  }

  .footer-brand {
    grid-column: span 1;
  }
}
</style>
