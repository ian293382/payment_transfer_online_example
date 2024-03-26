import { Knex } from "knex";
import { Base, IBase } from "./base";

// 處理 enum
export enum PaymentProvider {
    ECPAY = 'ECPAY',
    PAYPAL = 'PAYPAL',
}

export enum PaymentPay {
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
// 記得這邊要用駝峰狀
export interface Order {
    id: string; 
    total: number;
    createdAt: Date;
    updatedAt: Date;
    paymentProvider: PaymentProvider;
    paymentPay: PaymentPay;
    status: OrderStatus;
    contents: OrderContents[];
}

// 建立抽象介面
export interface IOrderModel extends IBase<Order> {
// 沒有需要新增的功能
}

// 實現它
export class OrderModel extends Base<Order> implements IOrderModel{
    tableName = 'orders';
    // schema 要對應資料庫裡面的格式 title 例如 `id` 
    schema = {
        id: `id`,    
        total: `total`,
        created_at: `created_at`,
        updated_at: `updated_at`,
        payment_provider: `payment_provider`,
        payment_pay: `payment_pay`,
        status: `status`,
        contents: `contents`,
    };

    static createModel = ({
        knexSql,
        tableName,
    }: {
        knexSql: Knex;
        tableName?: string;
    }) => {
        return new OrderModel({
            knexSql,
            tableName,
        });
    }

    constructor({ knexSql,tableName,}: { knexSql: Knex; tableName?: string }) {
        super({ knexSql, tableName });
    }
}