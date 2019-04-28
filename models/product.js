const mongoose 		= require('mongoose');

const ProductSchema	= new mongoose.Schema({
	name 			: {type: String, required: true},
	code 			: {type: String, unique: true},
	origin 		: {type: Number, required: true},
	price 		: {type: Number, required: true, min: 0},
	sale 			: {type: Number, default: 0}, // %
	saleBegin	: Date,
	saleEnd 		: Date,
	quantity 	: {type: Number, required: true, min: 0},
	status		: {type: Boolean, default: true}
}, {
	timestamps: true
});



module.exports = mongoose.model('Product', ProductSchema);