"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const next_1 = __importDefault(require("next"));
const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
console.log('Starting server with configuration:', {
    port,
    dev,
    nodeEnv: process.env.NODE_ENV,
    cwd: process.cwd()
});
const nextApp = (0, next_1.default)({ dev });
const nextHandler = nextApp.getRequestHandler();
// Make sure errors are properly caught and logged
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Don't exit the process in development
    if (!dev) {
        process.exit(1);
    }
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    // Don't exit the process in development
    if (!dev) {
        process.exit(1);
    }
});
async function start() {
    try {
        await nextApp.prepare();
        const app = (0, express_1.default)();
        // Handle Next.js requests
        app.all('*', (req, res) => {
            return nextHandler(req, res);
        });
        app.listen(port, () => {
            console.log(`> Ready on http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}
start();
