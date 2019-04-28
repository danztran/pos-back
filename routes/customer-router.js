const express 	= require('express');
const router 	= express.Router();
const authMiddleware = requireWrp('middlewares/auth-middleware');
const customerController = requireWrp('controllers/customer-controller');

// middleware check authorize
router.use(authMiddleware.authen);

router.post('/query', customerController.query);
router.post('/add', customerController.add);
router.post('/edit', customerController.edit);

module.exports = router;
