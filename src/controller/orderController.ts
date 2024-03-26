

// 在 介面上實作功能後調用 創建訂單 付款後更新訂單
import { IOrderModel, OrderContents, PaymentPay, PaymentProvider } from "@/model/order";
import { IProductModel } from "@/model/product";
import { NextFunction, Request, Response } from "express";
import { Knex } from "knex";

interface CreateOrderRequestParams {
    paymentProvider: PaymentProvider;
    paymentPay: PaymentPay;
    contents: OrderContents[];
    // clientId: number; ...略
}

// 一樣 因為是根據路由訂單 從 router 去看 req摻數貼上 把數值都改成any 稍後調整我們所需求的 params
// void 是因為這些函數會強制回傳 ( render response json ) 我們不需要 他回傳任何值 ( 抽象 )
export interface IOrderController {
    createOrder(
        req: Request<any, any, CreateOrderRequestParams, any>,
        res: Response,
        next: NextFunction,
    ): void;
    updateAmount(
        req: Request<any, any, any, any>,
        res: Response,
        next: NextFunction,
    ): void;
};

// 要從抽象實現它 constructor
// 1. 需要 transactions 功能要從app 當中來所以要給接口
export class OrderController implements IOrderController {
    knexSql: Knex;
    orderModel: IOrderModel;
    productModel: IProductModel;

    public static createController = ({
        knexSql,
        orderModel,
        productModel
     }: {
        knexSql: Knex,
        orderModel: IOrderModel,
        productModel: IProductModel;
    }) => {
        return new OrderController({
            knexSql,
            orderModel,
            productModel,
        });
    }
    constructor({ knexSql, orderModel, productModel}: {
        knexSql: Knex,
        orderModel: IOrderModel,
        productModel: IProductModel
    }) {
        this.knexSql = knexSql;
        this. orderModel = orderModel;
        this.productModel = productModel
    }
    // 實現功能 沒用到next 故意先加一個底線
    public createOrder: IOrderController["createOrder"] = (req, res, _next) => {
        // 倉品id, 商品名稱, 商品數量 => contents === [ ] post, payment_provider, payment_pay 
        let { paymentProvider,paymentPay, contents } = req.body;

        console.log(
            paymentProvider,
            paymentPay,
            contents);
        res.json({ status: 'success' });

        // 資料驗證 
        // 驗證格式
        // 2, 寫入database
        // 3. 金流api
        
    };

    public updateAmount: IOrderController["updateAmount"] = (req, res, next) => {
        // TODO: Implement your updateAmount logic here
    
        // For example:
        res.send('Update amount endpoint');
    };

}