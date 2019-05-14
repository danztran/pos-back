const Bill = requireWrp('models/bill');
const Product = requireWrp('models/product');
const Customer = requireWrp('models/customer');
const ActivityLog = requireWrp('models/activity-log');
const validator = requireWrp('modules/validator-config');
const { customSort } = requireWrp('modules/common');
const pointPlus = 5; // point plus after paid. % of total;

const ctrl = {
	async query(req, res, next) {
		const rules = {
			length: 'numeric|required',
			index: 'numeric|required',
			text: 'string',
			sortField: 'string|required',
			order: 'in:asc,desc|required'
		};
		const queryOption = req.body;
		const {
			text, sortField, order, index, length
		} = queryOption;

		if (!validator.validateAutoRes(queryOption, rules, res)) return;

		const result = {};
		try {
			// query all
			let bills = await Bill.find().queryPlan('A').exec();

			// search
			if (text) {
				const search = text.toLowerCase();
				bills = bills.filter((e) => {
					const query = [
						e.user.fullname,
						e.customer.fullname,
						e.products.map(e => e.product.name).join(','),
						e.total,
						e.bonus,
						e.payment,
						e.subpoint
					];
					return query.join('|').toLowerCase().indexOf(search) !== -1;
				});
				result.count = bills.length;
			}
			else {
				result.count = await Bill.estimatedDocumentCount();
			}

			// sort
			customSort(bills, sortField, order);

			// skip & limit
			result.bills = bills.splice(index, length);

			res.message['bill.query'] = 'Done query';
		}
		catch (error) {
			res.message['bill.query'] = 'Query bill error';
			return next(error);
		}

		return res.sendwm(result);
	},

	async add(req, res, next) {
		const rules = {
			customerId: 'required',
			payment: 'in:cash,bank|required',
			subpoint: 'numeric|required',
			products: 'array|required',
			'products.*.code': 'digits:6|required',
			'products.*.buyQuantity': 'numeric'
		};
		const reqBill = req.body;
		if (!validator.validateAutoRes(reqBill, rules, res)) return;

		const result = {};
		try {
			// check customer
			const customer = await Customer.findById(reqBill.customerId).exec();
			if (!customer) {
				res.status(404);
				throw { customer: 'Customer not found' };
			}

			// check subpoint
			reqBill.subpoint = parseFloat(reqBill.subpoint);
			if (reqBill.subpoint > customer.point) {
				res.status(409);
				throw { subpoint: `Subpoint must be less than customer point (${customer.point})` };
			}
			else if (reqBill.subpoint < 0) {
				res.status(409);
				throw { subpoint: 'Subpoint is not valid' };
			}

			// check products
			const codes = reqBill.products.map(e => e.code);
			const products = await Product.find().where('code').in(codes).exec();
			const productCodes = products.map(e => e.code);
			const codeNotFound = codes.filter(e => !productCodes.includes(e));
			if (codeNotFound.length > 0) {
				res.status(404);
				throw { 'product.codes': `Not found any product with code [${codeNotFound.join(', ')}]` };
			}

			// check quantity
			for (const product of products) {
				const { buyQuantity } = reqBill.products.find(e => e.code === product.code);
				if (buyQuantity < 1) {
					res.status(409);
					throw { 'product.buyQuantity': `Product ${product.name} quantity must be at lease one item` };
				}
				if (buyQuantity > product.quantity) {
					res.status(409);
					throw { 'product.buyQuantity': `Product ${product.name} have ${product.quantity} quantity left` };
				}
			}

			// handle bill products
			const billProducts = products.map((p) => {
				let sale = 0;
				if (p.sale && p.saleBegin && p.saleEnd) {
					const date = Date.now();
					if (date > new Date(p.saleBegin) && date < new Date(p.saleEnd)) {
						sale = p.sale;
					}
				}

				return {
					productInfo: p,
					product: p._id,
					price: p.price,
					sale,
					quantity: reqBill.products.find(e => e.code === p.code).buyQuantity
				};
			});

			// total
			const total = billProducts.reduce((sum, e) => {
				sum += 0;
				return sum += e.price * e.quantity * (100 - e.sale) / 100;
			}, -reqBill.subpoint).toFixed(2);

			if (total < 0) {
				res.status(409);
				throw { subpoint: 'Subpoint must be less than total' };
			}
			const pointBonus = Math.round(total * pointPlus / 100);
			customer.set('point', customer.point - reqBill.subpoint + pointBonus);

			const bill = await new Bill({
				user: req.user._id,
				customer: customer._id,
				payment: reqBill.payment,
				subpoint: reqBill.subpoint,
				total,
				bonus: pointBonus,
				products: billProducts
			}).save();
			result.customer = await customer.save();

			result.bill = await bill
				.populate('user', 'fullname')
				.populate('customer', 'fullname phone')
				.populate('products.product', 'name')
				.execPopulate();

			res.message['bill.add'] = `Success! Point bonus: ${pointBonus}.  Current point: ${customer.point}`;

			ActivityLog.create({
				actor: req.user._id,
				action: 'bill.add',
				target: result.bill._id,
				model: 'Bill',
				note: '<:actor> created new bill <:target>'
			});

			// subtract product quantity
			for (const product of products) {
				const { buyQuantity } = reqBill.products.find(e => e.code === product.code);
				product.quantity -= buyQuantity;
				product.save();
			}
		}
		catch (error) {
			res.message = { ...res.message, ...error };
			return next(error);
		}

		return res.sendwm(result);
	}
};

module.exports = ctrl;
