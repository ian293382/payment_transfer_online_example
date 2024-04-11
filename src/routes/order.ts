import express from "express";
import { ControllerContext } from "@/manager/controllerManager";

export const mountOrderRouter = ({
    controllerCtx 
} : {
    controllerCtx: ControllerContext}) => {
    let router = express.Router();
    
    router.post('/create', controllerCtx.orderController.createOrder);

    return router;
}