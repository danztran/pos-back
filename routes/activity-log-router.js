const express 	= require('express');

const router 	= express.Router();
const authMiddleware = requireWrp('middlewares/auth-middleware');
const acLogController = requireWrp('controllers/activity-log-controller');

router.use(authMiddleware.authen);
router.use(authMiddleware.authenSysAdmin);
router.post('/query', acLogController.query);

module.exports = router;
