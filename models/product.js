const mongoose 		= require('mongoose');

const ProductSchema	= new mongoose.Schema({
	name: { type: String, required: true },
	code: { type: String, required: true, unique: true },
	origin: { type: Number, required: true, min: 0 },
	price: { type: Number, required: true, min: 0 },
	sale: {
		type: Number, default: 0, min: 0, max: 100
	}, // %
	saleBegin: Date,
	saleEnd: Date,
	quantity: {
		type: Number, required: true, min: 0, default: 0
	},
	status: { type: Boolean, default: true }
}, {
	timestamps: true
});

// query helpers
ProductSchema.query.queryByString = function(str) {
	const regexp = new RegExp(str, 'gi');
	return this.find({
		$or: [
			{ name: regexp },
			{ code: regexp }
		]
	});
};

ProductSchema.query.queryPlan = function(plan, options) {
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


module.exports = mongoose.model('Product', ProductSchema);
