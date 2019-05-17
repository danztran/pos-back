module.exports = {
	apps: [{
		name: 'pos',
		script: 'app.js',
		instances: 4,
		autorestart: true,
		ignore_watch: ["node_modules", "public", "storage"],
		max_memory_restart: '1G',
		log_date_format: "YYYY-MM-DD HH:mm Z",
		error_file: "./storage/logs/error.log",
		merge_logs: true,
		env: {
			NODE_ENV: 'development'
		},
		env_production: {
			NODE_ENV: 'production'
		}
	}],
};
