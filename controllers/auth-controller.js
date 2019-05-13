const passport 	= requireWrp('modules/passport-config');

const ctrl = {
	getSafeInfo(user) {
		const info = { ...user }._doc;
		delete info.password;
		delete info._id;
		return info;
	},

	info(req, res, next) {
		if (req.user) {
			res.message['auth.info'] = 'Get auth info';
			return res.sendwm({ user: ctrl.getSafeInfo(req.user) });
		}
		res.message['auth.info'] = 'Your session has expired.';
		res.status(440);
		return res.sendwm();
	},

	login(req, res, next) {
		if (req.user) {
			res.message['auth.login'] = 'You have already logged in';
			return res.sendwm({ user: ctrl.getSafeInfo(req.user) });
		}
		passport.authenticate('local', (err, user, info) => {
			const result = {};
			if (err) {
				res.message.authenticate = 'Authenticate error';
				return next(err);
			}

			if (!user) {
				res.status(401);
				res.message = { ...res.message, ...info };
			}
			else if (!user.isStaff && !user.isAdmin) {
				res.status(403);
				res.message['auth.login'] = 'This account is currently disabled';
			}
			else {
				req.logIn(user, (err) => {
					if (err) {
						res.message['auth.login'] = 'Login error';
						return next(err);
					}
					res.message['auth.login'] = 'You have logged in';
					result.user = ctrl.getSafeInfo(user);
				});
			}

			return res.sendwm(result);
		})(req, res, next);
	},

	logout(req, res) {
		req.logout();
		res.message['auth.logout'] = 'You have logged out';
		return res.sendwm();
	}
};

module.exports = ctrl;
