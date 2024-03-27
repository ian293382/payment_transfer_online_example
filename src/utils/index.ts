import knex, { Knex } from "knex";

// 設計資料庫個離等級
enum ISOLATION_LEVEL {
    READ_UNCOMMITTED = "READ_UNCOMMITTED",
    READ_COMMITTED = "READ_COMMITTED",
    REPEATABLE_READ = "REPEATABLE_READ",
    SERIALIZABLE = "SERIALIZABLE",
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
};

// 泛行結構 <T> 要使用在定義
// 交易上全都要包上 transaction callback function 
export const transactionHandler = async <T = any > (                        
    knex: Knex,
    callback: (trx: Knex.Transaction) => Promise<T>,
    // 設定不同隔離類型 Mysql 預設三等
    // level 3 = repeatable commit read 有資料類型傳入commit 會讀得到
    // 有需要提升到最高級 level 4 serializable 序列化資料 資料處於最佳隔離,不能夠全部併發
    // 也就是要一個一個transaction 才能完成一個交易
    options: { 
        // 隔離太高級會需要重複try
        retryTimes?: number,
        maxBackOff?: number,
        isolation? : ISOLATION_LEVEL;
    } = {}
) => {
    const{ retryTimes = 100, maxBackOff = 1000, isolation } = options;
    let attempts = 0;
    
    const execTransaction = async (): Promise<T> => {
        const trx = await knex.transaction();

        try {
            if (isolation)
             await (trx) .raw(`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`)
                
            const result = await callback(trx);
        // 確認隔離等級 callback 沒問題之後 交出去
          await trx.commit()

          return result;
        } catch (err: any) {
            await trx.rollback();
            // 判別是否為最高級引發錯誤 多併發失敗 要去 mysql查詢的 
            // 1205 是因為重複讀取導致 timeout
            if (err.code !== '1205') throw  err;

            if (attempts > retryTimes) throw err;
                throw Error('Transaction retry times is up to max.');

            attempts++;
            await sleep(maxBackOff)

            return execTransaction(); 
        }
    };  
};

function sleep(maxBackOff: number) {
    // 新增一個休息時間 bsckoff time
    return new Promise((resolve) => setTimeout(resolve, maxBackOff)); 
}
