import express from "express";
import { ControllerContext } from "@/manager/controllerManager";

export const mountOrderRouter = ({
    controllerCtx 
} : {
    controllerCtx: ControllerContext}) => {
    let router = express.Router();
    // middleware 中介層 => 當我們資料經過驗證後才會到createOrder
    router.post('/create',
    controllerCtx.orderController.createOrderValidator(),
    controllerCtx.orderController.createOrder);

    return router;
}