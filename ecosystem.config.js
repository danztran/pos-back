module.exports = {
	apps: [{
		name: 'pos',
		script: './app.js',
		autorestart: true,
		watch: true,
		ignore_watch: ["public", "storage", ".git"],
		max_memory_restart: '1G',
		out_file: "./storage/logs/out.log",
		error_file: "./storage/logs/error.log",
		merge_logs: true,
		env: {
			NODE_ENV: 'development',
			instances: 2,
			log_date_format: "YYYY-MM-DD HH:mm Z",
		},
		env_production: {
			instances: 4,
			NODE_ENV: 'production'
		}
	}],
};
