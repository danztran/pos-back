const env = require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
const FileStore = require('session-file-store')(session);

// require with root path
global.requireWrp = p => require(path.resolve(__dirname, p));

// configs
const dbconfig = requireWrp('config/dbconfig');

// middlewares
const messageMiddleware = requireWrp('middlewares/message-middleware');
const errorHandlerMiddleware = requireWrp('middlewares/error-handler-middleware');
const vueRouterMiddleware = requireWrp('middlewares/vue-router-middleware');

// routes
const authRouter = requireWrp('routes/auth-router');
const userRouter = requireWrp('routes/user-router');
const customerRouter = requireWrp('routes/customer-router');
const productRouter = requireWrp('routes/product-router');
const billRouter = requireWrp('routes/bill-router');
const activityLogRouter = requireWrp('routes/activity-log-router');

const app = express();
const post = process.env.POST;
const port = post || 8080;
process.env.NODE_ENV = !!post ? 'production' : 'development';

const host = port ? 'http://localhost:8080/' : 'Online server';

// connect database
mongoose.set('useCreateIndex', true);
mongoose.connect(dbconfig.uri, { useNewUrlParser: true }).then(() => {
	app.listen(port, () => {
		console.log('\n- Listening on:',
		            '\x1b[96m',
		            host,
		            '\x1b[0m\n');
	});
}).catch((err) => {
	console.log('ERROR: Failure connect to database ! \n', err);
});


// using config
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
if (!post) {
	app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
	app.use(morgan('dev'));
}

// passport - session
const maxAge = 1800000;
app.use(session({
	name: '_cn_s',
	secret: 'tramanh4p47s',
	resave: true,
	saveUninitialized: false,
	cookie: {
		maxAge: maxAge
	},
	store: new FileStore({
		path: './storage/sessions',
		secret: 'tramanh9p27s',
		ttl: maxAge/1000,
		fileExtension: ''
	}),
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


// apply middleware
app.use(messageMiddleware);

// Use routes
app.use(express.static('public'));
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/customer', customerRouter);
app.use('/product', productRouter);
app.use('/bill', billRouter);
app.use('/activity-log', activityLogRouter);
app.use(vueRouterMiddleware);

// error middleware
app.use(errorHandlerMiddleware);