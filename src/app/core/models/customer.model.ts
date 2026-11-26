export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address?: string;
  openingBalance: number;
  notes?: string;
  createdDate: string;
  status: 'Active' | 'Inactive';
}
