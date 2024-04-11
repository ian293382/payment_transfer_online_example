import { IOrderModel, OrderContent, OrderModel, PaymentPay, PaymentProvider } from "@/model/order";
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
    updateOrder(
        req: Request<any, any, any, any>,
        res: Response,
        next: NextFunction): void;
}

// 實作功能 implements
export class OrderController implements IOrderController {
    //  第一步 需要transaction 的功能 這功能是由 app來 所以設定接口  先設參數在設定裡面的建構函數 下方建立constructor
    knexSql: Knex<any, any[]>;
    orderModel: IOrderModel;
    productModel: IProductModel;

    // 第二步 使用static 回傳 createController = () =>
    public static createController({
        knexSql,
        productModel,
        orderModel,
     }: {
        knexSql: Knex;
        orderModel: IOrderModel;
        productModel: IProductModel;
    }) {
        // 環傳新方法所以參數一樣   knexSql,productModel,orderModel
        return new OrderController({ knexSql,productModel,orderModel });
    }


    constructor({
        knexSql,
        productModel,
        orderModel,
    }: {
        knexSql: Knex;
        orderModel: IOrderModel;
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
         console.log(paymentProvider,PaymentPay,contents);
        // contents [ {id, amount, price, }, ... ] 補上格式

    }
}
