import { IProductModel, ProductModel } from "@/model/product";
import knex, { Knex } from "knex";
export interface ModelContext{
    productModel: IProductModel;
}

export const modelManager = ({ knexSql }: { knexSql: Knex}): ModelContext => {
    const productModel = ProductModel.createModel({ knexSql, tableName: 'products' });

    return {
        productModel,
    };
} 