import { IOrderModel, OrderModel } from "@/model/order";
import { IProductModel, ProductModel } from "@/model/product";
import knex, { Knex } from "knex";
export interface ModelContext{
    productModel: IProductModel;
    orderModel: IOrderModel;
}

export const modelManager = ({ knexSql }: { knexSql: Knex}): ModelContext => {
    const productModel = ProductModel.createModel({ knexSql, tableName: 'products' });
    const orderModel = OrderModel.createModel({ knexSql, tableName: 'orders' });

    return {
        productModel,
        orderModel,
    };
} 