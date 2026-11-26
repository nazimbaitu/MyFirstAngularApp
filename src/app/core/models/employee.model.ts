export interface Employee {
  id: string;
  name: string;
  username: string;
  mobile?: string;
  role: 'Owner / Admin' | 'Employee / Cashier';
  status: 'Active' | 'Inactive';
  createdDate: string;
}
