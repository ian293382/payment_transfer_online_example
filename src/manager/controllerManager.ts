import {ModelContext} from './modelManager';
import { ProductController, IProductController } from '@/controller/productController';

export interface ControllerContext {
    ProductController: IProductController;
}


export const controllerManager = ({
    modelCtx
    }: {
         modelCtx: ModelContext
    }) => {
    const productController = ProductController.createConstructor({
        productModel: modelCtx.productModel,
    });

    return {
         ProductController: productController,
    };

};