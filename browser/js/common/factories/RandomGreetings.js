app.factory('RandomGreetings', function () {

    var getRandomFromArray = function (arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    var greetings = [
        'Why get the milk for free when you can buy the cow??!',
        'Because Paying for things make you feel important!',
        'All the fun of Google with all the fun of paying for it!.',
        `Step 1 - We find Free things
        Step 2 - You pay a Fee for those things
        Step 3 - We make Money! `,
        `FREE???  GROSS
        FEE!!! NOT GROSS!!!`,
        'Now you can be the owner of your own google search!',
        'Because the best things in life are free with a surcharge!',
        `Because when you pay for things, it's usually better
        -KIN`,
        `Because paying for things is American and we need to make America great
        -Donald Trump`,
    ];

    return {
        greetings: greetings,
        getRandomGreeting: function () {
            return getRandomFromArray(greetings);
        }
    };

});
