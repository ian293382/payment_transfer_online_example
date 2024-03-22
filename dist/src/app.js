"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("@/routes/index"));
const users_1 = __importDefault(require("@/routes/users"));
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.config();
        this.routerSetup();
        this.errorHandler();
    }
    config() {
        // view engine setup
        this.app.set('views', path_1.default.join(__dirname, 'views'));
        this.app.set('view engine', 'ejs');
        this.app.use((0, morgan_1.default)('dev'));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: false }));
        this.app.use((0, cookie_parser_1.default)());
        this.app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
    }
    routerSetup() {
        this.app.use('/', index_1.default);
        this.app.use('/users', users_1.default);
    }
    errorHandler() {
        // catch 404 and forward to error handler
        const requestHandler = function (_req, _res, next) {
            next((0, http_errors_1.default)(404));
        };
        this.app.use(requestHandler);
        // error handler
        const errorRequestHandler = function (err, req, res, _next) {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get("env") === "development" ? err : {};
            // render the error page
            res.status(err.status || 500);
            res.render("error");
        };
        this.app.use(errorRequestHandler);
    }
}
exports.default = new App().app;
