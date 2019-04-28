const express 	= require('express');
const router 	= express.Router();
const authMiddleware = requireWrp('middlewares/auth-middleware');
const billController = requireWrp('controllers/bill-controller');

router.get('/test', billController.postProduct);
router.post('/test', billController.postProduct);

module.exports = router;