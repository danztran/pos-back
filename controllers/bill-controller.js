const product = requireWrp('models/product.js');
// add product into db
// const mock_product = requireWrp('models/mock_product.json');
// let productAdd = new product();
// productAdd.save();
// product.create(mock_product); 

// product.find({}, function(err,res){
//   console.log(res.length);	
// });

// get data
var data = [];
product.find({}, function(req,res){data = data.concat(res);});
// get data

module.exports = {
  postProduct: function (req,res,next) {
    res.send(data);
  }
}