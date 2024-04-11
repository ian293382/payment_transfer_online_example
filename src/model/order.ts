import { Knex } from "knex";
import { Base, IBase } from "./base";

export enum PaymentProvider {
    Paypal = 'Paypal',
    ECPAY = 'ECPAY',
}

export enum PaymentPay {
    CVS = "CVS",
    PAYPAL = "PAYPAL",
}

export enum OrderStatus {
    WAITING = "WAITING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    CANCEL = "CANCEL",

}
export interface OrderContent {
    productId: number;
    amount: number;
    price: number;
}

export interface Order {
    id: string;
    total: number;
    created_at: Date;
    updated_at: Date;
    // enum 是要額外建立的方法去儲存
    payment_provider:  PaymentProvider;
    payment_pay: PaymentPay;
    status:  OrderStatus;
    contents: OrderContent[];
}


// 補實作 IOrderModel
export interface IOrderModel extends IBase<Order>{
    // 目前沒有新功能 就保持空值
}

// 上述定義 下面要實作他的方法 
export class OrderModel extends Base<Order>  implements IOrderModel{
    tableName = 'orders';
    // 要把功能寫出來時 記得js裡面是 駝峰裝的key值 ，資料庫判別適用底線命名的 左邊 js = database
    protected schema = {
        id: `id`,
        total: `total`,
        createdAt: `created_at`,
        updatedAt: `updated_at`,
        paymentProvider:  `payment_provider`,
        paymentPay: `Payment_pay`,
        status:  `status`,
        contents: `contents`,       
    };

    static createModel = ({ 
        knexSql,
        tableName,
    }: { 
        knexSql: Knex;
        tableName?: string; 
    }) => {
        return new OrderModel({  knexSql, tableName });
    };

    // 整理成讓knex 資料可以傳入 tableName? 可能是空的值 
    constructor({ knexSql, tableName }: { knexSql: Knex, tableName?: string }) {
        super({ knexSql, tableName });
    }
}