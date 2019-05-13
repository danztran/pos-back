const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');

// require with root path
global.requireWrp = p => require(path.resolve(__dirname, p));

// configs
const dbconfig = requireWrp('config/dbconfig');

// middlewares
const messageMiddleware = requireWrp('middlewares/message-middleware');
const errorHandlerMiddleware = requireWrp('middlewares/error-handler-middleware');

// routes
const authRouter = requireWrp('routes/auth-router');
const userRouter = requireWrp('routes/user-router');
const customerRouter = requireWrp('routes/customer-router');
const productRouter = requireWrp('routes/product-router');
const billRouter = requireWrp('routes/bill-router');

const app = express();
const port = process.env.POST || 8080;
const host = port === 8080 ? 'http://localhost:8080/' : '';

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
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

// passport - session
app.use(session({
	secret: 'tramanh4p47s',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(morgan('dev'));

// apply middleware
app.use(messageMiddleware);

// Use routes
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/customer', customerRouter);
app.use('/product', productRouter);
app.use('/bill', billRouter);

// error middleware
app.use(errorHandlerMiddleware);

app.get('/', (req, res) => res.send('Hello World!'));
