require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

function isValidHttpUrl(stri) {
  try {
    const newUrl = new URL(stri);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

let mongoose=require('mongoose');

mongoose.connect(process.env .MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let urlSchema = new mongoose.Schema({
    originalUrl:{
    type: String,
    required: true},
    shortUrl: Number
});

let Url=mongoose.model("Url",urlSchema);

/*

let fcc = new Url({originalUrl:"https://www.freecodecamp.org",shortUrl:1});

fcc.save(function(error, data){
   if(error){console.log(error);}
   else {
        console.log(data);
      }
   }
);*/

let bodyParser = require('body-parser');
let resObj = {};

app.post('/api/shorturl', bodyParser.urlencoded({ extended: false }) , (req, res) => {
  
  let inputUrl = req.body['url']
  if(!isValidHttpUrl(inputUrl)){
  res.json({error: 'Invalid URL'});
  }
  
  resObj['original_url'] = inputUrl;
  
  let u = new Url({originalUrl:inputUrl})

  u.save((err,data)=>{
    if(err){console.log(err);}
    else{console.log(data);}
  });
  
  let short;
  
  Url.findOne({}).sort({shortUrl:'desc'}).exec((err,data)=>{
  if(err){console.log(err);}
  else{
   short=data.shortUrl+1;

    Url.findOneAndUpdate({originalUrl:inputUrl},{shortUrl: short}, {new:true},(err,data)=>{
      if(err){console.log(err);}
      else{
        resObj['short_url'] = data.shortUrl;
        res.json(resObj);
        }
    });
  }});
});

app.get('/api/shorturl/:input', (req, res) => {

  let input = req.params.input;
  Url.findOne({shortUrl: input}, (err, data) => {

    if(!err && data != undefined){
    res.redirect(data.originalUrl);}
    else
    {
      res.json('URL not found');
    }
  });
});
  

  