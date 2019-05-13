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
			result.users = await User.find().queryPlan('A', queryOption, req).exec();
			result.count = await User.find().queryPlan('B', queryOption, req).countDocuments();

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
				throw { username: 'Username has already been taken' };
			}

			if (userAdd.isAdmin && !req.user.sysAdmin) {
				// only sysadmin can create an admin user
				res.status(403);
				throw { 'user.add': 'You do not have permission to add an admin user' };
			}

			result.user = await userAdd.save();
			res.message['user.add'] = `Added new user <${userAdd.fullname}>`;
		}
		catch (error) {
			res.message = { ...res.message, ...error };
			return next(error);
		}

		return res.sendwm(result);
	},

	async edit(req, res, next) {
		const rules = {
			fullname: 'required',
			username: 'required|alpha_num|between:3,32',
			phone: 'numeric|digits:10|required',
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
				throw { username: 'User not found' };
			}

			if ((user.isAdmin || userInfo.isAdmin || userInfo.sysAdmin || user.sysAdmin) && !req.user.sysAdmin) {
				// only sysadmin can edit admin account
				res.status(403);
				throw { 'user.edit': 'You do not have permission to make change to admin account' };
			}

			user.set(userInfo);
			result.user = await user.save();
			res.message['user.edit'] = `Edited user <${userInfo.fullname}> information`;
		}
		catch (error) {
			res.message = { ...res.message, ...error };
			return next(error);
		}

		return res.sendwm(result);
	}
};

module.exports = ctrl;
