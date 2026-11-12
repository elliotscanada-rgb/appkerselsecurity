# Asset Specifications Guide

This guide helps admins add and manage asset specifications in the Kestrel Security system.

## 13-Status Tracking System

The system tracks consignments through 13 distinct statuses:

1. **Pending** - Consignment request submitted, awaiting initial processing
2. **Received** - Physical items received and logged into system
3. **Under Verification** - Items being authenticated and verified by specialists
4. **Verification Passed** - Authentication successful, items are genuine
5. **Verification Failed** - Authentication revealed discrepancies or issues
6. **Approved** - Consignment approved for secure storage
7. **Rejected** - Consignment rejected, awaiting return arrangements
8. **In Secure Storage** - Items securely stored in vault facility
9. **On Hold** - Temporary hold placed on consignment
10. **Withdrawal Requested** - Client requested withdrawal from storage
11. **Released** - Items released from secure storage
12. **In Transit** - Items currently being transported
13. **Completed** - Consignment process completed successfully

## Asset Categories

- **Gold Coins & Bars** - Britannia, Sovereign, Krugerrand, Gold Bars
- **Diamonds & Jewelry** - Diamond rings, necklaces, watches with gemstones
- **Gold Jewellery** - Gold chains, bracelets, earrings (92.5% - 99.9% purity)
- **Precious Metals** - Silver, Platinum, Palladium, etc.
- **Other** - Collectibles, rare coins, etc.

## Specifications Format (JSON)

When adding specifications, use this JSON format:

### For Gold Coins
```json
{
  "metal": "Gold",
  "purity": "99.9%",
  "weight": "1 Troy Ounce (31.1g)",
  "diameter": "32.69mm",
  "thickness": "2.89mm",
  "year": "2026",
  "type": "Bullion Coin",
  "origin": "UK Royal Mint"
}
```

### For Gold Bars
```json
{
  "metal": "Gold",
  "purity": "99.99%",
  "weight": "100g",
  "dimensions": "45mm x 25mm x 3mm",
  "manufacturer": "Heraeus",
  "serialNumber": "HER-2024-00521",
  "assayType": "Verified Pure"
}
```

### For Diamond/Precious Stones
```json
{
  "metal": "18K Gold",
  "purity": "75%",
  "weight": "45g",
  "stones": "24 stones, 3.5 carats total",
  "clarity": "VS1",
  "color": "F",
  "certification": "GIA",
  "certificateNumber": "123456789"
}
```

## Storage Locations

Common storage locations:
- **The Vault** - Main secure storage facility
- **Verification Center** - Items under authentication
- **Processing Area** - Items awaiting approval or storage
- **Transit Hub** - Items in transit

## Storage Units

Format: `[Section]-[Unit]` (e.g., A3-105, B2-089)

- **A Series** - Temperature controlled vault, premium items
- **B Series** - Standard vault storage
- **C Series** - Diamond and jewelry vault
- **VC Series** - Verification center
- **PA Series** - Processing area
- **TH Series** - Transit hub

## Charge Types

- **Storage** - Monthly vault storage fee
- **Transportation** - Shipping and logistics costs
- **Handling** - Initial receipt and processing
- **Insurance** - Coverage premium during storage
- **Verification** - Authentication and appraisal
- **Valuation** - Professional valuation service
- **Other** - Miscellaneous charges

## Example: Adding a New Asset

### Step 1: Fill Basic Information
- Consignment Number: Auto-generated (e.g., KSL-2024-001)
- Client: Jack Daniels
- Item Name: "Britannia 2026 1oz Gold Bullion Coin"
- Category: Gold Coins & Bars

### Step 2: Asset Details
- Quantity: 5
- Weight: 31.1 (g)
- Purity: 99.9 (%)
- Declared Value: $2,500,000

### Step 3: Location & Status
- Current Location: The Vault
- Storage Unit: A3-105
- Status: In Secure Storage

### Step 4: Specifications (JSON)
```json
{
  "metal": "Gold",
  "purity": "99.9%",
  "weight": "1 Troy Ounce (31.1g)",
  "diameter": "32.69mm",
  "thickness": "2.89mm",
  "year": "2026"
}
```

### Step 5: Add Associated Charges
- Storage: $5,000 (Paid)
- Verification: $1,500 (Paid)
- Insurance: $15,000 (Pending)

## Best Practices

1. **Always specify weight unit** - Use grams (g) for small items, kilograms (kg) for larger quantities
2. **Be precise with purity** - Different items have different standards (gold jewelry 92.5%, bullion 99.9%+)
3. **Complete specifications** - More detail helps with insurance and authentication
4. **Track status changes** - Each status change is recorded with timestamp and staff member
5. **Monitor pending charges** - Review regularly to ensure timely payment collection
6. **Update location carefully** - Location changes should align with status updates

## Currency

All values are in USD ($). The system automatically formats currency display.

## Support

For questions about asset specifications or adding new asset types, contact the admin support team.
