export interface Payment {
  id: string;
  reference: string;
  customerId: string;
  amount: number;
  dateTime: string;
  method: string;
  refNumber?: string;
  notes?: string;
  createdBy: string;
  status: 'Completed';
}
