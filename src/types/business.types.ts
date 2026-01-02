// Business setup types
export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  joinDate: string;
}

// Billing types
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  gstRate?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface BillData {
  cart: CartItem[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  paymentMethod: 'Cash' | 'UPI';
  billNumber: string;
  timestamp: string;
}

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  BusinessSetup1: undefined;
  BusinessSetupStep2: { businessData: any };
  BusinessSetupStep3: { businessData: any };
  CreatingBusiness: { businessData: any };
  SetupSuccess: undefined;
  SetupFailure: { error: string };
  ModeSelection: undefined;
  JoinBusiness: undefined;
  
  // Billing flow
  Billing: undefined;
  Checkout: { cart: CartItem[] };
  BillSuccess: BillData;
  
  // Admin flow
  AdminPin: undefined;
  AdminDashboard: undefined;
  ItemManagement: undefined;
  AddEditItem: { item?: MenuItem };
};