const mdw = {
	authen(req, res, next) {
		if (!req.user) {
			res.message.authenticate = 'Unauthenticated';
			return res.status(401).sendwm();
		}
		next();
	},

	authenAdmin(req, res, next) {
		if (!req.user.isAdmin) {
			res.message.authorize = 'You do not have permission';
			return res.status(403).sendwm();
		}
		next();
	},

	authenSysAdmin(req, res, next) {
		if (!req.user.sysAdmin) {
			res.message.authorize = 'You do not have permission';
			return res.status(409).sendwm();
		}
		next();
	}
};

module.exports = mdw;
