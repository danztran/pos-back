require('dotenv').config();

let extendConfig = {};
if (process.env.NODE_ENV === 'production') {

} else {
	extendConfig = {
		out_file: "./storage/logs/out.log",
		error_file: "./storage/logs/error.log",
	}
}

module.exports = {
	apps: [{
		name: 'pos',
		script: './app.js',
		...extendConfig,
		instances: process.env.PM2_INSTANCES,
		exec_mode: 'cluster',
		autorestart: true,
		max_memory_restart: '1G',
		merge_logs: true,
		ignore_watch: ["public", "storage", ".git"],
		env: {
			NODE_ENV: 'development',
			watch: true,
			log_date_format: "YYYY-MM-DD HH:mm Z",
		},
		env_production: {
			NODE_ENV: 'production',
			watch: false,
			log_date_format: ""
		}
	}],
};
