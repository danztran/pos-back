const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
	code			: {type: String, unique: true},
	user 			: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
	payment 		: {type: Schema.Types.ObjectId, required: true, ref: 'Payment'},
	customer 	: {type: Schema.Types.ObjectId, ref: 'Customer'},
	subpoint 	: {type: Number, min: 0, default: 0},
	total 		: {type: Number, min: 0, required: true},
	products		: [{
    	product 	: {type: Schema.Types.ObjectId, ref: 'Product'},
    	price 	: {type: Number, min: 0, required: true},
    	sale 		: {type: Number, min: 0, default: 0},
    	quantity	: {type: Number, min: 1, default: 1},
  	}]
}, {
	timestamps: true
});

module.exports = mongoose.model('Bill', BillSchema);