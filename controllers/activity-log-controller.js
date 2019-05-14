const ActivityLog = requireWrp('models/activity-log');
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
			result.aclogs = await ActivityLog.find().queryPlan('A', queryOption).exec();
			res.message['activity-log.query'] = 'Done query';
		}
		catch (error) {
			res.message['activity-log.query'] = 'Query activity log error';
			return next(error);
		}

		return res.sendwm(result);
	}
};

module.exports = ctrl;
