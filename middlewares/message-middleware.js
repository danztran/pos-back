module.exports = function(req, res, next) {
	res.message = {};
	res.sendwm = function(body = {}) {
		body.message = res.message;
		return res.send(body);
	}
	next();
};