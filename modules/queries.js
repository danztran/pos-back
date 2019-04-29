const mongoose = require('mongoose');

const queries = {
	exists(model, query) {
		return new Promise(async(resolve, reject) => {
			const modelFound = mongoose.model(model);
			try {
				if (!modelFound) throw 'Model not found';
				const document = await modelFound.findOne(query).exec();
				resolve(Boolean(document));
			}
			catch (error) {
				reject(error);
			}
		});
	}
};

module.exports = queries;
