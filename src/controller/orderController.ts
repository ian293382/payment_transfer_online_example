import { OrderContent, OrderModel, PaymentPay, PaymentProvider } from "@/model/order";
import { IProductModel } from "@/model/product";
import { NextFunction, Request, Response } from "express";
import { Knex } from "knex";

interface CreateOrderRequestParams {
    paymentProvider: PaymentProvider;
    paymentPay: PaymentPay;
    contents: OrderContent[];
    // clientRedirect: string;
}

// 實作createOrder功能 他是由路由去傳進去的req , res ,next 去觸發 且由 render redirect...等等傳輸方式傳回去 
// 所以在上面IOrder 不用回傳值 void
// 實作 updateOrder功能 
export interface IOrderController {
    createOrder(
        req: Request<any, any, CreateOrderRequestParams, any>,
        res: Response,
        next: NextFunction): void;
    updateOrder(req: Request<any, any, any, any>, res: Response, next: NextFunction): void;
}

// 實作功能 implements
export class OrderController implements IOrderController {
    knexSql: Knex<any, any[]>;
    orderModel: OrderModel;
    productModel: IProductModel;
    
    // 需要transaction 的功能 這功能是由 app來 所以設定街口
    constructor({
        knexSql,
        productModel,
        orderModel,
    }: {
        knexSql: Knex;
        orderModel: OrderModel;
        productModel: IProductModel;
    }) {
        this.knexSql = knexSql;
        this.orderModel = orderModel;
        this.productModel = productModel;
    }
    updateOrder(req: Request<any, any, any, any, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction): void {
        throw new Error("Method not implemented.");
    }
    // 開一個Order api 接口
    public createOrder: IOrderController["createOrder"] = (req,res,_next)  => {
        // 傳入的參數要有特性  { 商品名稱, 數量, 使用paymentProvider , paymentWay }
        let { paymentProvider, PaymentPay, contents } = req.body;
        req.body.
        // contents [ {id, amount, price, }, ... ] 補上格式

    }
}
