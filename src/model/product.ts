import { Knex } from "knex";
import { IBase, Base } from "./base";

// 轉成 nodejs 寫法 不是 Mysql
export interface Product {
id: number;
name: string;
amount: number;
description: string;
pre_order: number;
price: number;
}

export interface IProductModel extends IBase<Product> {
    // 新增方法 根據 Create order 只拿所需的欄位
    preSell(product: Pick<Product, 'id' | 'amount' | 'price'>, trx: Knex.Transaction): Promise<Boolean>;
}

export class ProductModel extends  Base<Product>  implements IProductModel{
    tableName = 'products';
    
    // schema 記得要改成 camelCase key -> dataObject, value -> db
    schema= {
        id: `id`,
        name: `name`,
        amount: `amount`,
        description: `description`,
        preOrder: `pre_order`,
        price: `price`,
    };

    constructor( {knexSql, tableName }: { knexSql: Knex, tableName?: string} ) {
        super({ knexSql, tableName });
    } 

    static createModel = ( {knexSql, tableName }: { knexSql: Knex, tableName?: string} ) => {
        return new ProductModel({ knexSql, tableName });
    }
    
    // 因為上面新增preSell 這邊也就要有實作流程
    public preSell= async (product: Pick<Product, 'id' | 'amount' | 'price'>, trx?: Knex.Transaction) => {
        let queryBuilder = this.knexSql(this.tableName)
            .where({id: product.id})
            .where(this.schema.amount, ">=", product.amount)
            .update(
                this.schema.preOrder,
                this.knexSql.raw(`??+ ?`, [this.schema.preOrder, product.amount])
            );

            if (trx) queryBuilder = queryBuilder.transacting(trx);

            const result = await queryBuilder;
                // 回傳布林值
            return !!result;
    };
}