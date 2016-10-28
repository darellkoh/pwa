module.exports = function category(){

	var categoryServices = {};

	categoryServices.CATEGORIES = [ 
		"GOOGLE",
		"MEMES",
		"ONLY IN NYC",
		"GIFS",
		"BOTTLED WATER"
	];

	categoryServices.getCategoryId = function(category){
		return this.CATEGORIES.indexOf(category.toUpperCase()) + 1;
	}

	return categoryServices;
}();