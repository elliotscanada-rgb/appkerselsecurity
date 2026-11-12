-- =====================================================
-- PREMIUM ASSET TRACKING & SHIPMENT MANAGEMENT SYSTEM
-- Database Schema
-- =====================================================

-- =====================================================
-- 1. CUSTOMERS TABLE
-- =====================================================
CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id VARCHAR(50) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  business_registration VARCHAR(100),
  tax_id VARCHAR(50),
  account_status VARCHAR(50) DEFAULT 'ACTIVE',
  account_type VARCHAR(50) DEFAULT 'STANDARD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_email (email),
  INDEX idx_status (account_status)
);

-- =====================================================
-- 2. USERS TABLE (Staff, Admin)
-- =====================================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL,
  department VARCHAR(100),
  phone VARCHAR(20),
  avatar_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_active (is_active)
);

-- =====================================================
-- 3. CONSIGNMENTS TABLE
-- =====================================================
CREATE TABLE consignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  consignment_id VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  reference_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'PENDING',
  total_declared_value DECIMAL(15,2),
  total_insured_value DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  special_instructions TEXT,
  deposit_date DATETIME,
  deposit_year INT,
  expected_completion_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_consignment_id (consignment_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_status (status),
  INDEX idx_deposit_date (deposit_date)
);

-- =====================================================
-- 4. ASSETS TABLE
-- =====================================================
CREATE TABLE assets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id VARCHAR(50) UNIQUE NOT NULL,
  consignment_id INT NOT NULL,
  asset_name VARCHAR(255) NOT NULL,
  asset_category VARCHAR(100),
  asset_type VARCHAR(100),
  description TEXT,
  photograph_url VARCHAR(500),
  quantity INT DEFAULT 1,
  weight DECIMAL(10,2),
  weight_unit VARCHAR(10) DEFAULT 'kg',
  dimensions VARCHAR(100),
  purity VARCHAR(50),
  serial_number VARCHAR(100),
  marking_identification TEXT,
  declared_value DECIMAL(12,2),
  insured_value DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  certificate_number VARCHAR(100),
  certificate_issuer VARCHAR(255),
  certificate_date DATE,
  insurance_policy_number VARCHAR(100),
  insurance_provider VARCHAR(255),
  insurance_expiry_date DATE,
  security_seal_number VARCHAR(50),
  security_seal_status VARCHAR(50),
  current_location_id INT,
  custody_status VARCHAR(50),
  asset_status VARCHAR(50) DEFAULT 'PENDING',
  deposit_date DATETIME,
  deposit_year INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (consignment_id) REFERENCES consignments(id),
  FOREIGN KEY (current_location_id) REFERENCES asset_locations(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_asset_id (asset_id),
  INDEX idx_consignment_id (consignment_id),
  INDEX idx_status (asset_status),
  INDEX idx_deposit_date (deposit_date),
  INDEX idx_deposit_year (deposit_year)
);

-- =====================================================
-- 5. SHIPMENTS TABLE
-- =====================================================
CREATE TABLE shipments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  shipment_id VARCHAR(50) UNIQUE NOT NULL,
  consignment_id INT NOT NULL,
  shipment_number VARCHAR(100),
  shipment_type VARCHAR(50),
  origin_location VARCHAR(255),
  destination_location VARCHAR(255),
  origin_coordinates_lat DECIMAL(10,8),
  origin_coordinates_lng DECIMAL(11,8),
  destination_coordinates_lat DECIMAL(10,8),
  destination_coordinates_lng DECIMAL(11,8),
  status VARCHAR(50) DEFAULT 'PENDING',
  current_location VARCHAR(255),
  current_coordinates_lat DECIMAL(10,8),
  current_coordinates_lng DECIMAL(11,8),
  assigned_officer_id INT,
  assigned_officer_name VARCHAR(255),
  container_number VARCHAR(100),
  vehicle_number VARCHAR(50),
  transport_mode VARCHAR(50),
  estimated_departure DATETIME,
  actual_departure DATETIME,
  estimated_arrival DATETIME,
  actual_arrival DATETIME,
  dispatch_date DATETIME,
  total_weight DECIMAL(12,2),
  total_items INT,
  insurance_amount DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (consignment_id) REFERENCES consignments(id),
  FOREIGN KEY (assigned_officer_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_shipment_id (shipment_id),
  INDEX idx_consignment_id (consignment_id),
  INDEX idx_status (status),
  INDEX idx_departure_date (estimated_departure),
  INDEX idx_arrival_date (estimated_arrival)
);

-- =====================================================
-- 6. ASSET LOCATIONS TABLE (Tracking History)
-- =====================================================
CREATE TABLE asset_locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  shipment_id INT,
  asset_id INT NOT NULL,
  location_type VARCHAR(50),
  location_name VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  port_airport VARCHAR(255),
  warehouse VARCHAR(255),
  coordinates_lat DECIMAL(10,8),
  coordinates_lng DECIMAL(11,8),
  status VARCHAR(50),
  description TEXT,
  evidence_photo_url VARCHAR(500),
  updated_by INT,
  update_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shipment_id) REFERENCES shipments(id),
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (updated_by) REFERENCES users(id),
  INDEX idx_asset_id (asset_id),
  INDEX idx_shipment_id (shipment_id),
  INDEX idx_created_at (created_at),
  INDEX idx_location_type (location_type)
);

-- =====================================================
-- 7. CUSTODY RECORDS TABLE
-- =====================================================
CREATE TABLE custody_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  custody_id VARCHAR(50) UNIQUE NOT NULL,
  asset_id INT NOT NULL,
  shipment_id INT,
  transferred_from_user_id INT,
  transferred_from_name VARCHAR(255),
  transferred_to_user_id INT,
  transferred_to_name VARCHAR(255),
  transfer_location VARCHAR(255),
  transfer_date DATETIME,
  seal_number VARCHAR(50),
  seal_verified BOOLEAN,
  seal_verification_date DATETIME,
  verified_by_user_id INT,
  evidence_photo_url VARCHAR(500),
  incident_report TEXT,
  incident_type VARCHAR(50),
  resolution_notes TEXT,
  transfer_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (shipment_id) REFERENCES shipments(id),
  FOREIGN KEY (transferred_from_user_id) REFERENCES users(id),
  FOREIGN KEY (transferred_to_user_id) REFERENCES users(id),
  FOREIGN KEY (verified_by_user_id) REFERENCES users(id),
  INDEX idx_custody_id (custody_id),
  INDEX idx_asset_id (asset_id),
  INDEX idx_transfer_date (transfer_date),
  INDEX idx_status (transfer_status)
);

-- =====================================================
-- 8. CONTAINERS TABLE
-- =====================================================
CREATE TABLE containers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  container_id VARCHAR(50) UNIQUE NOT NULL,
  shipment_id INT NOT NULL,
  container_type VARCHAR(50),
  container_number VARCHAR(100),
  seal_number VARCHAR(50),
  capacity DECIMAL(10,2),
  weight_capacity DECIMAL(10,2),
  current_weight DECIMAL(10,2),
  current_items INT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shipment_id) REFERENCES shipments(id),
  INDEX idx_container_id (container_id),
  INDEX idx_shipment_id (shipment_id),
  INDEX idx_status (status)
);

-- =====================================================
-- 9. DOCUMENTS TABLE
-- =====================================================
CREATE TABLE documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  document_id VARCHAR(50) UNIQUE NOT NULL,
  consignment_id INT,
  asset_id INT,
  document_type VARCHAR(100),
  document_name VARCHAR(255),
  file_url VARCHAR(500),
  file_size INT,
  file_format VARCHAR(20),
  uploaded_by INT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiry_date DATE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  FOREIGN KEY (consignment_id) REFERENCES consignments(id),
  FOREIGN KEY (asset_id) REFERENCES assets(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_document_id (document_id),
  INDEX idx_consignment_id (consignment_id),
  INDEX idx_asset_id (asset_id),
  INDEX idx_document_type (document_type)
);

-- =====================================================
-- 10. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  notification_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  customer_id INT,
  notification_type VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  related_entity_type VARCHAR(50),
  related_entity_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_notification_id (notification_id),
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

-- =====================================================
-- 11. AUDIT LOG TABLE
-- =====================================================
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  audit_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INT,
  action VARCHAR(100),
  entity_type VARCHAR(100),
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_audit_id (audit_id),
  INDEX idx_user_id (user_id),
  INDEX idx_entity_type (entity_type),
  INDEX idx_created_at (created_at)
);

-- =====================================================
-- 12. FEES CONFIGURATION TABLE
-- =====================================================
CREATE TABLE fees_configuration (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fee_id VARCHAR(50) UNIQUE NOT NULL,
  fee_type VARCHAR(100),
  fee_name VARCHAR(255),
  base_fee DECIMAL(10,2),
  percentage_fee DECIMAL(5,2),
  minimum_fee DECIMAL(10,2),
  maximum_fee DECIMAL(10,2),
  currency VARCHAR(3),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fee_id (fee_id),
  INDEX idx_fee_type (fee_type),
  INDEX idx_active (is_active)
);

-- =====================================================
-- 13. PAYMENTS TABLE
-- =====================================================
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id VARCHAR(50) UNIQUE NOT NULL,
  consignment_id INT NOT NULL,
  customer_id INT NOT NULL,
  amount DECIMAL(15,2),
  currency VARCHAR(3),
  payment_type VARCHAR(50),
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  status VARCHAR(50),
  transaction_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (consignment_id) REFERENCES consignments(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_payment_id (payment_id),
  INDEX idx_consignment_id (consignment_id),
  INDEX idx_status (status)
);

-- =====================================================
-- 14. STORAGE FACILITY TABLE
-- =====================================================
CREATE TABLE storage_facilities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  facility_id VARCHAR(50) UNIQUE NOT NULL,
  facility_name VARCHAR(255),
  facility_type VARCHAR(100),
  location VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  coordinates_lat DECIMAL(10,8),
  coordinates_lng DECIMAL(11,8),
  capacity DECIMAL(15,2),
  current_occupancy DECIMAL(15,2),
  security_features TEXT,
  manager_name VARCHAR(255),
  manager_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_facility_id (facility_id),
  INDEX idx_active (is_active)
);

-- =====================================================
-- 15. INSURANCE PROVIDERS TABLE
-- =====================================================
CREATE TABLE insurance_providers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  provider_id VARCHAR(50) UNIQUE NOT NULL,
  provider_name VARCHAR(255),
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  office_address TEXT,
  coverage_types TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_provider_id (provider_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_shipment_status_date ON shipments(status, estimated_departure);
CREATE INDEX idx_asset_consignment_status ON assets(consignment_id, asset_status);
CREATE INDEX idx_location_asset_date ON asset_locations(asset_id, created_at);
CREATE INDEX idx_custody_asset_transfer ON custody_records(asset_id, transfer_date);
CREATE INDEX idx_notification_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_audit_entity_date ON audit_logs(entity_type, created_at);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Asset Summary View
CREATE VIEW asset_summary AS
SELECT 
  a.asset_id,
  a.asset_name,
  a.declared_value,
  a.insured_value,
  a.asset_status,
  c.consignment_id,
  s.shipment_id,
  s.status AS shipment_status,
  al.location_name AS current_location,
  al.updated_at AS last_location_update
FROM assets a
LEFT JOIN consignments c ON a.consignment_id = c.id
LEFT JOIN shipments s ON c.id = s.consignment_id
LEFT JOIN asset_locations al ON a.id = al.asset_id
WHERE al.id = (
  SELECT id FROM asset_locations 
  WHERE asset_id = a.id 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Shipment Status Summary View
CREATE VIEW shipment_summary AS
SELECT 
  s.shipment_id,
  s.status,
  COUNT(a.id) AS total_assets,
  SUM(a.insured_value) AS total_value,
  s.origin_location,
  s.destination_location,
  s.assigned_officer_name,
  s.estimated_arrival,
  s.created_at
FROM shipments s
LEFT JOIN consignments c ON s.consignment_id = c.id
LEFT JOIN assets a ON c.id = a.consignment_id
GROUP BY s.id, s.shipment_id, s.status, s.origin_location, 
         s.destination_location, s.assigned_officer_name, 
         s.estimated_arrival, s.created_at;

-- =====================================================
-- SAMPLE DATA (For Testing)
-- =====================================================

-- Insert sample user (Admin)
INSERT INTO users (user_id, username, email, password_hash, full_name, role, is_active)
VALUES ('ADM-001', 'admin', 'admin@kestrel.local', 'hash_here', 'System Admin', 'admin', TRUE);

-- Insert sample customer
INSERT INTO customers (customer_id, company_name, email, phone, account_status)
VALUES ('CUST-001', 'Global Trade Inc', 'contact@globaltrade.com', '+1-555-0123', 'ACTIVE');

-- Insert sample user (Officer)
INSERT INTO users (user_id, username, email, password_hash, full_name, role, department, is_active)
VALUES ('OFF-001', 'officer1', 'officer1@kestrel.local', 'hash_here', 'John Smith', 'officer', 'Logistics', TRUE);

-- =====================================================
-- END OF SCHEMA
-- =====================================================
