const express 	= require('express');
const router 	= express.Router();
const authController = requireWrp('controllers/auth-controller');

router.get('/info', authController.info);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
