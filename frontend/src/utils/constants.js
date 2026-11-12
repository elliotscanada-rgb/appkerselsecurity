// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// User Roles
export const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin',
  STAFF: 'staff',
};

// Staff Departments
export const STAFF_DEPARTMENTS = {
  RECEIVING: 'receiving',
  CUSTODY: 'custody',
  LOGISTICS: 'logistics',
  VALUATION: 'valuation',
  DISPATCH: 'dispatch',
};

// Consignment Statuses - 13 Status Tracking System
export const CONSIGNMENT_STATUS = {
  PENDING: 'pending',
  RECEIVED: 'received',
  UNDER_VERIFICATION: 'under_verification',
  VERIFICATION_PASSED: 'verification_passed',
  VERIFICATION_FAILED: 'verification_failed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  IN_SECURE_STORAGE: 'in_secure_storage',
  ON_HOLD: 'on_hold',
  WITHDRAWAL_REQUESTED: 'withdrawal_requested',
  RELEASED: 'released',
  IN_TRANSIT: 'in_transit',
  COMPLETED: 'completed',
};

// Delivery Method Statuses - Post-Clearance Flow
export const DELIVERY_METHOD = {
  PENDING_CHOICE: 'pending_delivery_choice',
  COLLECTION_SCHEDULED: 'collection_scheduled',
  READY_FOR_COLLECTION: 'ready_for_collection',
  COLLECTED: 'collected',
  SHIPPING_SCHEDULED: 'shipping_scheduled',
  READY_FOR_SHIPMENT: 'ready_for_shipment',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
};

// Status Display Names
export const STATUS_LABELS = {
  pending: 'Pending',
  received: 'Received',
  under_verification: 'Under Verification',
  verification_passed: 'Verification Passed',
  verification_failed: 'Verification Failed',
  approved: 'Approved ✓',
  rejected: 'Rejected',
  in_secure_storage: 'In Secure Storage',
  on_hold: 'On Hold',
  withdrawal_requested: 'Withdrawal Requested',
  released: 'Released',
  in_transit: 'In Transit',
  completed: 'Completed',
  pending_delivery_choice: 'Awaiting Delivery Choice',
  collection_scheduled: 'Collection Scheduled',
  ready_for_collection: 'Ready for Collection',
  collected: 'Collected',
  shipping_scheduled: 'Shipping Scheduled',
  ready_for_shipment: 'Ready for Shipment',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

// Status Colors - Based on Royal Mint tracking system
export const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-700',
  received: 'bg-blue-100 text-blue-700',
  under_verification: 'bg-yellow-100 text-yellow-700',
  verification_passed: 'bg-green-100 text-green-700',
  verification_failed: 'bg-red-100 text-red-700',
  approved: 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500',
  rejected: 'bg-red-100 text-red-800',
  in_secure_storage: 'bg-indigo-100 text-indigo-700',
  on_hold: 'bg-orange-100 text-orange-700',
  withdrawal_requested: 'bg-purple-100 text-purple-700',
  released: 'bg-teal-100 text-teal-700',
  in_transit: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-800',
  pending_delivery_choice: 'bg-blue-100 text-blue-700 border-2 border-blue-500',
  collection_scheduled: 'bg-purple-100 text-purple-700',
  ready_for_collection: 'bg-purple-200 text-purple-800',
  collected: 'bg-green-100 text-green-700',
  shipping_scheduled: 'bg-orange-100 text-orange-700',
  ready_for_shipment: 'bg-orange-200 text-orange-800',
  shipped: 'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-800',
};

// Status Descriptions for tracking timeline
export const STATUS_DESCRIPTIONS = {
  pending: 'Consignment request submitted, awaiting initial processing',
  received: 'Physical items received and logged into system',
  under_verification: 'Items being authenticated and verified by specialists',
  verification_passed: 'Authentication successful, items are genuine',
  verification_failed: 'Authentication revealed discrepancies or issues',
  approved: 'Consignment approved for secure storage',
  rejected: 'Consignment rejected, awaiting return arrangements',
  in_secure_storage: 'Items securely stored in vault facility',
  on_hold: 'Temporary hold placed on consignment',
  withdrawal_requested: 'Client requested withdrawal from storage',
  released: 'Items released from secure storage',
  in_transit: 'Items currently being transported',
  completed: 'Consignment process completed successfully',
  pending_delivery_choice: 'Client needs to choose collection or shipping method',
  collection_scheduled: 'Collection appointment has been scheduled',
  ready_for_collection: 'Items prepared and ready for client pickup',
  collected: 'Items successfully collected by client',
  shipping_scheduled: 'Shipping delivery has been scheduled',
  ready_for_shipment: 'Items prepared and ready to ship',
  shipped: 'Items in transit to client',
  delivered: 'Items delivered successfully to client',
};

// Valuables Categories
export const ITEM_CATEGORIES = {
  GOLD_BARS: 'gold_bars',
  GOLD_JEWELLERY: 'gold_jewellery',
  PRECIOUS_METALS: 'precious_metals',
  DIAMONDS: 'diamonds',
  OTHER: 'other',
};

// Category Display Names
export const CATEGORY_LABELS = {
  gold_bars: 'Gold Bars',
  gold_jewellery: 'Gold Jewellery',
  precious_metals: 'Precious Metals',
  diamonds: 'Diamonds & Gemstones',
  other: 'Other Valuables',
};

// Shipment Statuses
export const SHIPMENT_STATUS = {
  PREPARING: 'preparing',
  DISPATCHED: 'dispatched',
  TRANSIT: 'transit',
  ARRIVED: 'arrived',
  DELIVERED: 'delivered',
};

// Document Types
export const DOCUMENT_TYPES = {
  RECEIPT: 'receipt',
  VALUATION_CERTIFICATE: 'valuation_certificate',
  AGREEMENT: 'agreement',
  DELIVERY_CONFIRMATION: 'delivery_confirmation',
  OTHER: 'other',
};

// Document Type Labels
export const DOCUMENT_TYPE_LABELS = {
  receipt: 'Consignment Receipt',
  valuation_certificate: 'Valuation Certificate',
  agreement: 'Consignment Agreement',
  delivery_confirmation: 'Delivery Confirmation',
  other: 'Other Document',
};

// Currencies
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'KES'];
export const DEFAULT_CURRENCY = 'USD';

// Weight Units
export const WEIGHT_UNITS = ['kg', 'g', 'oz', 't'];

// Notification Types
export const NOTIFICATION_TYPES = {
  CONSIGNMENT: 'consignment',
  SHIPMENT: 'shipment',
  SYSTEM: 'system',
  APPROVAL: 'approval',
};

// Service Charge Types
export const CHARGE_TYPES = {
  STORAGE: 'storage',
  TRANSPORTATION: 'transportation',
  HANDLING: 'handling',
  INSURANCE: 'insurance',
  OTHER: 'other',
};

// Charge Type Labels
export const CHARGE_TYPE_LABELS = {
  storage: 'Storage Fee',
  transportation: 'Transportation Fee',
  handling: 'Handling Fee',
  insurance: 'Insurance Fee',
  other: 'Other Charges',
};

// Approval Statuses
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Pagination
export const ITEMS_PER_PAGE = 10;
