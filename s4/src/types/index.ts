// ==========================================
// 1. CUSTOMER (Khách hàng)
// ==========================================
export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  nationalId?: string; // CCCD
  notes?: string;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. VEHICLE (Xe khách hàng)
// ==========================================
export interface Vehicle {
  id: string;
  customerId: string;
  licensePlate: string; // VD: 51A-123.45
  vinNumber: string;
  brand: string; // Toyota, Honda, Ford, Mazda, Hyundai, Mercedes-Benz, Kia...
  model: string; // Camry, CR-V, Ranger, CX-5, Tucson, C200, Seltos...
  manufactureYear: number;
  engineCode?: string;
  color: string;
  currentOdoKm: number;
  lastServiceDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. TECHNICIAN (Kỹ thuật viên / Thợ xưởng)
// ==========================================
export type TechnicianSpecialty = 
  | 'engine_transmission'   // Máy - Gầm
  | 'electrical_ac'          // Điện - Điện lạnh
  | 'undercarriage'          // Khung gầm - Phanh
  | 'body_paint'             // Sơn - Gò - Hàn
  | 'general_maintenance';   // Bảo dưỡng nhanh

export type TechnicianStatus = 'available' | 'busy' | 'leave';

export interface Technician {
  id: string;
  code: string; // KTV-001
  fullName: string;
  phoneNumber: string;
  specialty: TechnicianSpecialty;
  status: TechnicianStatus;
  avatarUrl?: string;
}

// ==========================================
// 4. INVENTORY ITEM (Kho phụ tùng & vật tư)
// ==========================================
export type InventoryCategory = 
  | 'lubricants'      // Dầu nhớt & Dung dịch
  | 'brake_system'    // Hệ thống phanh
  | 'filtration'      // Bộ lọc (Gió, Dầu, Xăng)
  | 'suspension'      // Giảm xóc & Khung gầm
  | 'electrical'      // Điện & Đánh lửa
  | 'tires'           // Lốp & Vành
  | 'consumables'     // Vật tư tiêu hao (Ga lạnh, Nước rửa kính...)
  | 'accessories';    // Phụ kiện & Tiện ích (Gạt mưa, Thảm sàn...)

export interface InventoryItem {
  id: string;
  sku: string; // Mã phụ tùng (vd: OIL-MOBIL-5W30)
  name: string;
  category: InventoryCategory;
  unit: string; // Chai, Cái, Bộ, Lít, Bình...
  costPrice: number; // Giá vốn nhập
  retailPrice: number; // Giá bán lẻ cho khách
  quantityInStock: number; // Tồn kho thực tế
  minStockThreshold: number; // Ngưỡng cảnh báo sắp hết
  shelfLocation: string; // Kệ A-01, Kho B...
  supplier?: string; // Nhà cung cấp (Castrol VN, Denso, Bosch...)
  compatibleModels: string[]; // Các dòng xe tương thích
  updatedAt: string;
}

// ==========================================
// 5. WORK ORDER (Phiếu sửa chữa & Dịch vụ)
// ==========================================
export type WorkOrderStatus = 
  | 'pending'         // Chờ tiếp nhận / Báo giá
  | 'in_progress'     // Đang thực hiện sửa chữa
  | 'waiting_parts'   // Chờ phụ tùng về
  | 'completed'       // Hoàn tất sửa chữa & KCS
  | 'cancelled';      // Hủy dịch vụ

export interface WorkOrderServiceItem {
  id: string;
  name: string;
  technicianId?: string;
  laborFee: number; // Tiền công
  notes?: string;
}

export interface WorkOrderPartItem {
  id: string;
  inventoryItemId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface WorkOrder {
  id: string;
  code: string; // WO-202410-001
  customerId: string;
  vehicleId: string;
  odoAtReception: number;
  gasLevel: 'empty' | 'quarter' | 'half' | 'three_quarters' | 'full';
  customerRequest: string; // Triệu chứng/Yêu cầu khách
  technicianDiagnosis?: string; // Kết quả chẩn đoán kỹ thuật
  status: WorkOrderStatus;
  services: WorkOrderServiceItem[];
  parts: WorkOrderPartItem[];
  leadTechnicianId?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  laborTotal: number;
  partsTotal: number;
  discountTotal: number;
  taxRate: number; // % VAT (vd: 8 hoặc 10)
  taxAmount: number;
  grandTotal: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 6. INVOICE (Hóa đơn thanh toán)
// ==========================================
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card';

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-2024-001
  workOrderId: string;
  customerId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  issuedAt: string;
  paidAt?: string;
  note?: string;
}

// ==========================================
// 7. GARAGE PROFILE (Cấu hình gara)
// ==========================================
export interface GarageProfile {
  name: string;
  phone: string;
  hotline: string;
  address: string;
  taxId: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}
