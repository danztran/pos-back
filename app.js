const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport')
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
const billRouter = requireWrp('routes/bill-router');

const app = express();
const port = process.env.POST || 8080;

// connect database
mongoose.connect(dbconfig.uri, {useNewUrlParser: true}).then(() => {
	console.log("Connected to Database");
}).catch((err) => {
	console.log("Not Connected to Database ERROR! \n", err);
});

// using config
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));

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

//Use routes
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/customer', customerRouter);
app.use('/bill',billRouter);
// error middleware
app.use(errorHandlerMiddleware);

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(port, () => console.log(`Listening on port ${port}!!!!!!`));