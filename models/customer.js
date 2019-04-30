const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
	fullname: { type: String, required: true },
	phone: String,
	point: { type: Number, min: 0, default: 0 }
}, {
	timestamps: true
});

// query helpers
CustomerSchema.query.queryByString = function(str) {
	const regexp = new RegExp(str, 'gi');
	return this.find({
		$or: [
			{ fullname: regexp },
			{ phone: regexp },
			{ point: str.replace(/\D+/g, '') }
		]
	});
};

CustomerSchema.query.queryPlan = function(plan, options) {
	const {
		text, sortField, order, index, length
	} = options;
	let data;
	switch (plan) {
	// Plan A: query if include text, sort by field, skip by index and limit by length
	case 'A':
		data = this
			.queryByString(text)
			.sort((order === 'asc' ? '' : '-') + sortField)
			.skip(parseInt(index))
			.limit(parseInt(length));

	default:
		data = this;
	}
	return data;
};

module.exports = mongoose.model('Customer', CustomerSchema);
