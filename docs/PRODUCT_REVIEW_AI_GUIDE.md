# Product Review AI Update Guide

This document describes how to update sportsbook/product review content programmatically or via AI (e.g., Claude). The data structures are designed for easy parsing and modification.

## API: PATCH `/api/products/[id]`

**Auth:** Admin only. Include session credentials.

**Purpose:** Update product fields including banking, crypto, media, and metadata.

### Request Body (all fields optional)

```json
{
  "logoUrl": "https://example.com/logo.png",
  "media": "[{\"type\":\"screenshot\",\"url\":\"https://...\",\"alt\":\"...\",\"caption\":\"...\"}]",
  "bankingMethods": "[{\"id\":\"visa\",\"deposit\":{\"min\":10,\"max\":30000,\"fee\":\"FREE\"},\"withdrawal\":{\"fee\":\"FREE\"}},{\"id\":\"mastercard\",\"deposit\":{\"min\":10,\"max\":30000,\"fee\":\"FREE\"},\"withdrawal\":{\"fee\":\"FREE\"}}]",
  "cryptoMethods": "[{\"id\":\"bitcoin\"},{\"id\":\"ethereum\"}]",
  "acceptedCurrencies": "[\"USD\",\"EUR\"]",
  "bonusSummary": "$500 welcome bonus",
  "minDeposit": "$10",
  "fiatSupported": true,
  "cryptoSupported": false
}
```

---

## Field Schemas

### `logoUrl` (string | null)
URL to the brand logo image. Shown in the product header.

### `media` (JSON string)
Array of media items: screenshots, photos.

```json
[
  {"type": "screenshot", "url": "https://...", "alt": "App interface", "caption": "Mobile app"},
  {"type": "photo", "url": "https://...", "caption": "Desktop view"}
]
```

- `type`: `"screenshot"` | `"photo"` | `"logo"`
- `url`: Required. Image URL.
- `alt`, `caption`: Optional.

### `bankingMethods` (JSON string)
Array of banking options. Use **exact IDs** from the banking options list.

```json
[
  {
    "id": "visa",
    "deposit": {"min": 10, "max": 30000, "fee": "FREE"},
    "withdrawal": {"fee": "FREE"}
  },
  {
    "id": "paypal",
    "deposit": {"min": 10, "max": 10000, "fee": "FREE"},
    "withdrawal": {"fee": "FREE"}
  }
]
```

**Banking IDs:** visa, mastercard, paypal, banktransfer, paynearme, skrill, paysafecard, cash, maestro, trustly, applepay, googlepay

### `cryptoMethods` (JSON string)
Array of supported cryptocurrencies.

```json
[
  {"id": "bitcoin"},
  {"id": "ethereum"},
  {"id": "litecoin", "name": "Litecoin"}
]
```

**Crypto IDs:** bitcoin, ethereum, litecoin, usdt, usdc, dogecoin, bitcoin_cash

### `acceptedCurrencies` (JSON string)
Array of currency codes.

```json
["USD", "EUR", "GBP"]
```

---

## Example: Add Visa & Mastercard to a product

1. Get the product ID (from the URL `/products/[slug]` → fetch post → `post.product.id`).
2. PATCH `/api/products/{productId}`:

```json
{
  "bankingMethods": "[{\"id\":\"visa\",\"deposit\":{\"min\":10,\"max\":30000,\"fee\":\"FREE\"},\"withdrawal\":{\"fee\":\"FREE\"}},{\"id\":\"mastercard\",\"deposit\":{\"min\":10,\"max\":30000,\"fee\":\"FREE\"},\"withdrawal\":{\"fee\":\"FREE\"}}]",
  "acceptedCurrencies": "[\"USD\"]"
}
```

---

## Example: Add cryptocurrency support

```json
{
  "cryptoSupported": true,
  "cryptoMethods": "[{\"id\":\"bitcoin\"},{\"id\":\"ethereum\"}]"
}
```

---

## Example: Add logo and screenshot

```json
{
  "logoUrl": "https://example.com/bet365-logo.png",
  "media": "[{\"type\":\"screenshot\",\"url\":\"https://example.com/app-screenshot.png\",\"alt\":\"bet365 mobile app\",\"caption\":\"Mobile betting interface\"}]"
}
```

---

## Reference: Full option lists

See `src/lib/product-options.ts` for:
- `BANKING_OPTIONS` – valid banking `id` values
- `CRYPTO_OPTIONS` – valid crypto `id` values
