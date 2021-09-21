const express = require('express')
const mongoose = require('mongoose');
const redis = require('redis')
const session = require('express-session')
const cors = require('cors');
let RedisStore = require('connect-redis')(session)
const { MONGO_USER,MONGO_PASSWORD,MONGO_PORT,MONGO_IP, REDIS_URL, REDIS_PORT, SESSION_SECRET} = require('./config/config');
let redisClient = redis.createClient({
    host : REDIS_URL,
    port : REDIS_PORT
})

const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes')
const app = express()

const mongoUrl = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
    mongoose
    .connect(mongoUrl,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('successfully connected to DB'))
    .catch((e) =>  { 

        console.log(e);
        setTimeout(connectWithRetry,5000);
    });
}

connectWithRetry();

app.enable("trust proxy");
app.use(cors());
app.use(session({
    store : new RedisStore({client:redisClient}),
    secret : SESSION_SECRET,
    cookie : {
        secure : false,
        resave : false,
        saveUninitialized : false,
        httpOnly : true,
        maxAge : 24 * 60 * 60
    }

}))
app.get('/api/v1',(req,res) => {
    res.send('Hii From Testing In Core Docker!!');
    console.log("Yeah it rain");
})
app.use(express.json());
app.use('/api/v1/posts',postRouter);
app.use('/api/v1/users',userRouter);

const PORT = process.env.PORT || 5000

app.listen(PORT,() => {
    console.log("Server Started")
});