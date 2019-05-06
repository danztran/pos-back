const express 	= require('express');
const router 	= express.Router();
const authMiddleware = requireWrp('middlewares/auth-middleware');
const billController = requireWrp('controllers/bill-controller');

router.use(authMiddleware.authen);
router.post('/query', billController.query);
router.post('/add', billController.add);

module.exports = router;