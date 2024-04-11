### Database 規劃
#### 產品表
- id 流水號 唯一代替產品名稱的辨識碼
- name varchar(255) not null
- amount integer unsigned == 100
- description text 產品描述
- pre_order 作為金流交易賣出物品時的預扣額度

#### 訂單表
- id varchar(255) not null primary key COMMENT, '金流API  ID 要求一大串亂數的字串'
- total int unsigned not null default 0,
- created_at timestamp not null default now(),
- updated_at timestamp not null default now(),
- payment_provider_id enum("ECPAY", "PAYPAL"),
- payment_pay enum("CSV", "CC", "ATM", "PAYPAL" ),
- status enum ("WAITING", "SUCCESS", "FAILED", "CANCEL")
- contents JSON default null COMMENT, "商品內容 [ {product_id, amount, price} ]"

---

#### 訂單開立流程
1. 前端資料驗證
2. 將商品寫入
3. 利用ID 去打第三方金流的 API 產生第三方金流的訂單
4. 當使用者繳完錢之後第三方金流他會打我們提供的 update 資訊的 API
