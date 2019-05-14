const mongoose = require('mongoose');

const { Schema } = mongoose;

const ActivityLog = new Schema({
	actor: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
	action: { type: String, required: true },
	target: { type: Schema.Types.ObjectId, required: true, refPath: 'model' },
	model: { type: String, required: true, enum: ['User', 'Bill', 'Product', 'Customer'] },
	note: { type: String }
}, {
	timestamps: true
});

ActivityLog.query.queryPlan = function(plan, options) {
	const {
		text, sortField, order, index, length
	} = options;
	const regexp = new RegExp(text.replace(/[^a-zA-Z0-9. ]/g, ''), 'gi');
	let data;
	switch (plan) {
		// Plan A: query if include text, sort by field, skip by index and limit by length
		case 'A':
			data = this
				.find({ action: regexp })
				.sort((order === 'asc' ? '' : '-') + sortField)
				.skip(parseInt(index))
				.limit(parseInt(length))
				.populate('actor', 'fullname username')
				.populate('target', 'fullname username name');

		default:
			data = this;
	}

	return data;
};

module.exports = mongoose.model('ActivityLog', ActivityLog);
