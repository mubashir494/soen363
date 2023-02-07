const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const output = require("./output.json");


async function retryTxn(n, max, client, operation,callback) {
  await client.query('BEGIN;');
  try {
    const result = await operation(client,callback);
    await client.query('COMMIT;');
    return result;
  } catch (err) {
    await client.query('ROLLBACK;');
    if (err.code !== '40001') {
      throw err;
    } else {
      console.log('Transaction failed. Retrying.');
      console.log(err.message);
      await new Promise(r => setTimeout(r, tries * backoffInterval));
    }
  }
}


function language (tweet,lang,tweetObj) {
  if(tweet.lang){
    if(lang.includes(tweet.lang)){
      tweetObj.lang_id = lang.indexOf(tweet.lang)
    }
    else{
      lang.push(tweet.lang);
      tweetObj.lang_id = lang.indexOf(tweet.lang);
    }
  }
}


function hash(tweet,hashtag,has){
  if(tweet.entities.hashtags != null){
    tweet.entities.hashtags.map((element) => {
      hasObj ={"tweetid" : tweet.id};
      if(hashtag.includes(element.tag)){
        hasObj.hashtag_id = hashtag.indexOf(element.tag);
      }
      else{
        hashtag.push(element.tag)
        hasObj.hashtag_id = hashtag.indexOf(element.tag);
      }
      has.push(hasObj);
    })

  }
}
function addUser (element,user,tweet){
  var found = false;
  user.map((element) => {
    if(element.id == tweet.author_id){
      found = true;
    }
  })
  if(found == false){
    var userObj = {"id" : tweet.author_id};
    element.includes.Users.map((element) => {
      if(element.id == tweet.author_id){
        if(element.name && element.username){
          userObj.name = element.name;
          userObj.username = element.username;
        }
      }
    })
    user.push(userObj);

  }
}



// Database Function 

async function insertTweets (client,callback,data){
  data.forEach((element) => {
    var addtweets = 'INSERT INTO tweets (id,tweetid,tweets_text,issue_id,lang_id) VALUES ($1,$2,$3,$4,$5)';
    const arr = [element.id,element.tweetid,element.tweet_text,element.issue_id,element.lang_id];
    client.query(addtweets,arr,callback);
  })
}
async function insertHashtags (client,callback,data){
  data.forEach((element,index) => {
    var addtweets = 'INSERT INTO hashtags (hashtag_id,hashtags_text) VALUES ($1,$2)';
    const arr = [index,element];
    client.query(addtweets,arr,callback);
  })
}

async function insertUsers (client,callback,data){
  data.forEach((element) => {
    var addtweets = 'INSERT INTO users (id,name,username) VALUES ($1,$2,$3)';
    const arr = [element.id,element.name,element.username];
    client.query(addtweets,arr,callback);
  })
}
async function insertLanguage (client,callback,data){
  data.forEach((element,index) => {
    var addLanguage = 'INSERT INTO language (lang_id,lang_name) VALUES ($1,$2)'
    const arr = [index,element];
    client.query(addLanguage,arr,callback);
  })
}

async function insertIssues(client,callback){
  var issues = ["Economic", "Social", "Political", "Health"];
  issues.forEach((element,index) => {
    var temp = [index,element];
    var addIssue = 'INSERT INTO Issues (issue_id,issue_type) VALUES ($1,$2)';
    client.query(addIssue,temp);
  })

}
async function insertHas (client,callback,data){
  data.forEach((element) => {
    var temp = [element.hashtag_id,element.tweetid]
    var addHas = 'INSERT INTO has (hashtag_id,tweetid) VALUES ($1,$2)';
    client.query(addHas,temp);
  })
}

async function getIssues(client, callback) {
  const iss = "SELECT * FROM Issues;"
  await client.query(iss, callback);
}
async function getlang(client, callback) {
  const lang = "SELECT * FROM language;"
  await client.query(lang, callback);
}
async function getUser(client, callback) {
  const lang = "SELECT * FROM users;"
  await client.query(lang, callback);
}
async function getHashtags(client, callback) {
  const lang = "SELECT * FROM hashtags;"
  await client.query(lang, callback);
}
async function getTweets(client, callback) {
  const lang = "SELECT * FROM tweets;"
  await client.query(lang, callback);
}
async function getHas(client, callback) {
  const lang = "SELECT * FROM has;"
  await client.query(lang, callback);
}



// Parse the collected Data
function parseData(client,callback) {
  var issues = ["Economic", "Social", "Political", "Health"];
  var eco = ["appreciate","bankrupt","bankruptcy","budget","capital","cash","competition","consumer","consumer", "goods","cost","crash","crash","credit","currency","debt","deficit","deposit","depression","economics","economy","finance","fiscal","fund","inflation","interest","invest","investment","loan"];
  var political = ["Zelensky","biden","putin","talks","embargo","votes","power","oil","gas","america","USA"];
  var social = ["Social","social","racism","Racism","crime","equality","social problems","poverty","inequality","education","population"];
  var health = ["health","Health","wound","mental health","emotional health","injury","injured","hospital"]
  var lang = [];
  var hashtag = [];
  var tweets = [];
  var user = [];
  var has = []
  var tweetIdArray = [];
  output.tweets.map((element) => {  
    element.data.map((tweet) => {
      if(!tweetIdArray.includes(tweet.id)){
      if(eco.some(keyword => tweet.text.includes(keyword))){
        tweetObj = {"id" : tweet.author_id,"tweetid" : tweet.id,"tweet_text": tweet.text,"issue_id" : 0}
        language(tweet,lang,tweetObj);
        hash(tweet,hashtag,has);
        addUser(element,user,tweet);
        tweetIdArray.push(tweet.id);
        tweets.push(tweetObj);
      }
      else if (social.some(keyword => tweet.text.includes(keyword))){
        tweetObj = {"id" : tweet.author_id,"tweetid" : tweet.id,"tweet_text": tweet.text,"issue_id" : 1}
        language(tweet,lang,tweetObj);
        hash(tweet,hashtag,has);
        addUser(element,user,tweet);
        tweetIdArray.push(tweet.id);
        tweets.push(tweetObj);

      }
      else if (political.some(keyword => tweet.text.includes(keyword))){
        tweetObj = {"id" : tweet.author_id,"tweetid" : tweet.id,"tweet_text": tweet.text,"issue_id" : 2}
        language(tweet,lang,tweetObj);
        hash(tweet,hashtag,has);
        addUser(element,user,tweet);
        tweetIdArray.push(tweet.id);
        tweets.push(tweetObj);
      }
      else if (health.some(keyword => tweet.text.includes(keyword))){
        tweetObj = {"id" : tweet.author_id,"tweetid" : tweet.id,"tweet_text": tweet.text,"issue_id" : 3}
        language(tweet,lang,tweetObj);
        hash(tweet,hashtag,has);
        addUser(element,user,tweet);
        tweetIdArray.push(tweet.id);
        tweets.push(tweetObj);
      }
    }
    })
  })
  
  // insertIssues(client,callback)
  getIssues(client,callback);
  // insertLanguage(client,callback,lang)
  getlang(client,callback)
  // insertUsers(client,callback,user);
  getUser(client,callback);
  // insertHashtags(client,callback,hashtag);
  getHashtags(client,callback);
  // insertTweets(client,callback,tweets);
  getTweets(client,callback)
  // insertHas(client,callback,has)
  getHas(client,callback);


}

// Run the transactions in the connection pool
(async () => {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString,
    application_name: "$ docs_simplecrud_node-postgres",
  });

  // Connect to database
  const client = await pool.connect();

  // Callback
  function cb(err, res) {
    if (err) throw err;
    if (res.rows.length > 0) {
      res.rows.forEach((row) => {
        console.log(row);
      });
    }
  }
  await retryTxn(0, 15, client, parseData, cb);
  // Exit program
  process.exit();
})().catch((err) => console.log(err.stack));