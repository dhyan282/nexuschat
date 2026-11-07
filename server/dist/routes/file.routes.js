"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const file_controller_1 = require("../controllers/file.controller");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.post('/upload', auth_1.requireAuth, upload_1.upload.array('files', 10), file_controller_1.fileController.upload);
router.delete('/:id', auth_1.requireAuth, file_controller_1.fileController.delete);
exports.default = router;
//# sourceMappingURL=file.routes.js.map