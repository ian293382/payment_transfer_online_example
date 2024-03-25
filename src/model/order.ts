import { Base } from "./base";

// 處理 enum
export enum PaymentProvider {
    ECPAY = 'ECPAY',
    PAYPAL = 'PAYPAL',
}

export enum PaymentWay {
    CVS = 'cvs',
    PAYPAL = 'PAYPAL',
}

export enum OrderStatus {
    PAYED = 'payed',
    CANCEL = 'cancel',
    FAILED = 'failed',
    PENDING = 'pending',
} 

export interface OrderContents {
    productId: number;
    amount: number;
    price: number;
}

// 先用介面將資料設定出來 改寫成 Ts 用的 enum 需要另外建立 引入
export interface Order {
    id: string; 
    total: number;
    created_at: Date;
    updated_at: Date;
    payment_provider: PaymentProvider;
    payment_pay: PaymentWay;
    status: OrderStatus;
    contents: OrderContents[];
}

export class OrderModel extends Base<Order> {

}