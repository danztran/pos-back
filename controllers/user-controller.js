const User = requireWrp('models/user');
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
		const queryOption = req.body;

		if (!validator.validateAutoRes(queryOption, rules, res)) return;

		const result = {};
		try {
			result.users = await User.find().queryPlan('A', queryOption).exec();
			if (!queryOption.text) {
				result.count = await User.estimatedDocumentCount();
			}
			else {
				result.count = await User.find().queryByString(queryOption.text).count();
			}

			res.message['user.query'] = 'Done query';
		}
		catch (error) {
			res.message['user.query'] = 'Query user error';
			return next(error);
		}

		return res.sendwm(result);
	},

	async add(req, res, next) {
		const rules = {
			fullname: 'required',
			username: 'required|alpha_num|between:3,32',
			phone: 'required',
			password: 'required',
			isStaff: 'required|boolean',
			isAdmin: 'required|boolean'
		};
		const userInfo = req.body;

		// validate
		if (!validator.validateAutoRes(userInfo, rules, res)) return;

		const result = {};

		try {
			const userAdd = new User(userInfo);
			// check unique
			const user = await User.findOne({ username: userAdd.username }).exec();
			if (user) {
				res.status(409);
				res.message.username = 'Username has already been taken';
			}
			else {
				result.user = await userAdd.save();
				res.message['user.add'] = `Added new user <${userAdd.fullname}>`;
			}
		}
		catch (error) {
			res.message['user.add'] = 'Add user error';
			return next(error);
		}

		return res.sendwm(result);
	},

	async edit(req, res, next) {
		const rules = {
			fullname: 'required',
			username: 'required|alpha_num|between:3,32',
			phone: 'required',
			password: 'required',
			isStaff: 'required|boolean',
			isAdmin: 'required|boolean'
		};
		const userInfo = req.body;

		// validate
		if (!validator.validateAutoRes(userInfo, rules, res)) return;

		const result = {};

		try {
			// find and update
			const user = await User.findOne({
				username: userInfo.username
			}).exec();

			if (!user) {
				// if username not found. close.
				res.status(404);
				res.message.username = 'User not found';
			}
			else if (!user.isAdmin || user.username === req.user.username) {
				// pass if current user edit their account or the account is not an admin adccount
				user.set(userInfo);
				result.user = await user.save();
				res.message['user.edit'] = `Edited user <${userInfo.fullname}> information`;
			}
			else {
				// fail if edit other admin account
				res.status(403);
				res.message['user.edit'] = 'You do not have permission to make change to this user';
			}
		}
		catch (error) {
			res.message['user.edit'] = 'Edit user error';
			return next(error);
		}

		return res.sendwm(result);
	}
};

module.exports = ctrl;
