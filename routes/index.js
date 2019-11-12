const express = require('express');
const router = express.Router();
var rp = require('request-promise');
const request = require('request');
const mongoose = require( 'mongoose' );
const GoHistory = mongoose.model( 'GoHistory' );

/* GET home page. */


router.get('/', function(req, res, next) {
	let lower = Number(req.query.lower) || 0,
		higher = Number(req.query.higher) || 100;
	console.log(lower, higher);
	GoHistory.aggregate([
	 	{
		  	$match:
		    {
		    	'blackdan': { $gte: lower, $lte: higher },
		    	'whitedan': { $gte: lower, $lte: higher }
		    }
		},
	  	{$group : {_id : {val:"$val",winner:"$winner"}, count: {$sum : 1}}},{$sort:{"count":-1}},
	  	{$limit : 30}
	], (err, result) => {
		console.log(result);
		res.render('index', { lower: lower, higher: higher, result: result, req: req, res: res});	
	});
});

router.get('/val/:val', function(req, res, next) {
	let val = req.params.val;
	let lower = Number(req.query.lower) || 0,
		higher = Number(req.query.higher) || 100;
	GoHistory.find({val: val, blackdan: { $gte: lower, $lte: higher },whitedan: { $gte: lower, $lte: higher }})
	.limit(30)
	.exec((err, result) => {
		console.log(result);
		res.render('val', { lower: lower, higher: higher, result: result, req: req, res: res, val: val});	
	});
});

router.get('/board/:id', function(req, res, next) {
	let id = req.params.id;
	let url = "http://happyapp.huanle.qq.com/cgi-bin/CommonMobileCGI/TXWQFetchChess?chessid=" + id;
	rp.get(url).then((str) => {
		let result = JSON.parse(str);
		console.log(result);
		if (result.result != 0) res.send('get result failed');	
		else {
			res.send(result.chess);
		}
	})
});

module.exports = router;
