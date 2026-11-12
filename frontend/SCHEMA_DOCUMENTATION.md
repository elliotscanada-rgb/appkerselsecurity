# Database Schema Documentation

## Overview
This document describes the complete database schema for the Premium Asset Tracking & Shipment Management System.

---

## Table Structure

### 1. CUSTOMERS
Stores information about consignment company customers.

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | INT | PK | Primary key |
| customer_id | VARCHAR(50) | UQ | Unique customer identifier |
| company_name | VARCHAR(255) | | Company name |
| contact_person | VARCHAR(255) | | Primary contact person |
| email | VARCHAR(255) | UQ | Email address |
| phone | VARCHAR(20) | | Phone number |
| address | TEXT | | Street address |
| city | VARCHAR(100) | | City |
| country | VARCHAR(100) | | Country |
| postal_code | VARCHAR(20) | | Postal code |
| business_registration | VARCHAR(100) | | Business registration number |
| tax_id | VARCHAR(50) | | Tax identification number |
| account_status | VARCHAR(50) | IX | Status: ACTIVE, SUSPENDED, INACTIVE |
| account_type | VARCHAR(50) | | Standard, Premium, Enterprise |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |
| created_by | INT | FK | User who created the record |

---

### 2. USERS
Stores staff and admin user accounts.

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | INT | PK | Primary key |
| user_id | VARCHAR(50) | UQ | Unique user identifier |
| username | VARCHAR(100) | UQ | Login username |
| email | VARCHAR(255) | UQ | Email address |
| password_hash | VARCHAR(255) | | Hashed password |
| full_name | VARCHAR(255) | | Full name |
| role | VARCHAR(50) | IX | admin, officer, staff, manager |
| department | VARCHAR(100) | | Department name |
| phone | VARCHAR(20) | | Phone number |
| avatar_url | VARCHAR(255) | | Profile picture URL |
| is_active | BOOLEAN | IX | Account active status |
| last_login | TIMESTAMP | | Last login timestamp |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

---

### 3. CONSIGNMENTS
Stores consignment registrations.

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | INT | PK | Primary key |
| consignment_id | VARCHAR(50) | UQ | Unique consignment identifier |
| customer_id | INT | FK | Reference to customer |
| reference_number | VARCHAR(100) | | Customer reference |
| status | VARCHAR(50) | IX | PENDING, PROCESSING, IN_TRANSIT, DELIVERED, COMPLETED |
| total_declared_value | DECIMAL(15,2) | | Total declared value |
| total_insured_value | DECIMAL(15,2) | | Total insured value |
| currency | VARCHAR(3) | | Currency code (USD, EUR, GBP) |
| description | TEXT | | Consignment description |
| special_instructions | TEXT | | Special handling instructions |
| deposit_date | DATETIME | IX | Date asset deposited |
| deposit_year | INT | IX | Year of deposit (for reporting) |
| expected_completion_date | DATETIME | | Expected completion date |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |
| created_by | INT | FK | User who created record |

---

### 4. ASSETS
Stores individual asset details.

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | INT | PK | Primary key |
| asset_id | VARCHAR(50) | UQ | Unique asset identifier |
| consignment_id | INT | FK | Reference to consignment |
| asset_name | VARCHAR(255) | | Asset name (e.g., "Gold Bullion 24K") |
| asset_category | VARCHAR(100) | | Category (Gold, Diamond, Jewellery, Watches, etc.) |
| asset_type | VARCHAR(100) | | Type specification |
| description | TEXT | | Detailed description |
| photograph_url | VARCHAR(500) | | URL to asset photo |
| quantity | INT | | Number of items |
| weight | DECIMAL(10,2) | | Weight value |
| weight_unit | VARCHAR(10) | | kg, g, oz, ct (carat) |
| dimensions | VARCHAR(100) | | Physical dimensions |
| purity | VARCHAR(50) | | Purity specification (24K, 18K, VVS1, etc.) |
| serial_number | VARCHAR(100) | | Serial/batch number |
| marking_identification | TEXT | | Markings and identifications |
| declared_value | DECIMAL(12,2) | | Declared value |
| insured_value | DECIMAL(12,2) | | Insured value |
| currency | VARCHAR(3) | | Currency code |
| certificate_number | VARCHAR(100) | | Certificate reference |
| certificate_issuer | VARCHAR(255) | | Issuing authority |
| certificate_date | DATE | | Certificate date |
| insurance_policy_number | VARCHAR(100) | | Insurance policy reference |
| insurance_provider | VARCHAR(255) | | Insurance company name |
| insurance_expiry_date | DATE | | Insurance expiry date |
| security_seal_number | VARCHAR(50) | | Security seal identifier |
| security_seal_status | VARCHAR(50) | | ACTIVE, BROKEN, REPLACED |
| current_location_id | INT | FK | Current location reference |
| custody_status | VARCHAR(50) | | Current custody status |
| asset_status | VARCHAR(50) | IX | PENDING, REGISTERED, CLEARED, IN_TRANSIT, DELIVERED |
| deposit_date | DATETIME | IX | Date deposited |
| deposit_year | INT | IX | Year of deposit |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |
| created_by | INT | FK | User who created record |

---

### 5. SHIPMENTS
Stores shipment/movement information.

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | INT | PK | Primary key |
| shipment_id | VARCHAR(50) | UQ | Unique shipment identifier |
| consignment_id | INT | FK | Reference to consignment |
| shipment_number | VARCHAR(100) | | Shipment number |
| shipment_type | VARCHAR(50) | | AIR, LAND, SEA, COURIER |
| origin_location | VARCHAR(255) | | Origin city/port |
| destination_location | VARCHAR(255) | | Destination city/port |
| origin_coordinates_lat | DECIMAL(10,8) | | Origin latitude |
| origin_coordinates_lng | DECIMAL(11,8) | | Origin longitude |
| destination_coordinates_lat | DECIMAL(10,8) | | Destination latitude |
| destination_coordinates_lng | DECIMAL(11,8) | | Destination longitude |
| status | VARCHAR(50) | IX | PENDING, DISPATCHED, IN_TRANSIT, CUSTOMS, DELIVERED |
| current_location | VARCHAR(255) | | Current location description |
| current_coordinates_lat | DECIMAL(10,8) | | Current latitude |
| current_coordinates_lng | DECIMAL(11,8) | | Current longitude |
| assigned_officer_id | INT | FK | Assigned officer |
| assigned_officer_name | VARCHAR(255) | | Officer name (denormalized) |
| container_number | VARCHAR(100) | | Container/box number |
| vehicle_number | VARCHAR(50) | | Vehicle/aircraft registration |
| transport_mode | VARCHAR(50) | | Transportation method |
| estimated_departure | DATETIME | IX | Planned departure |
| actual_departure | DATETIME | | Actual departure |
| estimated_arrival | DATETIME | IX | Planned arrival |
| actual_arrival | DATETIME | | Actual arrival |
| dispatch_date | DATETIME | | Dispatch date |
| total_weight | DECIMAL(12,2) | | Total shipment weight |
| total_items | INT | | Number of items |
| insurance_amount | DECIMAL(12,2) | | Insurance coverage |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |
| created_by | INT | FK | User who created record |

---

### 6. ASSET_LOCATIONS
Tracks location history for each asset.

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | INT | PK | Primary key |
| shipment_id | INT | FK | Reference to shipment |
| asset_id | INT | FK | Reference to asset |
| location_type | VARCHAR(50) | IX | ORIGIN, IN_TRANSIT, PORT, CUSTOMS, WAREHOUSE, DESTINATION |
| location_name | VARCHAR(255) | | Location description |
| city | VARCHAR(100) | | City name |
| country | VARCHAR(100) | | Country name |
| port_airport | VARCHAR(255) | | Port/airport code |
| warehouse | VARCHAR(255) | | Warehouse name |
| coordinates_lat | DECIMAL(10,8) | | Latitude |
| coordinates_lng | DECIMAL(11,8) | | Longitude |
| status | VARCHAR(50) | | Location status |
| description | TEXT | | Update description |
| evidence_photo_url | VARCHAR(500) | | Photo proof URL |
| updated_by | INT | FK | User who updated |
| update_notes | TEXT | | Additional notes |
| created_at | TIMESTAMP | IX | Update timestamp |
| updated_at | TIMESTAMP | | Last modified |

---

### 7. CUSTODY_RECORDS
Maintains chain of custody documentation.

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | INT | PK | Primary key |
| custody_id | VARCHAR(50) | UQ | Unique custody record ID |
| asset_id | INT | FK | Reference to asset |
| shipment_id | INT | FK | Reference to shipment |
| transferred_from_user_id | INT | FK | Transfer source user |
| transferred_from_name | VARCHAR(255) | | Source name (denormalized) |
| transferred_to_user_id | INT | FK | Transfer recipient user |
| transferred_to_name | VARCHAR(255) | | Recipient name (denormalized) |
| transfer_location | VARCHAR(255) | | Where transfer happened |
| transfer_date | DATETIME | IX | Date of transfer |
| seal_number | VARCHAR(50) | | Security seal number |
| seal_verified | BOOLEAN | | Seal verification status |
| seal_verification_date | DATETIME | | Verification date |
| verified_by_user_id | INT | FK | Verifying officer |
| evidence_photo_url | VARCHAR(500) | | Transfer photo |
| incident_report | TEXT | | Incident details (if any) |
| incident_type | VARCHAR(50) | | Type of incident |
| resolution_notes | TEXT | | Resolution details |
| transfer_status | VARCHAR(50) | | SUCCESS, PENDING, REJECTED, INCIDENT |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

---

### 8. CONTAINERS
Stores container/packaging information.

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | INT | PK | Primary key |
| container_id | VARCHAR(50) | UQ | Container identifier |
| shipment_id | INT | FK | Reference to shipment |
| container_type | VARCHAR(50) | | Type: BOX, CRATE, CONTAINER, PALLET |
| container_number | VARCHAR(100) | | Container number |
| seal_number | VARCHAR(50) | | Security seal |
| capacity | DECIMAL(10,2) | | Container capacity |
| weight_capacity | DECIMAL(10,2) | | Weight limit |
| current_weight | DECIMAL(10,2) | | Current weight |
| current_items | INT | | Number of items |
| status | VARCHAR(50) | | Status |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

---

### 9. DOCUMENTS
Stores document/file references.

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | INT | PK | Primary key |
| document_id | VARCHAR(50) | UQ | Unique document ID |
| consignment_id | INT | FK | Reference to consignment |
| asset_id | INT | FK | Reference to asset |
| document_type | VARCHAR(100) | IX | CERTIFICATE, INSURANCE, CUSTOMS, INVOICE, etc. |
| document_name | VARCHAR(255) | | Document title |
| file_url | VARCHAR(500) | | File storage URL |
| file_size | INT | | File size in bytes |
| file_format | VARCHAR(20) | | PDF, JPG, PNG, DOC, etc. |
| uploaded_by | INT | FK | Uploader user |
| upload_date | TIMESTAMP | | Upload timestamp |
| expiry_date | DATE | | Document expiry (if applicable) |
| status | VARCHAR(50) | | ACTIVE, EXPIRED, ARCHIVED |

---

### 10. NOTIFICATIONS
Stores system notifications.

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | INT | PK | Primary key |
| notification_id | VARCHAR(50) | UQ | Unique notification ID |
| user_id | INT | FK | Recipient user |
| customer_id | INT | FK | Customer (if applicable) |
| notification_type | VARCHAR(100) | | SHIPMENT_DEPARTED, LOCATION_UPDATE, CUSTOMS_CLEARED, etc. |
| title | VARCHAR(255) | | Notification title |
| message | TEXT | | Notification message |
| related_entity_type | VARCHAR(50) | | SHIPMENT, ASSET, CONSIGNMENT |
| related_entity_id | INT | | Related entity ID |
| is_read | BOOLEAN | IX | Read status |
| read_at | TIMESTAMP | | When read |
| created_at | TIMESTAMP | IX | Creation timestamp |

---

### 11. AUDIT_LOGS
Records all system changes for compliance.

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | INT | PK | Primary key |
| audit_id | VARCHAR(50) | UQ | Unique audit entry ID |
| user_id | INT | FK | User who made change |
| action | VARCHAR(100) | | CREATE, UPDATE, DELETE, APPROVE |
| entity_type | VARCHAR(100) | IX | ASSET, SHIPMENT, CONSIGNMENT |
| entity_id | INT | | Related entity ID |
| old_values | JSON | | Previous values |
| new_values | JSON | | New values |
| ip_address | VARCHAR(50) | | Client IP |
| user_agent | TEXT | | Browser/client info |
| created_at | TIMESTAMP | IX | Timestamp |

---

### 12. FEES_CONFIGURATION
Stores fee and charge configurations.

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | INT | PK | Primary key |
| fee_id | VARCHAR(50) | UQ | Unique fee ID |
| fee_type | VARCHAR(100) | IX | HANDLING, INSURANCE, STORAGE, TRANSPORT |
| fee_name | VARCHAR(255) | | Fee display name |
| base_fee | DECIMAL(10,2) | | Base fee amount |
| percentage_fee | DECIMAL(5,2) | | Percentage of value |
| minimum_fee | DECIMAL(10,2) | | Minimum charge |
| maximum_fee | DECIMAL(10,2) | | Maximum charge |
| currency | VARCHAR(3) | | Currency code |
| description | TEXT | | Fee description |
| is_active | BOOLEAN | IX | Active status |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

---

### 13. PAYMENTS
Records financial transactions.

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | INT | PK | Primary key |
| payment_id | VARCHAR(50) | UQ | Unique payment ID |
| consignment_id | INT | FK | Related consignment |
| customer_id | INT | FK | Customer |
| amount | DECIMAL(15,2) | | Payment amount |
| currency | VARCHAR(3) | | Currency |
| payment_type | VARCHAR(50) | | DEPOSIT, BALANCE, REFUND |
| payment_method | VARCHAR(50) | | BANK_TRANSFER, CREDIT_CARD, CASH |
| reference_number | VARCHAR(100) | | Bank/transaction reference |
| status | VARCHAR(50) | | PENDING, COMPLETED, FAILED, CANCELLED |
| transaction_date | DATETIME | | Transaction date |
| created_at | TIMESTAMP | | Record creation |
| updated_at | TIMESTAMP | | Last update |

---

### 14. STORAGE_FACILITIES
Manages physical storage locations.

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | INT | PK | Primary key |
| facility_id | VARCHAR(50) | UQ | Unique facility ID |
| facility_name | VARCHAR(255) | | Facility name |
| facility_type | VARCHAR(100) | | WAREHOUSE, VAULT, COLD_STORAGE |
| location | VARCHAR(255) | | Address |
| city | VARCHAR(100) | | City |
| country | VARCHAR(100) | | Country |
| coordinates_lat | DECIMAL(10,8) | | Latitude |
| coordinates_lng | DECIMAL(11,8) | | Longitude |
| capacity | DECIMAL(15,2) | | Total capacity |
| current_occupancy | DECIMAL(15,2) | | Current usage |
| security_features | TEXT | | Security description |
| manager_name | VARCHAR(255) | | Manager name |
| manager_phone | VARCHAR(20) | | Manager phone |
| is_active | BOOLEAN | IX | Active status |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

---

### 15. INSURANCE_PROVIDERS
Manages insurance company information.

| Column | Type | Key | Description |
|--------|------|-----|-------------|
| id | INT | PK | Primary key |
| provider_id | VARCHAR(50) | UQ | Unique provider ID |
| provider_name | VARCHAR(255) | | Company name |
| contact_person | VARCHAR(255) | | Contact name |
| email | VARCHAR(255) | | Email address |
| phone | VARCHAR(20) | | Phone number |
| office_address | TEXT | | Physical address |
| coverage_types | TEXT | | Types of coverage |
| is_active | BOOLEAN | IX | Active status |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

---

## Key Relationships

```
CUSTOMERS
    ├── has many CONSIGNMENTS
    │   ├── has many ASSETS
    │   │   ├── has many ASSET_LOCATIONS
    │   │   ├── has many CUSTODY_RECORDS
    │   │   └── has many DOCUMENTS
    │   ├── has many SHIPMENTS
    │   │   ├── has many CONTAINERS
    │   │   ├── has many CUSTODY_RECORDS
    │   │   └── has many ASSET_LOCATIONS
    │   └── has many PAYMENTS
    └── has many NOTIFICATIONS

USERS (Staff/Admin)
    ├── creates/updates ASSETS
    ├── creates/updates SHIPMENTS
    ├── performs CUSTODY_RECORDS
    ├── uploads DOCUMENTS
    ├── generates AUDIT_LOGS
    └── receives NOTIFICATIONS
```

---

## Status Values

### Consignment Status
- PENDING: Awaiting asset registration
- PROCESSING: Assets registered, awaiting dispatch
- IN_TRANSIT: Currently being transported
- CUSTOMS: In customs clearance
- DELIVERED: Arrived at destination
- COMPLETED: All procedures finished

### Asset Status
- PENDING: Registered but not cleared
- REGISTERED: Ready for shipment
- CLEARED: Cleared for movement
- IN_TRANSIT: Currently moving
- DELIVERED: Delivered to destination

### Shipment Status
- PENDING: Awaiting dispatch
- DISPATCHED: Left origin
- IN_TRANSIT: En route
- CUSTOMS: Customs processing
- DELIVERED: At destination

### Custody Status
- SUCCESS: Transfer completed
- PENDING: Awaiting acceptance
- REJECTED: Transfer denied
- INCIDENT: Issue reported

---

## Database Setup Instructions

### MySQL Setup
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE asset_tracking;
USE asset_tracking;

# Import schema
SOURCE DATABASE_SCHEMA.sql;

# Verify tables
SHOW TABLES;
```

### PostgreSQL Setup
```bash
# Create database
createdb asset_tracking

# Connect and import
psql asset_tracking < DATABASE_SCHEMA.sql
```

---

## Performance Considerations

1. **Indexes**: Strategic indexes on frequently queried columns
2. **Partitioning**: Consider partitioning by date for large tables
3. **Archival**: Old records can be archived after set periods
4. **Views**: Pre-built views for common reports
5. **Caching**: Implement Redis for frequently accessed data

---

## Security Considerations

1. **Encryption**: Sensitive data (coordinates, valuations) encrypted at rest
2. **Access Control**: Row-level security for customer data
3. **Audit Trail**: All changes tracked in audit_logs
4. **User Roles**: Role-based access control
5. **Data Backup**: Regular automated backups required

---

## Maintenance Tasks

1. **Weekly**: Backup database
2. **Monthly**: Archive old audit logs
3. **Quarterly**: Review and optimize indexes
4. **Annually**: Archive completed consignments

---

**Version**: 1.0  
**Last Updated**: November 10, 2026  
**Maintainer**: Development Team
