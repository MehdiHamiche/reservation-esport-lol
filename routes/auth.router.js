const express = require("express");
const authenticate = require("../controllers/auth.controller");

const router = express.Router();

router
    .route("/")
    .get(controller.getAll)
    .post(authenticate.isAuthenticated, authenticate.isUser, authenticate.isSuperAdmin, controller.addAll)
    .delete(authenticate.isAuthenticated, authenticate.isUser, controller.deleteAll);


router
    .post('/login', auth.controller.login)
router
    .post('/register',auth.controller.register);

module.exports = router;