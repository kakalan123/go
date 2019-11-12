var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var GoHistory = new Schema({
    chessid: { type : String , unique : true, required : true, dropDups: true },
    blackuid: Number,
    blackdan: Number,
    whiteuid: Number,
    whitedan: Number,
    winner: Number,
    val: Number
});


mongoose.model( 'GoHistory', GoHistory );
mongoose.connect( 'mongodb://localhost/go' , { useNewUrlParser: true });
