import { ControllerContext } from "@/manager/controllerManager"
import express from "express";

export const mountOrderRouter = ({
    controllerCtx,
}: {
    controllerCtx: ControllerContext;
}) => {
    let router = express.Router();

    router.post("/create",
    // 俗稱middleware 中介層 createOrderValidator 是函數 createOrderValidator()
    controllerCtx.orderController.createOrderValidator(),
    // controller create Order 完整內容
    controllerCtx.orderController.createOrder);

    return router;
}