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
}