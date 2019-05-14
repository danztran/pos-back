const User = requireWrp('models/user');
const ActivityLog = requireWrp('models/activity-log');
const dancrypt = requireWrp('modules/dancrypt');
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
			ActivityLog.create({
				actor: req.user._id,
				action: 'user.add',
				target: result.user._id,
				model: 'User',
				note: '<:actor> added new user <:target>'
			});
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
			// password: 'present'
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
			await user.save();
			const info = { ...user }._doc;
			delete info.password;
			result.user = info;
			res.message['user.edit'] = `Edited user <${userInfo.fullname}> information`;
			ActivityLog.create({
				actor: req.user._id,
				action: 'user.edit',
				target: result.user._id,
				model: 'User',
				note: '<:actor> edited profile of user <:target>'
			});
		}
		catch (error) {
			res.message = { ...res.message, ...error };
			return next(error);
		}

		return res.sendwm(result);
	},

	async selfEdit(req, res, next) {
		const rules = {
			fullname: 'required',
			phone: 'numeric|digits:10|required',
			curpassword: 'required', // if change
			password: 'string',
			username: 'rejected',
			isAdmin: 'rejected',
			isStaff: 'rejected',
			sysAdmin: 'rejected'
		};
		const editInfo = req.body;

		// validate
		if (!validator.validateAutoRes(editInfo, rules, res)) return;

		const result = {};

		try {
			// find and update
			const user = await User.findOne({
				username: req.user.username
			}).exec();

			if (!user) {
				// if username not found. close.
				res.status(404);
				req.logout();
				throw { username: 'User not found' };
			}

			if (dancrypt.dec(user.password) !== editInfo.curpassword) {
				res.status(409);
				throw { curpassword: 'Current password is incorrect' };
			}

			user.set(editInfo);
			await user.save();
			const info = { ...user }._doc;
			delete info.password;
			result.user = info;
			res.message['user.selfedit'] = `Edited user <${editInfo.fullname}> information`;
			ActivityLog.create({
				actor: req.user._id,
				action: 'user.edit',
				target: result.user._id,
				model: 'User',
				note: '<:actor> edited self profile'
			});
		}
		catch (error) {
			res.message = { ...res.message, ...error };
			return next(error);
		}

		return res.sendwm(result);
	}
};

module.exports = ctrl;
