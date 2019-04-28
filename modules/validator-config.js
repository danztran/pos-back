const validator = require('validatorjs');

module.exports = {

	// return raw validator
	raw: () => validator,

	// return true or false
	valid: function(data, rules) {
		const validation = new validator(data, rules);
		return validation.passes();
	},

	// auto response if validate fails
	validateAutoRes: function(data, rules, res) {
		const validation = new validator(data, rules);
		validation.fails(function() {
			res.message = {...res.message, ...validation.errors.errors};
			res.status(422).sendwm();
		});
		return validation.passes();
	},

	// normal validation
	validation: function(...params) {
		return new validator(...params);
	}
}