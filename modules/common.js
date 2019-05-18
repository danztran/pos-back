const common = {

	customSort(array = [], sortField, order = 'asc') {
		if (!sortField) return true;
		array.sort((a, b) => {
			const props = sortField.split('.');
			let m = JSON.parse(JSON.stringify(a));
			let n = JSON.parse(JSON.stringify(b));
			for (const prop of props) {
				if (typeof m[prop] === 'object') {
					m = JSON.parse(JSON.stringify(m[prop]));
					n = JSON.parse(JSON.stringify(n[prop]));
				}
				else {
					m = m[prop];
					n = n[prop];
				}
			}
			if (order == 'desc') {
				[m, n] = [n, m];
			}
			if (typeof m === 'number') {
				return m - n;
			}
			return m.toString().localeCompare(n.toString());
		});
		return array;
	}


};

module.exports = common;
