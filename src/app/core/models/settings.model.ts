export interface ShopSettings {
  shopName: string;
  ownerName: string;
  logo: string;
  mobile: string;
  address: string;
  currency: string;
  receiptFooter: string;
}
export interface ReceiptSettings {
  showMobile: boolean;
  showAddress: boolean;
  showFooter: boolean;
}
export interface UserProfile {
  name: string;
  username: string;
  role: string;
  mobile: string;
}
