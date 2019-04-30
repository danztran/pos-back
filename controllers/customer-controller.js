const Customer = requireWrp('models/customer');
const validator = requireWrp('modules/validator-config');

const ctrl = {
	async query(req, res, next) {
		const rules = {
			length: 'required|numeric',
			index: 'required|numeric',
			text: 'string',
			sortField: 'required',
			order: 'required'
		};
		const queryOptions = req.body;

		if (!validator.validateAutoRes(queryOptions, rules, res)) return;

		const result = {};
		try {
			result.customers = await Customer.find().queryPlan('A', queryOptions).exec();
			result.count = await Customer.estimatedDocumentCount();
			res.message['customer.query'] = 'Done query';
		}
		catch (error) {
			res.message['customer.query'] = 'Query customer error';
			return next(error);
		}

		return res.sendwm(result);
	},

	async add(req, res, next) {
		const rules = {
			fullname: 'required',
			phone: 'required'
		};
		const info = req.body;

		// validate
		if (!validator.validateAutoRes(info, rules, res)) return;

		const result = {};

		try {
			const customerAdd = new Customer(info);
			// check unique
			const customer = await Customer.findOne({
				fullname: customerAdd.fullname,
				phone: customerAdd.phone
			}).exec();

			if (customer) {
				res.status(409);
				res.message['customer.add'] = 'Customer information is exists';
			}
			else {
				result.customer = await customerAdd.save();
				res.message['customer.add'] = `Added new customer <${customerAdd.fullname}>`;
			}
		}
		catch (error) {
			res.message['customer.add'] = 'Add customer error';
			return next(error);
		}

		return res.sendwm(result);
	},

	async edit(req, res, next) {
		const rules = {
			_id: 'required',
			fullname: 'required',
			phone: 'required'
		};
		const info = req.body;
		delete info.point;

		// validate
		if (!validator.validateAutoRes(info, rules, res)) return;

		const result = {};

		try {
			// find and update
			const customer = await Customer.findById(info._id).exec();

			if (!customer) {
				// if customer id not found. close.
				res.status(404);
				res.message.customer = 'Customer not found';
			}
			else {
				customer.set(info);
				result.customer = await customer.save();
				res.message['customer.edit'] = `Edited customer <${info.fullname}> information`;
			}
		}
		catch (error) {
			res.message['customer.edit'] = 'Edit customer error';
			return next(error);
		}

		return res.sendwm(result);
	}
};

module.exports = ctrl;
