"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
async function main() {
    await (0, db_1.connectDB)();
    app_1.server.listen(env_1.env.PORT, () => logger_1.logger.info(`Server running on port ${env_1.env.PORT}`));
}
main();
//# sourceMappingURL=server.js.map