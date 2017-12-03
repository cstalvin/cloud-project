var express = require('express');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var app = express();
var url = require('url');
var assert = require('assert');
var Mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var SECRETKEY = 'I want to pass COMPS381F';
var router = express.Router();
var fs = require('fs-extra');
var formidable = require('formidable');
var ExifImage = require('exif').ExifImage;
var http = require('http');
var fs = require('fs');

var  url = 'mongodb://project:61561611@ds141524.mlab.com:41524/billybili';
var  multer = require('multer');
var  util = require('util');
var  upload = multer({limits: {fileSize: 2000000 },dest:'/uploads/'});
var detailsObjectId = '';
var owner = '';
var oname, oborough, ocuisine, ostreet, obuilding, ozip, ocoor = '';



MongoClient.connect("mongodb://project:61561611@ds141524.mlab.com:41524/billybili",function(err,db){
	if(err) throw err;
	console.log("Database Connected");
	console.log("OKOK");
    db.close();
	

});

app = express();
app.set('view engine','ejs');

var SECRETKEY1 = 'authenticated';
var SECRETKEY2 = 'username';


app.set('view engine','ejs');

// cookie-session middleware
app.use(session({
  name: 'session',
  keys: [SECRETKEY1,SECRETKEY2]
}));


MongoClient.connect("mongodb://project:61561611@ds141524.mlab.com:41524/billybili",function(err,db){
		
	var cursor = db.collection('data').find().toArray(function (err,result){
		
		products = result;
		
		
	});
	db.close();
});
	
app.set('view engine', 'ejs');

app.use("/read",function(req,res,next){
	if(req.session.username==null){
		console.log("Login first");
		res.render("login");
	}else{
		next();
	}
});
app.use("/add",function(req,res,next){
	if(req.session.username==null){
		console.log("Login first");
		res.render("login");
	}else{
		next();
	}
});

app.use("/create",function(req,res,next){
	if(req.session.username==null){
		console.log("Login first");
		res.render("login");
	}else{
		next();
	}
});		
app.use("/update",function(req,res,next){
	if(req.session.username==null){
		console.log("Login first");
		res.render("login");
	}else{
		next();
	}
});	
app.use("/showdetails", function(req,res,next) {
	if(req.session.username==null){
		console.log("Login first");
		res.render("login");
	}else{
		next();
	}
});	

app.get('/showdetails', function(req,res) {
	MongoClient.connect("mongodb://project:61561611@ds141524.mlab.com:41524/billybili",function(err,db){
	detailsObjectId = req.query._id;
	
	
	if (detailsObjectId) {
		for (i in products) {
			if (products[i]._id == detailsObjectId ) {
				var product = products[i];
				detailsObjectId = products[i]._id;
				owner = products[i].owner;
				oname = products[i].name;
				oborough = products[i].borough;
				ocuisine = products[i].cuisine;
				ostreet = products[i].address.street;
				obuilding = products[i].address.building;
				ozip = products[i].address.zip;
				ocoor = products[i].address.coord;

				break;
			}
		}
		if (product) {
				res.render('details', {c: product});
		} else {
			res.status(500).end(detailsObjectId+'not found!');
		}
	} else {
		   res.status(500).end('id missing!');
	}
	db.close();
	});
});


app.get('/read',function(req,res) {
	res.status(200);
	MongoClient.connect("mongodb://project:61561611@ds141524.mlab.com:41524/billybili",function(err,db){
		
	db.collection('data').find().toArray(function (err,result){
		products = result;
		res.render("list",{c:products, n:req.session.username});
	});
	db.close();
	});	
	
	
})

app.use(session({
  name: 'session',
  keys: [SECRETKEY1,SECRETKEY2]
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/',function(req,res) {
	console.log(req.session);
	if (!req.session.authenticated) {
		res.redirect('/login');
	} else {
		res.status(200);
		res.redirect('/read');
	}
});
app.get("/login",function(req,res){
	res.render("login");
});

app.post('/login',function(req,res) {
	MongoClient.connect("mongodb://project:61561611@ds141524.mlab.com:41524/billybili",function(err,db){
		var temp = {username:req.body.name,userpw:req.body.password}
		db.collection('account').findOne(temp,function(err,user){
			if (user==null){
			console.log(user);
			res.redirect('/login');
			}else{
				req.session.authenticated = true;
				req.session.username= user.username;
				
				
				console.log(req.session.username);
				
				res.redirect('/read');
				
			}	
		});
		db.close();
	});
});	

app.post('/logout',function(req,res) {
	req.session.authenticated = false;
	req.session = null;
	res.redirect('/');
});

app.get("/create", function(req,res) {
	res.status(200).render("create");
});

app.post("/create", function(req,res) {
        MongoClient.connect("mongodb://project:61561611@ds141524.mlab.com:41524/billybili",function(err,db){
	db.collection("account").insert({username:req.body.name, userpw:req.body.password});
         
        res.redirect('/login');    
	db.close();
});
});

app.get("/add", function(req,res) {
	res.status(200).render("add",{n:req.session.username});
	
});

var tempPhoto ;

app.post("/add", function(req,res) {

	var form = new formidable.IncomingForm();
	console.log(form);
	
    form.parse(req, function (err, fields, files) {
				var user= {};
				var grades = [{}];
				var photo = [{}];
				var coord=[{}];
				name = fields.name;
				borough=fields.borough;
				cuisine= fields.cuisine;
				street= fields.street;
				building= fields.building;
				zipcode= fields.zip;
				owner = fields.owner;
				
				var mimetype = files.photomt.type;
				MongoClient.connect("mongodb://project:61561611@ds141524.mlab.com:41524/billybili",function(err,db){
		
						db.collection("data").insert({
							name:name,
							borough:borough,
							cuisine:cuisine,
							photomt:mimetype,
							address:{
							street:street,
							building:building,
							zip:zipcode,
							coord,
							},
							owner,
							check:"0",
							grades,
							photo,
						});
						
						db.close();
				});
				console.log(user);


				  var filename = files.photomt.path;
				  var title = fields.title;
				
				  console.log("filename = " + filename);
				  console.log(filename);
				  
				  var exif = {};
					var image = {};
					image['image'] = filename;

				try {
				  new ExifImage(image, function(error, exifData) {
					if (error) {
					  console.log('ExifImage: ' + error.message);
					}
					else {
					  exif['image'] = exifData.image;
					  exif['exif'] = exifData.exif;
					  exif['gps'] = exifData.gps;
					 console.log( exifData.image);
					console.log( exifData.exif);
					console.log(exifData.gps);
					};
					
				  });
					} catch (error) { }
				fs.readFile(filename, function(err,data) {
					
					MongoClient.connect("mongodb://project:61561611@ds141524.mlab.com:41524/billybili",function(err,db) {
							var new_r = {};
							new_r['title'] = title;
							new_r['mimetype'] = mimetype;
							new_r['image'] = new Buffer(data).toString('base64');
							new_r['exif'] = exif;
							console.log(mimetype);
						
							Lat=new_r['exif'].gps.GPSLatitude[2];
							console.log(new_r['exif'].gps.GPSLatitude[2]);
							
							Lon=new_r['exif'].gps.GPSLongitude[2];
							console.log(new_r['exif'].gps.GPSLongitude[2]);
							
							var lat = gpsDecimal(
							new_r['exif'].gps.GPSLatitudeRef,  // direction
							new_r['exif'].gps.GPSLatitude[0],  // degrees
							new_r['exif'].gps.GPSLatitude[1],  // minutes
							new_r['exif'].gps.GPSLatitude[2],  // seconds
							);
							var lon = gpsDecimal(
							new_r['exif'].gps.GPSLongitudeRef,
							new_r['exif'].gps.GPSLongitude[0],
							new_r['exif'].gps.GPSLongitude[1],
							new_r['exif'].gps.GPSLongitude[2],
							);
							console.log(lat);
							console.log(lon);
							var coo ={};
							coo['lat']=lat;
							coo['lon']=lon;
							 db.collection("data").update({"name" : name },{$set:{"address.coord":coo}});

							console.log('image size: ' + new_r.image.length);
							if (new_r.image.length < 14000000) {
								db.collection("data").update({name:name},{$push:{photo:new_r}});
								insertPhoto(db,new_r,function(result){
								  db.close();
								  if (result) {
									console.log('Photo was inserted into MongoDB!');
								  } else {
									console.log('Photo too big! Unable to insert!');              
								  }
								});
							};

						db.close();	
					});
						  
					
				});
	});
		
		res.redirect('/read');  	
});
	

				




app.get("/rate", function(req,res) {
	res.status(200).render("rate");
});

app.get("/rateE", function(req,res) {
	res.status(200).render("rateError");
});

app.post("/rate", function(req,res) {
    MongoClient.connect("mongodb://project:61561611@ds141524.mlab.com:41524/billybili",function(err,db){
			var OID = detailsObjectId;
			var way1 = '';
			var count = 0;
			
			for (i in products) {
				console.log("find restaurant");
				if (products[i]._id == detailsObjectId) {
					var aRest = products[i];
					break;
				}
				console.log(aRest);
			}
			
			for(i in aRest.grades){
				if (aRest.grades[i].user == req.session.username) {
					console.log("repeated");
					count = count +1;
				}
			}

			if(count == 0){
				db.collection("data").update(
						{_id : detailsObjectId},
						{$push:{"grades":{"user":req.session.username, "score":req.body.score}}}
					);
				
				way1 = 'read';
			}else{
				way1 = 'rateE'
			}
			
			res.redirect(way1);
			db.close();
	});
});

app.get("/delete1", function(req,res) {
		console.log("delete get");
		res.status(200).render("delete");
});

app.get("/deleteE", function(req,res) {
	res.status(200).render("ownerError");
});

app.get("/delete", function(req,res) {
    console.log("delete post");
	
	MongoClient.connect("mongodb://project:61561611@ds141524.mlab.com:41524/billybili",function(err,db){
		
		console.log("delete start");
		
		var way = '';
		
		if(req.session.username == owner){
			console.log("delete");
			db.collection("data").deleteOne(
				{ "_id" : detailsObjectId } 
			);    
			way = 'delete1';
		}else{
			console.log("delete error");
			way = 'deleteE';
		}
			res.redirect(way);  			
		db.close();			
	});
});

app.get("/update", function(req,res) {
	console.log("update get");
	console.log(owner);
	res.status(200).render("update",{n:owner,a:oname,b:oborough,c:ocuisine,d:ostreet,e:obuilding,f:ozip,g:ocoor});
});

app.post("/update", function(req,res) {
	
	console.log("please login");	
	
    MongoClient.connect("mongodb://project:61561611@ds141524.mlab.com:41524/billybili",function(err,db){
		
		var grades = [{}];
		
		console.log("update post");
		
		
		if(req.session.username == owner){
			
			console.log("update start");
			
			db.collection("data").update(
			
				{ "_id" : detailsObjectId },
				
				{$set:{	name:req.body.name,
					borough:req.body.borough,
					cuisine:req.body.cuisine, 
					photomt:req.body.photomt,		
					
					"address.street":req.body.street,
					"address.building":req.body.building,
					"address.zip":req.body.zip,
					"address.coord":req.body.coord,			
					}
				}
			); 
			way = 'read';
			
		}else{
			console.log("update error");
			way = 'deleteE';
		}
		
		res.redirect(way);  
		
		
	
		db.close();			
	});
});

function insertPhoto(db,r,callback) {
  console.log('image size: ' + r.image.length);
  if (r.image.length < 14000000) {
	MongoClient.connect("mongodb://project:61561611@ds141524.mlab.com:41524/billybili",function(err,db){
    db.collection('photos').update({name:name},{$set:{photo:r}},function(err,result) {
      assert.equal(err,null);
      console.log("insert was successful!");
      console.log(JSON.stringify(result));
      callback(result);
	    });
	});
  };
};
function gpsDecimal(direction,degrees,minutes,seconds) {
  var d = degrees + minutes / 60 + seconds / (60 * 60);
  return (direction === 'S' || direction === 'W') ? d *= -1 : d;
}


app.get("/search", function(req,res) {
	console.log("search get");
	console.log(req.session.username);
	res.status(200).render("search",{n:req.session.username, c:products});
});

var query = '';

app.post("/search", function(req,res) {
	console.log("search post");
	MongoClient.connect("mongodb://project:61561611@ds141524.mlab.com:41524/billybili",function(err,db){
		
		var qName = ".*"+ req.body.name +".*";
		//name,borough,cuisine,address{street,building,zip},owner
		
			db.collection("data").find({ $or : [ { name :{$regex: qName} }, { cuisine :{$regex: qName} }, 
			{ borough:{$regex : qName} }, { "address.street" :{$regex: qName} }, { "address.building" :{$regex : qName}},
			{ "address.zip" :{$regex: qName }}, { owner:{$regex : qName }} ] }).toArray(function (err,result){
				
				showResult = result;

				console.log ('db start');

				res.render("search",{c:showResult, n:req.session.username});
			});

		db.close();
	});

});


app.listen(process.env.PORT || 8099);
