module.exports = {

	customSort(array = [], sortField, order = 'asc') {
		if (!sortField) return true;
		array.sort((a, b) => {
			const split = sortField.split('.');
			let afield = { ...a }._doc;
			let bfield = { ...b }._doc;
			for (const field of split) {
				if (typeof afield[field] === 'object') {
					afield = { ...afield[field] }._doc;
					bfield = { ...bfield[field] }._doc;
				}
				else {
					afield = afield[field];
					bfield = bfield[field];
				}
			}
			if (order == 'desc') {
				const temp = afield;
				afield = bfield;
				bfield = temp;
			}
			if (typeof afield === 'number') {
				return afield > bfield;
			}
			afield += '';
			bfield += '';
			return afield.localeCompare(bfield);
		});
		return array;
	}
};
