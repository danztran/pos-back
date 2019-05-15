const Product = requireWrp('models/product');
const ActivityLog = requireWrp('models/activity-log');
const validator = requireWrp('modules/validator-config');

const ctrl = {
	async info(req, res, next) {
		const rules = {
			code: 'required|true'
		};
		if (!validator.validateAutoRes(req.params, rules, res)) return;
		const { code } = req.params;
		const result = {};
		try {
			result.product = await Product.findOne({ code }).exec();
		}
		catch (error) {
			res.message['product.info'] = 'Get product error';
			return next(error);
		}

		return res.sendwm(result);
	},

	async query(req, res, next) {
		const rules = {
			length: 'required|numeric',
			index: 'required|numeric',
			text: 'string',
			sortField: 'required',
			order: 'required'
		};
		const queryOption = req.body;

		if (!validator.validateAutoRes(queryOption, rules, res)) return;

		const result = {};
		try {
			result.products = await Product.find().queryPlan('A', queryOption).exec();
			if (!queryOption.text) {
				result.count = await Product.estimatedDocumentCount();
			}
			else {
				result.count = await Product.find().queryByString(queryOption.text).countDocuments();
			}

			res.message['product.query'] = 'Done query';
		}
		catch (error) {
			res.message['product.query'] = 'Query product error';
			return next(error);
		}

		return res.sendwm(result);
	},

	async add(req, res, next) {
		const rules = {
			name: 'string|between:3,32|required',
			code: 'alpha_num|digits:6|required',
			origin: 'numeric|required',
			price: 'numeric|required',
			sale: 'numeric|required_with_all:saleBegin,saleEnd',
			saleBegin: 'date|required_with:sale',
			saleEnd: 'date|required_with:sale|after:saleBegin',
			quantity: 'numeric|required',
			status: 'boolean|required'
		};
		const productInfo = req.body;

		if (!validator.validateAutoRes(productInfo, rules, res)) return;

		const result = {};

		try {
			const productAdd = new Product(productInfo);
			// check unique
			const product = await Product.findOne({ code: productAdd.code }).exec();
			if (product) {
				res.status(409);
				res.message.code = 'Code has already been taken';
			}
			else {
				result.product = await productAdd.save();
				res.message['product.add'] = `Added new product <${productAdd.name}>`;

				ActivityLog.create({
					actor: req.user._id,
					action: 'product.add',
					target: result.product._id,
					model: 'Product',
					note: ':actor added new product :target'
				});
			}
		}
		catch (error) {
			res.message['product.add'] = 'Add product error';
			return next(error);
		}

		return res.sendwm(result);
	},

	async edit(req, res, next) {
		const rules = {
			name: 'string|between:3,32|required',
			code: 'alpha_num|digits:6|required',
			origin: 'numeric|required',
			price: 'numeric|required',
			sale: 'numeric|required_with_all:saleBegin,saleEnd',
			saleBegin: 'date|required_with:sale',
			saleEnd: 'date|required_with:sale|after:saleBegin',
			quantity: 'numeric|required',
			status: 'boolean|required'
		};
		const productInfo = req.body;

		if (!validator.validateAutoRes(productInfo, rules, res)) return;

		if (!productInfo.sale) {
			productInfo.saleBegin = null;
			productInfo.saleEnd = null;
		}

		const result = {};

		try {
			const product = await Product.findOne({
				code: productInfo.code
			}).exec();

			if (!product) {
				res.status(404);
				res.message.code = 'Product not found';
			}
			else {
				product.set(productInfo);
				result.product = await product.save();
				res.message['product.edit'] = `Edited product <${productInfo.name}> information`;

				ActivityLog.create({
					actor: req.user._id,
					action: 'product.edit',
					target: result.product._id,
					model: 'Product',
					note: ':actor edited information of product :target'
				});
			}
		}
		catch (error) {
			res.message['product.edit'] = 'Edit product error';
			return next(error);
		}

		return res.sendwm(result);
	}
};

module.exports = ctrl;
