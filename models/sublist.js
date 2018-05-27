var mongoose = require('mongoose');

var SublistSchema = new mongoose.Schema({
  list: [
    String
  ]
});

module.exports = mongoose.model('StockMarketSublist', SublistSchema);
