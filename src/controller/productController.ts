import { IProductModel } from "@/model/product";
import { NextFunction, Request, Response } from "express";

interface ProductControllerProp {
    productModel: IProductModel;
}

// 根據router 去貼過來改成 req <any any any any >, res...
export interface IProductController {
    findAll(
        req: Request<any, any, any, any>,
        res: Response,
        next: NextFunction
    ): void;
}


export class ProductController implements IProductController{
    private productModel: IProductModel;

    public static createConstructor = ({ productModel }: ProductControllerProp) => {
        return new ProductController({ productModel });
    }

    constructor( { productModel }: { productModel: IProductModel } ) {
        this.productModel = productModel;
    }

    findAll: IProductController["findAll"] = async (_req, res, _next) => {
        const result = await this.productModel.findAll()

        res.json(result);
    };
}
