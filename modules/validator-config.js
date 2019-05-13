const validator = require('validatorjs');

validator.setAttributeFormatter((attribute) => {
	const firstkey = attribute[0];
	return attribute.replace(firstkey, firstkey.toUpperCase());
});

validator.register('rejected', function(value, requirement, attribute) { // requirement parameter defaults to null
	return !Boolean(value);
}, 'The :attribute is rejected.');

module.exports = {

	// return raw validator
	raw: () => validator,

	// return true or false
	valid(data, rules) {
		const validation = new validator(data, rules);
		return validation.passes();
	},

	// auto response if validate fails
	validateAutoRes(data, rules, res) {
		const validation = new validator(data, rules);
		validation.fails(() => {
			res.message = { ...res.message, ...validation.errors.errors };
			res.status(422).sendwm();
		});
		return validation.passes();
	},

	// normal validation
	validation(...params) {
		return new validator(...params);
	}
};
