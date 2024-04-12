import knex, { Knex } from "knex";
import { v4 as uuid } from "uuid";

enum ISOLATION_LEVEL {
    READ_UNCOMMITTED = 'read-uncommitted',
    READ_COMMITTED = 'read-committed',
    REPEATABLE_READ ='repeatable-read',
    SERIALIZABLE ='serializable'
}

export const createDatabase = () => {
    return knex({
            client: 'mysql',
            version: '5.7',
            connection: {
              host: process.env.DATABASE_HOST || '127.0.0.1',
              port: Number(process.env.DATABASE_PORT) || 3306,
              user: process.env.DATABASE_USER || 'root',
              password: process.env.DATABASE_PASSWORD || '',
              database: process.env.DATABASE_DATABASE || 'node_js_3rd_pay',
            },
            pool: {min: 2, max: 10},
    })
}

export  const isJson = (value: string) => {
    try { 
        return Boolean(JSON.parse(value));
    }catch (e) {
        return false;
    }
}

// 1只要用到資料庫的東西 transactions 就會碰到knex => 跑到資料庫 async 
// 2 全包上資料後再丟入knex所以用Callback func  記得是泛型 <T>  template
export const transactionHandler = async <T = any> (
    knex: Knex,
    callback: (trx: Knex.Transaction) => Promise<T>,
    // option用來  設定不同隔離類型 Mysql 預設三等 可以作為範本使用 隔離層級
    // level 3 = repeatable commit read 有資料類型傳入commit 會讀得到
    // 有需要提升到最高級 level 4 serializable 序列化資料 資料處於最佳隔離,不能夠全部併發
    // 也就是要一個一個transaction 才能完成一個交易 
    // https://ambersun1234.github.io/database/database-transaction/
    options: { 
        // 隔離太高級會需要重複try
        retryTimes?: number,
        maxBackOff?: number,
        isolation? : ISOLATION_LEVEL;
    } = {}
) => {
    // 
    const { retryTimes= 100, maxBackOff = 1000, isolation } = options
    let attempts = 0;

    // 啟動transaction 
    const execTransaction = async (): Promise<T> => {
        const trx = await knex.transaction();

        try {
            if (isolation)
             await trx.raw(`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`);
        
            const result = await callback(trx);
            await trx.commit();
            return result;
         } catch(err: any) {
            await trx.rollback();

            // 卻認識不是 隔離等級太高導致的 retry ERR_LOCK_WAIT_TIMEOUT
            // mysql是1205編碼 => 要去查詢
            if (err.code ==='1205') throw err;

            if (attempts > retryTimes) 
                throw Error(" [Transaction] retry times is up to max " )
            attempts ++;
            
            await sleep(maxBackOff) 

            return execTransaction();
         }
    };

    // 記得補上執行這個task 他經過knex 要上await
    return await execTransaction(); 
}

// 新增sleep 函式
function sleep(maxBackOff: number) {
    return new Promise((resolve) => setTimeout(resolve, maxBackOff));
}

// gen uuid 實作過程
export const genUID = () => {
    // timestamp 13 位數 ＋ 7 gen uuid 
    // 123456789 => 1a3b....
    const alpha = "abcdefghij";

    const timestampStr = new Date().getTime().toString();
    
    const code = timestampStr.split("") // ["1","2","3"...]
        .map((v, index) => index % 2 ? v : alpha[Number(v)]) // ['1','b','3','d',...]
        .join("")


    const id = uuid().split("-")[0];

    return `${code}${id.substring(0, id.length - 1)}`;
}
