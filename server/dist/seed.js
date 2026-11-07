"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
const User_1 = require("./models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function seed() {
    await (0, db_1.connectDB)();
    const adminEmail = 'admin@nexuschat.app';
    if (await User_1.User.findOne({ email: adminEmail })) {
        console.log('already seeded');
        process.exit(0);
    }
    const hash = await bcryptjs_1.default.hash('Admin@123', 10);
    await User_1.User.create({ name: 'Admin', username: 'admin', email: adminEmail, password: hash, role: 'admin', isVerified: true });
    const hash2 = await bcryptjs_1.default.hash('User@123', 10);
    await User_1.User.create({ name: 'Demo User', username: 'demo', email: 'demo@nexuschat.app', password: hash2, isVerified: true });
    console.log('Seeded admin@nexuschat.app / Admin@123 and demo@nexuschat.app / User@123');
    process.exit(0);
}
seed();
//# sourceMappingURL=seed.js.map