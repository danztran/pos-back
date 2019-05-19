require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
const ip = require('ip');
const compression = require('compression');
const FileStore = require('session-file-store')(session);

// require with root path
global.requireWrp = p => require(path.resolve(__dirname, p));

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
const port = process.env.PORT || 8080;
const production = process.env.NODE_ENV === 'production';

// connect database
mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true })
	.then(() => {
		app.listen(port, () => {
			console.log('- Listening on:',
				'\x1b[96m',
				`${ip.address()}:${port} - ${process.env.NODE_ENV}`,
				'\x1b[0m\n');
		});

	}).catch((err) => {
		console.log('ERROR: Failure connect to database ! \n', err);
	});


// using config
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
if (!production) {
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
		maxAge
	},
	store: new FileStore({
		path: './storage/sessions',
		secret: 'tramanh9p27s',
		ttl: maxAge / 1000,
		fileExtension: ''
	})
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


// apply middleware
app.use(messageMiddleware);

// Use routes
app.use(compression());
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
