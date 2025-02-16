import express from 'express';
const app = express();
import mongo from 'mongodb';
const MongoClient = mongo.MongoClient;
import mime from 'mime';
import fs from 'node:fs';
import 'dotenv/config';
import passport from 'passport'
import session from 'express-session'
import GitHub from 'passport-github2';
const GitHubStrategy = GitHub.Strategy;
import cors from 'cors';
import {viteurl} from "../frontend/src/constants.js"


var allowedOrigins = ['http://localhost:3000', 'http://localhost:5173',
    'https://github.com'];

app.use(cors({
    origin: function(origin, callback){
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            console.log(origin);
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));


const{
    MONGO_USER,
    MONGO_PASS,
    MONGO_HOST,
    MONGO_DBNAME,
    MONGO_DBCOLLECTION,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    EXPRESS_SESSION_SECRET
} = process.env;

const dir  = "public/",
    port = 3000

app.use(session({
    secret: EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

//db password: mYPfcGTI98Bvc987

const url = "mongodb+srv://samuelwilensky:mYPfcGTI98Bvc987@samuelwilensky.r3mmr.mongodb.net/?retryWrites=true&w=majority&appName=SamuelWilensky";
const dbconnect = new MongoClient(url);
let accounts = null;
let collection = null;
let username = "guest";

async function run(){
    await dbconnect.connect().then(()=> console.log("Connected!"));
    accounts = await dbconnect.db("a4").collection("accounts");
    collection = await dbconnect.db("a4").collection("formData");
}

run();
app.use((req, res, next) => {
    if (accounts !== null) {
        next();
    } else {
        // Could not connect to the DB. Send an error.
        res.sendStatus(503);
    }
});

passport.serializeUser(function (user, done) {
    // I use user._id || user.id to allow for more flexibility of this with MongoDB.
    // If using Passport Local, you might want to use the MongoDB id object as the primary key.
    // However, we are using GitHub, so what we want is user.id
    // Feel free to remove the user._id || part of it, but the `user.id` part is necessary.
    done(null, { username: user.username, id: user._id || user.id });
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/github/callback"
    },
    async function (accessToken, refreshToken, profile, done) {
    if(username==="guest"){username = profile.username;}
    accounts.insertOne(profile);
        // This code will run when the user is successfully logged in with GitHub.
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));

async function deleteData(data){
    await collection.deleteOne({username:data.username, name:data.name});
}

async function insertData(data){
    await collection.insertOne(data);
}

async function updateData(data){
    const result = await collection.replaceOne({username:data.username, name:data.name}, data);

    if(result.modifiedCount === 0){
        console.log("inserting");
        console.log(data);
        await insertData(data);
    }
}

async function sendData(res){
    const results = await collection.find({username:username}).toArray();
    console.log("sending");
    console.log(results);
    res.end(JSON.stringify(results));
}

app.get('/auth/github/callback',
    passport.authenticate('github', { session: true, failureRedirect: '/' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/#/boardgames');
    });

app.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] }),
    function (req, res) {
    console.log("logging in with github");
        // Successful authentication, redirect home.
        //res.redirect('/#/boardgames');
    });

function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/");
    }
}

app.get('/', ensureAuth, (req, res) => {
    // User is logged in
    res.redirect(viteurl+"/#/boardgames");
    //res.sendFile(apiurl+"/frontend/index.html");
});

app.get("/", (req, res) => {
    // User is logged in
    if (req.user) {
        res.redirect(viteurl+"/#/boardgames");
    } else {
        // User is not logged in
        res.redirect(viteurl);
    }
});

app.get("/logout", (req, res) => {
    req.logout(() => { });
    res.redirect('/');
});

app.get("/load", ensureAuth, async (req, res) => {
    // Note that here I am using the username as the key.
    const userdata = await accounts.find({ username: req.user.username }).toArray();
    // What I am doing here is attaching the username to the front of the array
    // and then putting the rest of the data after the username
    res.json([{ username: req.user.username }, ...userdata]);
    console.log(userdata);
});

app.get('/', (req, res) => {
    handleGet(req, res);
})

app.post('/getuser', (req, res) => {
    res.end(username);
})

app.post('/submit', (req, res) => {
    let dataString = ""

    req.on("data", function (data) {

        dataString += data

    })


    req.on("end", function () {
        const data = JSON.parse(dataString);
        let insert = false;

        if (data.name !== "") {
            insert = true;
            const gamesPlayed = data.gamePlayed;
            var numGamesPlayed = 0;
            for (let i = 0; i < gamesPlayed.length; i++) {
                if (gamesPlayed[i]) numGamesPlayed++;
            }

            data.numGamesPlayed = numGamesPlayed;
        }

        res.writeHead(200, "OK", {"Content-Type": "text/plain"})

        if(insert && collection !== null){
            console.log("Sending data to database");
            updateData(data).then(()=>sendData(res));
        }
        else if(collection !== null){
            console.log("no data added");
            sendData(res);
        }
        else{
            console.log("database not found");
            res.end();
        }

    })
})

app.post('/delete', (req, res) => {
    let dataString = ""

    req.on("data", function (data) {

        dataString += data

    })

    req.on("end", function () {
        const rowName = JSON.parse(dataString);
        console.log("deleting " + rowName);
        deleteData(rowName).then(()=>sendData(res));
    })
})

const handleGet = function( request, response ) {
    const filename = dir + request.url.slice( 1 )

    if( request.url === "/" ) {
        sendFile( response, "index.html" )
    }else{
        sendFile( response, filename )
    }
}

const sendFile = function( response, filename ) {
    console.log(filename);

    const type = mime.getType( filename )

    fs.readFile( filename, function( err, content ) {

        // if the error = null, then we've loaded the file successfully
        if( err === null ) {

            // status code: https://httpstatuses.com
            response.writeHeader( 200, { "Content-Type": type })
            response.end( content )

        } else {

            // file not found, error code 404
            response.writeHeader( 404 )
            response.end( "404 Error: File Not Found" )

        }
    })
}


// process.env.PORT references the port that Glitch uses
// the following line will either use the Glitch port or one that we provided
app.listen( port || process.env.PORT)

