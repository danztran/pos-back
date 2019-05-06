module.exports = function(err, req, res, next) {
	if (!err) return next();
	console.error(err);
	if (res.statusCode === 200) {
		res.status(500);
	}
	return res.sendwm();
};
