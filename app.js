var twitter = require('ntwitter');

var twit = new twitter({
  consumer_key: 'I4Lgs7cO5PW0qoOFlJoBrg',
  consumer_secret: 'Z8lACmP2JgwQS9SqXUpePNJN8fkQ0NAgxn0zxKGA4',
  access_token_key: '1446626059-5ShUuke14R6uCpUTcEthg0evqGsHkzkeNhSq7P7',
  access_token_secret: 'MtS2SgdQDvhIHteDOlMXgn4Jz1T9E1yEMDlGDUPvk'
});
/*
var mongo = require("mongodb");
var host = "127.0.0.1";
var port = mongo.Connection.DEFAULT_PORT;
var db;
var ObjectId = require('mongodb').ObjectID;

// define database connection function 
var connect = function(){
	// Connect to database if we haven"t already
	if(!db){
		var db = new mongo.Db("Poetries", new mongo.Server(host,port),{safe:true});
		db.open(function(error){
			if(error)console.log(error);
			else{
				console.log("we connected to the database");
			}
		});
	}else{
		console.log("we are already connected");
	}

	// return database object
	return db;
}
db= connect();
*/

// database connect function for heroku
var mongo = require("mongodb").MongoClient;;
var dbConfig = require("./dbConfig.json");
var mongoUri = "mongodb://"+dbConfig.user+":"+dbConfig.pwd+"@ds053419.mongolab.com:53419/bantterdb";
var db;
var ObjectId = require('mongodb').ObjectID;
// define database connection function 
var connect = function(){""
	// Connect to database if we haven"t already
	if(!db){
		mongo.connect(mongoUri,function(err,myDB){
			if(err) console.log("database:"+ err);
			else db = myDB;
		})
	}else{
		console.log("we are already connected");
	}
	// insert our hard coded list of apps into the database
	// return database object
	return db;
}
db=connect();

var savePoetry = function( tweetList,term, callback){
		var collectNum = Math.floor((Math.random()*9));
		db.collection('poetries'+collectNum,function(err, poems){
			if(err) console.log(err);
			var toSave = {};
			toSave.collectionNum = collectNum;
			toSave.tweetList = tweetList;
			toSave.term = term;
			poems.save(toSave,function(err,doc){
					if(err)console.log(err);
					var id = doc._id;
					callback(collectNum,id);
			})

		});
}

var getPoetry = function(id, poemId, callback){
	console.log("collectionNum is :"+id+"poemId is:"+poemId);
	if(id.toString().length > 1 || poemId.toString.length() > 23 ){
		console.log("attempted hack");
		db.collection('poetries'+"0",function(err,poems){
			poems.findOne({},function(err, poem){
				console.log(poem);
				callback(poem);
			});
		});
	}
	else{
		db.collection('poetries'+id,function(err,poems){
			poems.findOne({_id: new ObjectId(poemId.toString())},function(err, poem){
				callback(poem);
			});
		});
	}
}
var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();
var server = http.createServer(app);
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.post('/search', function(req,res){
	var tweetList= [];
	var term = req.body.search
	twit.search(term, {"count": 10, "lang": "en"}, function(err, data){
		if (err)
			console.log(err);
		else{
			var results=data.statuses.length;
			 for(var i = 0; i <10; i++ ){
			 		if(tweetList.length == 5 ) break;
					var str = data.statuses[i].text;
					str=str.replace(/#/g , "").replace(/@/g , "").replace(/RT/g , "").replace(/:/g,"") ;
					var start = str.indexOf("http");
					if (start != -1)
							str = str.substring(0,start);
					if(str.indexOf(' ')== 0)
						str= str.substr(1);
					var newstr = str.replace(/[^a-zA-Z ,.?]/g, "");
					if(newstr.length != 0)
						str = newstr;
					str=str.substr(0, 1).toUpperCase().concat(str.substr(1).toLowerCase());
					if((tweetList.indexOf(str)== -1) || (results-i <= 5-tweetList.length) || results<10)
							tweetList.push( str);
				}
				savePoetry(tweetList,term,function(cNum,id,term){
					var returnObject= {};
					returnObject.collectionNum = cNum;
					returnObject.id= id;
					returnObject.tweetList = tweetList;
					returnObject.term = term;
					res.json(returnObject);

				});
			}
	});
});

app.get('/',function(req,res){
	res.render('index');

});

app.get('/getPoettry/:id',function(req,res){
	var id   = (req.params.id);
	console.log(id);
	var cNum = new String(id).charAt(0);
	
	console.log(cNum);
	id = id.toString();
	id = id.substr(1);
	console.log(id);
	getPoetry(cNum, id, function(poem){
		res.render('index',{data:poem});
	});


	

	return;

});


 server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
