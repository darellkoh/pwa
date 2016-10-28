var categoryServices = require('./category');

module.exports = function category(){

	var productServices = {};

	var googleProducts = [
		{ name: 'google search', description: 'A google search.', photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmI9r98mG_AzE4MCjgX_u2vKLlbyWYjbwohcyAWu2nLLsjtRRu' },
		{ name: 'google account', description: 'Create a google account.', photo:'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTZ_h6mR5hWJiaklMzJDNpEiDy6yPTAbYmq8OnMSjfxnuSJHx8lwg' },
		{ name: 'google map search', description: 'A google map search.', photo: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTtvibFv_GgWXI4gv3oa4uwOTDhPXZw39I0OP2XpiLl7JZ4P18tEQ' },
		{ name: 'google word doc', description: 'A google word doc.', photo: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRtLAxUpfgbZCKCdhlPAU7zxGtMMJKk1uQQt5OW8ISTWLzkRQAH1g' },
	];

	var memeProducts = [
		{ name: 'Spock LLAP', description: 'Spok live long and prospurr meme', photo: 'https://thechive.files.wordpress.com/2016/07/5cac62b3c3b07cc981cc080d1364adc0.jpg?quality=85&strip=info&w=600&h=443&crop=1' },
		{ name: 'Simple Meth', description: 'Simple meth meeme.', photo:'https://i.imgflip.com/10kq3n.jpg' },
		{ name: 'Dwight Schrewt', description: 'Dwight Schrewt meme.', photo: 'https://s-media-cache-ak0.pinimg.com/564x/13/e0/ce/13e0cef23c4323e8d32be0e6322be99a.jpg' },
		{ name: 'Trump Gatorade', description: 'Trump make America great again.', photo: 'http://www.rantpolitical.com/wp-content/uploads/2015/08/trump-gatorade.png' },
	];

	var gifProducts = [
		{ name: 'Mario', description: 'Mario GIF', photo: 'https://media4.giphy.com/media/GNvWw0pDL6QRW/200w.gif' },
		{ name: 'Andy Dwyer', description: 'Andy Dwyer GIF', photo:'https://media1.giphy.com/media/5VKbvrjxpVJCM/200w.gif' },
		{ name: 'Trump', description: 'Trump GIF', photo: 'https://media2.giphy.com/media/wJNGA01o1Zxp6/200w.gif' },
		{ name: 'Homer', description: 'Homer GIF', photo: 'https://media2.giphy.com/media/jUwpNzg9IcyrK/200w.gif' },
	];

	var arrayOfStates = ['Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia','Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

	var bottledWaterProducts = function(){
		return arrayOfStates.map(function(stateName){
			return { name: stateName + ' Water', description: 'Water from ' + stateName + '! Right from the tap!', photo: 'http://www.ethicalconsumer.org/portals/0/images/reports/292982_large.jpg'}
		})
	}();

	var generateRandomPrice = function(){
		var MAX = 1000;
		var MIN = 1;

		return Math.floor( Math.random() * MAX - MIN ) + MIN * 100;
	}

	var productDBStructure = function( name, description, category, photo){
		this.name = name;
		this.description = description;
		this.price = generateRandomPrice();
		this.qtyInStock = generateRandomPrice();
		this.categoryId = categoryServices.getCategoryId(category);
		this.photo = photo;
	};

		productServices.PRODUCTS = function(){

		var productsArr = [];

		googleProducts.forEach(function(googleProduct){
			productsArr.push(new productDBStructure(
									googleProduct.name,
									googleProduct.description,
									"GOOGLE",
									googleProduct.photo));
		})

		memeProducts.forEach(function(memeProduct){
			productsArr.push(new productDBStructure(
									memeProduct.name,
									memeProduct.description,
									"MEMES",
									memeProduct.photo));
		})

		gifProducts.forEach(function(gifProduct){
			productsArr.push(new productDBStructure(
									gifProduct.name,
									gifProduct.description,
									"GIFS",
									gifProduct.photo));
		})

		bottledWaterProducts.forEach(function(bottledWaterProduct){
			productsArr.push(new productDBStructure(
									bottledWaterProduct.name,
									bottledWaterProduct.description,
									"BOTTLED WATER",
									bottledWaterProduct.photo));
		})
		

		return productsArr;
	}

	return productServices;
}();