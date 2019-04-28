const mdw = {
	authen: function(req, res, next) {
		if (!req.user)  {
			res.message['authenticate'] = 'Unauthenticated';
			return res.status(401).sendwm();
		}
		next();
	},

	authenAdmin: function(req, res, next) {
		if (!req.user.isAdmin) {
			res.message['authorize'] = 'You do not have permission';
			return res.status(403).sendwm();
		}
		next();
	},
}

module.exports = mdw;