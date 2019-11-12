var request = require('request-promise');
var mongoose = require( 'mongoose' );
require( './db' );
var GoHistory = mongoose.model( 'GoHistory' );
var spiderListUrl = "http://happyapp.huanle.qq.com/cgi-bin/CommonMobileCGI/TXWQFetchChessList?type=4&lastCode=%s&FindUserName=%s&uid=";
var spiderDetailUrl = "http://happyapp.huanle.qq.com/cgi-bin/CommonMobileCGI/TXWQFetchChess?chessid=";

let userList = new Set();
let chessList = new Set();
let queue = [[22448338],[],[],[],[],[],[]];
let pow = new Array(361);
function init() {
	let x = 1;
	let mod = 1000000007;
	for(let i = 0; i < 361; i++) {
		pow[i] = x;
		x *= 3;
		x %= mod;
	}
}
function trans(dan) {
	return Math.round((dan - 13)/2);
}

function getList(uid) {
	let url = spiderListUrl + uid;
	return request.get(url).then((str) => {
		let res = JSON.parse(str);
		if(res.result == 0) {
			let cnt = 0;
			res.chesslist.forEach((chess) => {
				//console.log(chess.chessid);
				if (!userList.has(chess.blackuid) && chess.blackdan >= 13 && queue[trans(chess.blackdan)].length < 1000) {
					userList.add(chess.blackuid);
					queue[trans(chess.blackdan)].push(chess.blackuid);
					//console.log('new user:' + chess.blackuid);
				}
				if (!userList.has(chess.whiteuid) && chess.whitedan >= 13 && queue[trans(chess.whitedan) < 1000]) {
					userList.add(chess.whiteuid);
					queue[trans(chess.whitedan)].push(chess.whiteuid);
					//console.log('new user:' + chess.whiteuid);
				}
				if (cnt <= 10) {
					//console.log('new chess:' + chess.chessid);
					cnt++;
					return getDetail(chess);
				}
			})
		}
	}).catch(err => console.log(err));
}

function getDetail(chess) {
	let url = spiderDetailUrl + chess.chessid;
	//console.log(url);
	return request.get(url).then((str) => {
		let res = JSON.parse(str);
		if (res.result == 0) {
			chess.val = parse(res.chess);
			return GoHistory(chess).save(err => {});
		}
	})
}

function parse(chess) {
	let str = chess.split(';');
	let hashValue = new Array(8).fill(0);
	addHashValue(str[2][2], str[2][3], 1, hashValue);
	addHashValue(str[3][2], str[3][3], 2, hashValue);
	addHashValue(str[4][2], str[4][3], 1, hashValue);
	addHashValue(str[5][2], str[5][3], 2, hashValue);
	//hashValue.forEach(ele => console.log(ele));
	return Math.min.apply(null, hashValue);
}

function addHashValue(x, y, color, hashValue) {
	x = x.charCodeAt() - 'a'.charCodeAt();
	y = y.charCodeAt() - 'a'.charCodeAt();
	//console.log(pow[19 * x + y]);
	hashValue[0] += color * pow[19 * x + y];
	hashValue[1] += color * pow[19 * (18 - x) + y];
	hashValue[2] += color * pow[19 * (18 - x) + (18 - y)];
	hashValue[3] += color * pow[19 * x + (18 - y)];
	let tmp = x;
	x = y;
	y = tmp;
	hashValue[4] += color * pow[19 * x + y];
	hashValue[5] += color * pow[19 * (18 - x) + y];
	hashValue[6] += color * pow[19 * (18 - x) + (18 - y)];
	hashValue[7] += color * pow[19 * x + (18 - y)];
}
async function main() {
	//init();
	let promiseList = [];
	while(1) {
		promiseList = [];
		for (let i = 0; i < 7; i++) {
			promiseList.push(getList(queue[i].pop()));
			if(queue[i].length == 0) continue;
			promiseList.push(getList(queue[i].pop()));
			if(queue[i].length == 0) continue;
			promiseList.push(getList(queue[i].pop()));
			if(queue[i].length == 0) continue;
			promiseList.push(getList(queue[i].pop()));
			if(queue[i].length == 0) continue;
			promiseList.push(getList(queue[i].pop()));
			if(queue[i].length == 0) continue;
			promiseList.push(getList(queue[i].pop()));
			if(queue[i].length == 0) continue;
			console.log(i + " " + queue[i].length);
		}
		await Promise.all(promiseList);
	}
}
init();
main().then(() => console.log('complete'));
//getDetail({chessid: "1565256953010001743"});
/*
{"chessid":"1566613444010001908",
"blackuid":7708756,"blacknick":"晚风残","blackenname":"晚风残","blackdan":17,"blackcountry":86,
"whiteuid":24083888,"whitenick":"V240838885","whiteenname":"V240838885","whitedan":17,"whitecountry":86,
"title":"","gamestarttime":1566612288,"gameendtime":1566613444,"winner":2,"point":9250,"reason":1,"movenum":286,
"boardsize":19,"handicap":0,"firstcolor":0,"komi":0,"clienttype":1,"commenttype":0,"additionalrule":0,"rule":0,
"blackocc":0,"whiteocc":0,"starttime":"2019-08-24 10:04:48","endtime":"2019-08-24 10:24:04","introduction":"",
"gametype":1,"favorite":0}*/