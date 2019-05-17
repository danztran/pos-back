const path = require('path');
module.exports = function(req, res, next) {
	if (req.xhr) return next();
	return res.sendFile('public/index.html' , {'root': './'});
	next();
};
