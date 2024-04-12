import { isJson } from "@/utils";
import { Knex } from "knex";
import { camelCase, isEmpty, mapKeys, mapValues, snakeCase } from "lodash";

// T 在這個階段，先不要給他真正的類別; 而是等檔其他繼承他的Class 要用到的時候再傳入型別;
// database transaction (trx任意縮寫 Knex.Transaction) 資料庫交易 => 保證多表格的欄位變動可以一起完成 或失敗
// select 找一筆定癲 , update 將錢轉出, create 創建 Log , select 找出更新訂單, ...
// read 分為 find all , find one
export interface IBase<T> {
    findAll(trx?: Knex.Transaction): Promise<T[] | null>;
    findOne(id: any, trx?: Knex.Transaction): Promise<T | null>;
    create(data: Omit<T, 'id'>, trx? : Knex.Transaction): Promise<T   | null>;
    update(id: any, data: Partial<Omit <T, 'id'>>, trx?: Knex.Transaction): Promise<T | null>;
    delete(id: any, trx? : Knex.Transaction): Promise<void>;
}

// 這個base 是不能夠被instance出來的而是等到調用後 所以給他abstract的類別;
export abstract class Base<T> implements IBase<T> {
    protected knexSql: Knex;
    protected tableName: string = '';
    protected schema = {};
    // 要讓app傳入這裡 一個 Knex.js SQl查詢器 一個TableName
    constructor( {knexSql, tableName }: { knexSql: Knex, tableName?: string} ) {
        this.knexSql = knexSql;
        if (tableName) this.tableName = tableName;
    }

    // 實作功能
    public findAll = async (trx?: Knex.Transaction) => {
        // select col1,col2,..... from tableName
        let sqlBuilder = this.knexSql(this.tableName).select(this.schema);

        if (trx)  sqlBuilder = sqlBuilder.transacting(trx);

        const result = await sqlBuilder;

        if (isEmpty(result)) return null; 
        
        return result.map(this.DBData2DataObject) as T[];
    }
    public findOne = async (id: any, trx?: Knex.Transaction) => {
        let sqlBuilder = this.knexSql(this.tableName)
        .select(this.schema)
        .where({ id });

        if (trx)  sqlBuilder = sqlBuilder.transacting(trx);
        const result = await sqlBuilder;
        if (isEmpty(result)) return null; 

        return this.DBData2DataObject(result[0]) as T;
    }
    public create = async (data: Omit<T, 'id'>, trx? : Knex.Transaction) => {
        // 注意data 是 object => DB data 轉成可以寫入DB格式
        let sqlBuilder = this.knexSql(this.tableName).insert(
            this.DataObject2DBData(data)
            );
             
        // console.log(data) 到這邊都沒問題
        if (trx)  sqlBuilder = sqlBuilder.transacting(trx);

        const result = await sqlBuilder;
     

        if (isEmpty(result)) return null; 
        const id = result[0]; // 我們設計的id 就是第一格

        return await this.findOne(id, trx);
    }
    public update = async  (id: any, data: Partial<Omit <T, 'id'>>, trx?: Knex.Transaction) => {
        let sqlBuilder = this.knexSql(this.tableName).update(this.DataObject2DBData(data)).where({id});
        if (trx)  sqlBuilder = sqlBuilder.transacting(trx);
        await sqlBuilder; // 會顯示成功幾筆資料
        return await this.findOne(id, trx);
    }
    public delete = async (id: any, trx?: Knex.Transaction) => {
        let sqlBuilder = this.knexSql(this.tableName).where({ id }).del();
        if (trx)  sqlBuilder = sqlBuilder.transacting(trx);
        await sqlBuilder; // 會顯示成功幾筆資料
        return; // delete  => return null 表示刪除成功 
    };
    

    private DBData2DataObject = (data: any) => {
        // 轉成  updatedAT createdAT camelCase
        const  transform =  mapValues(data, (value, key) => {
            if (['updatedAT', 'createdAT'].includes(key)) return new Date(value);

            if (isJson(value)) return JSON.parse(value);

            return value
        });

        return mapKeys(transform, (value, key) => camelCase(key));
    }
    private DataObject2DBData = (data: any) => {
        const transform = mapValues(data, (value, key) => {
            if (['updatedAt', 'createdAt'].includes(key)) {
                return value.toISOString();
            }
            // check if a string is json
            if (value !== null && typeof value === 'object') {
                return JSON.stringify(value);
            }
            return value;
        }); 
        // 反轉成 updated_at created_at snakeCase 
        return mapKeys(transform, (value, key) => snakeCase(key));
    }
}
