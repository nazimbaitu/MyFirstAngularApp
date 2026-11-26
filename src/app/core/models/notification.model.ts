export interface AppNotification {
  id: string;
  type: 'credit' | 'payment' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}
