import { DataService } from './services/data.service';
import { Transaction } from './models/transaction.model';
import { Payment } from './models/payment.model';
import { Employee } from './models/employee.model';
import { AppNotification } from './models/notification.model';

function daysAgo(days:number):string {
  const d=new Date(); d.setDate(d.getDate()-days); d.setHours(12,0,0,0); return d.toISOString();
}

export function initDemoData(data:DataService):void {
  const savedCustomers=data.getCustomers();
  if(savedCustomers.some(customer=>customer.id.startsWith('CUST-')))
    data.saveCustomers(savedCustomers.filter(customer=>!customer.id.startsWith('CUST-')));
  if(data.isInitialized()) return;
  const transactions:Transaction[]=[
    {id:'TXN-2001',reference:'SK-KH-001',customerId:'CUST-1001',dateTime:daysAgo(5),items:[{desc:'Rice (5kg)',qty:1,price:1500,total:1500},{desc:'Sugar (2kg)',qty:2,price:250,total:500}],total:2000,notes:'Monthly grocery',createdBy:'Ahmed Raza',status:'Completed',reversed:false},
    {id:'TXN-2002',reference:'SK-KH-002',customerId:'CUST-1002',dateTime:daysAgo(3),items:[{desc:'Cooking Oil (1L)',qty:2,price:650,total:1300},{desc:'Milk Pack',qty:4,price:120,total:480}],total:1780,createdBy:'Ahmed Raza',status:'Completed',reversed:false},
    {id:'TXN-2003',reference:'SK-KH-003',customerId:'CUST-1003',dateTime:daysAgo(1),items:[{desc:'Flour Bag (10kg)',qty:3,price:950,total:2850}],total:2850,notes:'Bulk order',createdBy:'Ahmed Raza',status:'Completed',reversed:false},
  ];
  const payments:Payment[]=[
    {id:'PAY-3001',reference:'SK-PY-001',customerId:'CUST-1001',amount:1000,dateTime:daysAgo(2),method:'Cash',notes:'Partial payment',createdBy:'Ahmed Raza',status:'Completed'},
    {id:'PAY-3002',reference:'SK-PY-002',customerId:'CUST-1003',amount:1500,dateTime:daysAgo(1),method:'EasyPaisa',refNumber:'EP-778899',createdBy:'Ahmed Raza',status:'Completed'},
  ];
  const employees:Employee[]=[
    {id:'EMP-4001',name:'Ahmed Raza',username:'admin',mobile:'0300-7654321',role:'Owner / Admin',status:'Active',createdDate:daysAgo(60)},
    {id:'EMP-4002',name:'Sara Khan',username:'sara.k',mobile:'0311-2223333',role:'Employee / Cashier',status:'Active',createdDate:daysAgo(25)},
    {id:'EMP-4003',name:'Hamza Ali',username:'hamza.a',mobile:'0312-4445555',role:'Employee / Cashier',status:'Inactive',createdDate:daysAgo(10)},
  ];
  const notifications:AppNotification[]=[
    {id:'N-1',type:'credit',title:'New Khata Entry',message:'Khata entry of PKR 2,000.00 recorded for Ali Hassan.',time:daysAgo(5),read:false},
    {id:'N-2',type:'payment',title:'Payment Received',message:'Payment of PKR 1,000.00 received from Ali Hassan.',time:daysAgo(2),read:false},
    {id:'N-3',type:'credit',title:'New Khata Entry',message:'Khata entry of PKR 2,850.00 recorded for Bilal Ahmed.',time:daysAgo(1),read:false},
    {id:'N-4',type:'payment',title:'Payment Received',message:'Payment of PKR 1,500.00 received from Bilal Ahmed.',time:daysAgo(1),read:false},
  ];
  data.saveSettings({shopName:'ShopKhata',ownerName:'Muhammad Aslam',logo:'',mobile:'0300-1234567',address:'Main Bazaar, Lahore, Pakistan',currency:'PKR',receiptFooter:'Thank you for your business!'});
  data.saveReceiptSettings({showMobile:true,showAddress:true,showFooter:true});
  data.saveProfile({name:'Ahmed Raza',username:'admin',role:'Owner / Admin',mobile:'0300-7654321'});
  data.saveTransactions(transactions); data.savePayments(payments); data.saveEmployees(employees); data.saveNotifications(notifications);
  data.markInitialized();
}
