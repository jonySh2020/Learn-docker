const express = require("express");
const { default: mongoose } = require("mongoose");
const cors = require('cors')

const session = require("express-session");
const redis = require("redis");
// let RedisStore = require("connect-redis")(session);
let RedisStore = require("connect-redis").default;

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
} = require("./config/config");

let redisClient = redis.createClient({
  host: REDIS_URL,
  port: REDIS_PORT,
});
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

// go to the docker inspect <container-name> to see the real ip address of the mongo container.
// see the docker network ls
// you can inspact selected networks using : docker network inspect <name_of_network>
// we can ping other container by its name : --- inside the same docker network.
// check the inspect of the individual container also.

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

function retryConnection() {
  mongoose
    .connect(mongoURL)
    .then(() => console.log("successfully connected to DB"))
    .catch((e) => {
      console.log(e);
      setTimeout(retryConnection, 5000);
    });
}

retryConnection();

app.enable("trust proxy")
app.use(cors())

app.use(
  session({
    store: new RedisStore({
      client: redisClient,
    }),
    secret: SESSION_SECRET,
    cookie: {
      secure: false,
      resave: false,
      saveUninitialized: false,
      httpOnly: true,
      maxAge: 30000,
    },
  })
);
app.get("/", (req, res) => {
  res.send("Hello Dev");
});

app.use(express.json());
app.use("/api/v1/posts", postRouter);

app.use(express.json());
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on the port ${port}`));
