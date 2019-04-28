module.exports = function (err, req, res, next) {
	if (!err) return next();
	console.error(err);
	res.status(500);
	return res.sendwm();
};