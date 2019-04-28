const passport 	= requireWrp('modules/passport-config');

module.exports = {
	info: function(req, res, next) {
		if (req.user) {
			res.message['auth.info'] = 'Get auth info';
			return res.sendwm({user: req.user});
		}
		res.message['auth.info'] = 'Session has expired.';
		res.status(440);
		return res.sendwm();
	},

	login: function(req, res, next) {
		if (req.user) {
			res.message['auth.login'] = 'You have already logged in';
			return res.sendwm();
		}
		passport.authenticate('local', function(err, user, info) {
			let result = {};
			if (err) {
				res.message['authenticate'] = 'Authenticate error';
				return next(err);
			}

			if (!user) {
				res.status(401);
				res.message = {...res.message, ...info};
			} else if (!user.isStaff && !user.isAdmin) {
				res.status(403);
				res.message['auth.login'] = 'Your account is disabled';
			} else {
				req.logIn(user, function(err) {
					if (err) {
						res.message['auth.login'] = 'Login error';
						return next(err);
					}
					res.message['auth.login'] = 'You have logged in';
					result.user = user;
				});
			}

			return res.sendwm(result);
		})(req, res, next);
	},

	logout: function(req, res) {
		req.logout();
		res.message['auth.logout'] = 'You have logged out';
		return res.sendwm();
	}
}