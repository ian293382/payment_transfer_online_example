import { IOrderModel, OrderContent, OrderModel, OrderStatus, PaymentPay, PaymentProvider } from "@/model/order";
import { IProductModel } from "@/model/product";
import { NextFunction, Request, Response } from "express";
import { Knex } from "knex";
import { isEmpty, pick } from "lodash";
import { body, ValidationChain,validationResult } from "express-validator"
import { genUID, transactionHandler } from "@/utils";


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
    createOrderValidator(): ValidationChain[];
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

    // 做驗證 用套件 express validation
    public createOrderValidator = () => {
        // 第一條規則有沒有符合 以此類推 
        const paymentProviderValidator = (value : any) => {
            // 使用 . => 是否有函式在裡面 有的話 True 沒有 False
            return [PaymentProvider.ECPAY, PaymentProvider.Paypal].includes(value); 
        }
        
        const paymentPayValidator = (value : any) => {
            return [PaymentPay.CVS, PaymentPay.PAYPAL].includes(value); 
        }
        // 細項驗證
        const contentsValidator = (value :  OrderContent[]) => {
            // 第一個要有資料
            if (isEmpty(value)) false;

            // 查看內容 一開始改value OrderContent[]
            for (const product of value) {
                if (
                    [product.productId, product.amount, product.price].some(val => !val)
                )
                    return false;
            } 
            return true;
            // 設定 驗證不同參數的
        };
        return [
            // 設定不同參數的內容合不合法 body是從 express-validator 調用
            // contents 先通過 is array 內建的插件驗證 在設定 個別資料驗證錯誤
            body('paymentProvider', "Invalid payment provider").custom(
                paymentProviderValidator
            ),
            body('paymentPay', "Invalid payment pay").custom(
                paymentPayValidator
            ),
            body('contents', "Invalid product contents")
            .isArray()
            .custom(contentsValidator),
        ];
    };


    // 開一個Order api 接口
    public createOrder: IOrderController["createOrder"] = async (req,res,_next)  => {
        // 傳入的參數要有特性  { 商品名稱, 數量, 使用paymentProvider , paymentWay }
        // contents [ {id, amount, price, }, ... ] 補上格式 
        let { paymentProvider, paymentPay, contents } = req.body;
  
        // 1.資料驗證
        // https://express-validator.github.io/docs/guides/getting-started
        // validationResult 才能達到驗證後效果
     
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // 2.資料處理 將資料傳入database translation資料庫交易
        // 先做try catch
        try {
            // transaction  transactionHandler會把 knex 放入 驗證 產生instance
            //  傳到 callback func 給其他task使用 到 execTransaction 確定沒問題了  trx.commit 寫入資料庫 回傳commit的值 show出來
            await transactionHandler(this.knexSql, async (trx: Knex.Transaction) => {
                // 要將content 裡面的 product 拆包 拆出來 
                const result =await Promise.all(
                    contents.map(
                        async (product) =>
                    await this.productModel.preSell(
                        {
                            id: product.productId,
                            ...pick(product,["price", "amount"]),
                        },
                        trx
                        )
                    )
                );
                
                if (result.some((result) => !result)) 
                    throw new Error("Cannot buy , because out of stuff.");  
                const totalPrice = contents.reduce(
                    (acc, product) => acc + product.price * product.amount,
                     0  
                );
                // 創建的UUID 需要亂碼 創建 uuid
                const uid = genUID()
                await this.orderModel.create({
                    id: uid,
                    total: totalPrice,
                    created_at: new Date(),
                    updated_at: new Date(), 
                    payment_provider: paymentProvider,
                    payment_pay: paymentPay,
                    status: OrderStatus.WAITING,
                    contents, 
                }, trx);

                res.json({ status: "success"});
            })
        } catch (err) {
            res.status(500).json({ errors: err})
            throw err;
        }
     
        res.json({ status: 'success' });
    }
}
