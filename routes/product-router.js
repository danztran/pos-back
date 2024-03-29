const express 	= require('express');

const router 	= express.Router();

const authMiddleware = requireWrp('middlewares/auth-middleware');
const productController = requireWrp('controllers/product-controller');

router.use(authMiddleware.authen);
router.get('/info:code', productController.info);
router.post('/query', productController.query);

router.post('/add', productController.add);
router.post('/edit', productController.edit);

module.exports = router;
