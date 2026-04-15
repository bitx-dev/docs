# SDKs and Libraries

BITXpay provides official SDKs and libraries to simplify integration across multiple programming languages. Use these SDKs to handle authentication, request signing, and API calls with minimal code.

## Official SDKs

### Node.js / TypeScript

Install via npm:

```bash
npm install @bitxpay/sdk
```

**Quick start:**

```typescript
import { BITXpay } from '@bitxpay/sdk';

const client = new BITXpay({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  environment: 'sandbox' // or 'production'
});

// Create a payment
const payment = await client.payments.create({
  amount: '100.00',
  currency: 'USD',
  description: 'Order #1234',
  redirectUrl: 'https://yoursite.com/success',
  webhookUrl: 'https://yoursite.com/webhook'
});

console.log('Payment URL:', payment.hostedUrl);
```

**Features:**
- Automatic request signing
- TypeScript type definitions
- Built-in retry logic
- Webhook verification helpers
- Promise-based API

**Repository:** [github.com/bitxpay/bitxpay-node](https://github.com/bitxpay/bitxpay-node)  
**Documentation:** [Node.js SDK Docs](https://docs.bitxpay.com/sdks/nodejs)

---

### Python

Install via pip:

```bash
pip install bitxpay
```

**Quick start:**

```python
from bitxpay import BITXpay

client = BITXpay(
    api_key='your-api-key',
    api_secret='your-api-secret',
    environment='sandbox'  # or 'production'
)

# Create a payment
payment = client.payments.create(
    amount='100.00',
    currency='USD',
    description='Order #1234',
    redirect_url='https://yoursite.com/success',
    webhook_url='https://yoursite.com/webhook'
)

print(f'Payment URL: {payment.hosted_url}')
```

**Features:**
- Automatic request signing
- Type hints for IDE support
- Async/await support
- Webhook verification utilities
- Comprehensive error handling

**Repository:** [github.com/bitxpay/bitxpay-python](https://github.com/bitxpay/bitxpay-python)  
**Documentation:** [Python SDK Docs](https://docs.bitxpay.com/sdks/python)

---

### PHP

Install via Composer:

```bash
composer require bitxpay/bitxpay-php
```

**Quick start:**

```php
<?php
require_once('vendor/autoload.php');

use BITXpay\Client;

$client = new Client([
    'api_key' => 'your-api-key',
    'api_secret' => 'your-api-secret',
    'environment' => 'sandbox' // or 'production'
]);

// Create a payment
$payment = $client->payments->create([
    'amount' => '100.00',
    'currency' => 'USD',
    'description' => 'Order #1234',
    'redirect_url' => 'https://yoursite.com/success',
    'webhook_url' => 'https://yoursite.com/webhook'
]);

echo 'Payment URL: ' . $payment->hosted_url;
```

**Features:**
- PSR-4 autoloading
- PSR-7 HTTP message interfaces
- Webhook signature verification
- Exception handling
- PHP 7.4+ support

**Repository:** [github.com/bitxpay/bitxpay-php](https://github.com/bitxpay/bitxpay-php)  
**Documentation:** [PHP SDK Docs](https://docs.bitxpay.com/sdks/php)

---

### Ruby

Install via gem:

```bash
gem install bitxpay
```

**Quick start:**

```ruby
require 'bitxpay'

client = BITXpay::Client.new(
  api_key: 'your-api-key',
  api_secret: 'your-api-secret',
  environment: 'sandbox' # or 'production'
)

# Create a payment
payment = client.payments.create(
  amount: '100.00',
  currency: 'USD',
  description: 'Order #1234',
  redirect_url: 'https://yoursite.com/success',
  webhook_url: 'https://yoursite.com/webhook'
)

puts "Payment URL: #{payment.hosted_url}"
```

**Features:**
- Idiomatic Ruby API
- ActiveSupport integration
- Webhook verification
- Comprehensive test suite
- Ruby 2.7+ support

**Repository:** [github.com/bitxpay/bitxpay-ruby](https://github.com/bitxpay/bitxpay-ruby)  
**Documentation:** [Ruby SDK Docs](https://docs.bitxpay.com/sdks/ruby)

---

### Go

Install via go get:

```bash
go get github.com/bitxpay/bitxpay-go
```

**Quick start:**

```go
package main

import (
    "fmt"
    "github.com/bitxpay/bitxpay-go"
)

func main() {
    client := bitxpay.NewClient(&bitxpay.Config{
        APIKey:      "your-api-key",
        APISecret:   "your-api-secret",
        Environment: "sandbox", // or "production"
    })

    // Create a payment
    payment, err := client.Payments.Create(&bitxpay.PaymentRequest{
        Amount:      "100.00",
        Currency:    "USD",
        Description: "Order #1234",
        RedirectURL: "https://yoursite.com/success",
        WebhookURL:  "https://yoursite.com/webhook",
    })
    
    if err != nil {
        panic(err)
    }

    fmt.Printf("Payment URL: %s\n", payment.HostedURL)
}
```

**Features:**
- Context support
- Strongly typed
- Concurrent-safe
- Webhook verification
- Go 1.18+ with generics

**Repository:** [github.com/bitxpay/bitxpay-go](https://github.com/bitxpay/bitxpay-go)  
**Documentation:** [Go SDK Docs](https://docs.bitxpay.com/sdks/go)

---

### Java

Install via Maven:

```xml
<dependency>
    <groupId>com.bitxpay</groupId>
    <artifactId>bitxpay-java</artifactId>
    <version>1.0.0</version>
</dependency>
```

Or Gradle:

```gradle
implementation 'com.bitxpay:bitxpay-java:1.0.0'
```

**Quick start:**

```java
import com.bitxpay.BITXpay;
import com.bitxpay.model.Payment;
import com.bitxpay.model.PaymentRequest;

public class Example {
    public static void main(String[] args) {
        BITXpay client = new BITXpay.Builder()
            .apiKey("your-api-key")
            .apiSecret("your-api-secret")
            .environment("sandbox") // or "production"
            .build();

        // Create a payment
        PaymentRequest request = new PaymentRequest()
            .amount("100.00")
            .currency("USD")
            .description("Order #1234")
            .redirectUrl("https://yoursite.com/success")
            .webhookUrl("https://yoursite.com/webhook");

        Payment payment = client.payments().create(request);
        System.out.println("Payment URL: " + payment.getHostedUrl());
    }
}
```

**Features:**
- Builder pattern API
- Immutable models
- Async support with CompletableFuture
- Webhook verification
- Java 11+ support

**Repository:** [github.com/bitxpay/bitxpay-java](https://github.com/bitxpay/bitxpay-java)  
**Documentation:** [Java SDK Docs](https://docs.bitxpay.com/sdks/java)

---

## Community Libraries

The following libraries are maintained by the community:

- **C# / .NET**: [bitxpay-dotnet](https://github.com/community/bitxpay-dotnet)
- **Rust**: [bitxpay-rs](https://github.com/community/bitxpay-rs)
- **Swift**: [BITXpayKit](https://github.com/community/BITXpayKit)
- **Kotlin**: [bitxpay-kotlin](https://github.com/community/bitxpay-kotlin)

::: info Community Support
Community libraries are not officially supported by BITXpay. Use at your own discretion and verify the code before production use.
:::

## SDK Features Comparison

| Feature | Node.js | Python | PHP | Ruby | Go | Java |
|---------|---------|--------|-----|------|----|----- |
| Request Signing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Webhook Verification | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| TypeScript/Types | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Async/Await | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Retry Logic | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Rate Limiting | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pagination | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Using the REST API directly

If an SDK is not available for your language, you can use the REST API directly. See our [API Reference](/api-reference/) for complete endpoint documentation.

### Authentication example

```bash
curl -X POST https://api.bitxpay.com/v1/payments \
  -H "X-API-Key: your-api-key" \
  -H "X-Signature: generated-signature" \
  -H "X-Timestamp: 1234567890000" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "100.00",
    "currency": "USD",
    "description": "Order #1234"
  }'
```

See [Authentication](/get-started/authentication) for details on generating signatures.

## Support and Feedback

- **Issues**: Report bugs on the respective GitHub repository
- **Feature Requests**: Open an issue or discussion on GitHub
- **Questions**: Join our [Discord community](https://discord.gg/bitxpay)
- **Email**: sdk-support@bitxpay.com

## Contributing

We welcome contributions to our SDKs! See the CONTRIBUTING.md file in each repository for guidelines.
