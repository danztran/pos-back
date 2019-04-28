const express 	= require('express');
const router 	= express.Router();
const userController = requireWrp('controllers/user-controller');
const authMiddleware = requireWrp('middlewares/auth-middleware');

// middleware check authorize
router.use(authMiddleware.authen);
router.use(authMiddleware.authenAdmin);

router.post('/add', userController.add);
router.post('/edit', userController.edit);
router.post('/query', userController.query);

module.exports = router;
