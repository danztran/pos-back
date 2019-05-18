const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BillSchema = new Schema({
	branchId: { type: String, default: process.env.BRANCH_ID || '00' },
	user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
	payment: { type: String, required: true }, // [bank, cash]
	customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
	subpoint: { type: Number, min: 0, default: 0 },
	total: { type: Number, min: 0, required: true },
	bonus: { type: Number, min: 0, required: true },
	products: [{
		product: { type: Schema.Types.ObjectId, ref: 'Product' },
		price: { type: Number, min: 0, required: true },
		sale: { type: Number, min: 0, default: 0 },
		quantity: { type: Number, min: 1, default: 1 }
	}]
}, {
	timestamps: true
});

BillSchema.query.queryPlan = function(plan) {
	let data;
	switch (plan) {
		// Plan A: query if include text, sort by field, skip by index and limit by length
		case 'A':
		data = this
			.populate('user', 'fullname')
			.populate('customer', 'fullname phone')
			.populate('products.product', 'name')
			break;

		default:
		data = this;
	}
	return data;
};

module.exports = mongoose.model('Bill', BillSchema);
