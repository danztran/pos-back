const mongoose 		= require('mongoose');

const dancrypt 		= requireWrp('modules/dancrypt');

const UserSchema 	= new mongoose.Schema({
	fullname: { type: String, required: true },
	phone: { type: String, required: true },
	username: { type: String, requried: true, unique: true },
	password: { type: String, required: true },
	sysAdmin: { type: Boolean, default: false },
	isAdmin: { type: Boolean, default: false },
	isStaff: { type: Boolean, default: true }
}, {
	timestamps: true
});

// middlewares
UserSchema.pre('save', function(next) {
	// only hash the password if it has been modified (or is new)
	if (!this.isModified('password')) return next();
	this.password = dancrypt.enc(this.password);

	next();
});

// query helpers
UserSchema.query.queryByString = function(str) {
	str = str.replace(/[^a-zA-Z0-9 ]/g, '');
	const regexp = new RegExp(str, 'gi');
	return this.find({
		$or: [
			{ fullname: regexp },
			{ username: regexp },
			{ phone: regexp }
		]
	});
};

UserSchema.query.queryPlan = function(plan, options, req) {
	const {
		text, sortField, order, index, length
	} = options;
	let data;
	switch (plan) {
	// Plan A: query if include text, sort by field, skip by index and limit by length
		case 'A':
			data = this
				.queryByString(text)
				.where('username').nin([req.user.username])
				.where('sysAdmin').equals(false)
				.select('-password -sysAdmin -__v')
				.sort((order === 'asc' ? '' : '-') + sortField)
				.skip(parseInt(index))
				.limit(parseInt(length));

		case 'B':
			data = this
				.queryByString(text)
				.where('username').nin([req.user.username])
				.where('sysAdmin').equals(false)

		default:
			data = this;
	}
	return data;
};

module.exports = mongoose.model('User', UserSchema);
