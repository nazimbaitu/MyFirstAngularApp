export interface KhataItem {
  desc: string;
  qty: number;
  price: number;
  total: number;
}
export interface Transaction {
  id: string;
  reference: string;
  customerId: string;
  dateTime: string;
  items: KhataItem[];
  total: number;
  notes?: string;
  createdBy: string;
  status: 'Completed' | 'Cancelled';
  reversed: boolean;
}
