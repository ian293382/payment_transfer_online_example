import { IOrderController, OrderController } from '@/controller/orderController';
import { ModelContext } from './modelManager';
import { ProductController, IProductController } from '@/controller/productController';
import { Knex } from 'knex';

export interface ControllerContext {
    productController: IProductController;
    orderController: IOrderController;
}

export const controllerManager = ({
    knexSql,
    modelCtx,
}: {
    knexSql: Knex,
    modelCtx: ModelContext
}): ControllerContext => {
    const productController = ProductController.createController({
        productModel: modelCtx.productModel,
    });

    const orderController = OrderController.createController({
        knexSql,
        orderModel: modelCtx.orderModel,
        productModel: modelCtx.productModel,
    });

    return {
        productController: productController,
        orderController: orderController,
    };
};
