const mongoose 		= require('mongoose');

var PaymentSchema 	= new mongoose.Schema({
	code: {type: String, required: true, unique: true},
	name: {type: String, unique: true}
}, {
	timestamps: true
});

module.exports 	= mongoose.model('Payment', PaymentSchema);