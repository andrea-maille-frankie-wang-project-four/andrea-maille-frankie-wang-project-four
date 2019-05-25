// namespace for app 
const app = {};
//store api endpoint and apikey
app.apiEndPoint = "https://api.walmartlabs.com/v1/search?";
app.apiKey = "rk3f9sm8az24zz3wf7e5sesc";
//print gaming interface using data from api call to DOM (with html strings and append them accordingly)
app.htmlStringMaking = function (dataArray){
    $('.game-content').empty();
    for(i=0;i<dataArray.length;i++){
        const data = dataArray[i];
        const $card = $('<fieldset>').addClass('card');
        const $productInfo = $('<div>').addClass('product-info');
        const $imageContainer = $('<div>').addClass('image-container');
        const $image = $(`<img class="product-image">`).attr('src',data.largeImage).attr("alt", "");
        const $name = $(`<p class="product-name">${data.name}</p>`);
        const $userGuessLabel = $(`<label for="user-guess" class="visually-hidden">Place your guess here</label>`); 
        const $userGuess = $(`<input type="text" id="user-guess" name="user-guess" placeholder="$0.00"></input>`);
        const $gameResults = $('<div>').addClass('game-results').addClass(`game-results-${i+1}`);
        $imageContainer.append($image);
        $productInfo.append($imageContainer, $name, $userGuessLabel, $userGuess);
        $card.append($productInfo, $gameResults);
        $('.game-content').append($card);
    }
    const $submitGuess = $(`<button class="submit-form">Submit</button>`);
    $('.game-content').append($submitGuess);
}
//using an event listener to store users' category choice and scroll down to game interface after api call has finished
app.selectCategory = function () {
    $('.start-game').on('click', function(event){
        event.preventDefault();
        const category = $('input[name=category]:checked').val();
        if (category === undefined){
            alert(`Please select your category of items`);
        } else {
            const selectedCategory = $('input[name=category]:checked').val();
            async function scrollDownApi (){ 
                const status = await app.apiCall(selectedCategory);
                if (status === true){
                    $('html, body').animate({
                    scrollTop: $('.game-content').offset().top
                    }, 2000);
                }
            }
            scrollDownApi();
        }
    })
}
//we randomly pick three indexes. We call 25 products back from Api, but in case of error, we only select from 20 items, and use the indexes to get products for users' game
app.randomChooseThree = function (dataArray) {
    const indexArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const chosenIndexArray = [];
    for (i = 1; i <= 3; i++) {
        const chosenIndex = Math.floor((Math.random() * (19 - i)) + 1);
        chosenIndexArray.push(indexArray[chosenIndex]);
        indexArray[chosenIndex] = indexArray[20 - i];
    }
    const selectedItems = [];
    chosenIndexArray.forEach(index => {
        selectedItems.push(dataArray[index]);
    })
    return selectedItems ;
}
//ajax calling api and process the raw data to make it more usable, then we call randomChooseThree method to get three products, changing currency to Canadian dollars, display game interface for users
app.apiCall = function(category) {
    $.ajax({
        url: app.apiEndPoint,
        method: 'GET',
        dataType: 'jsonp',
        data :{
            apiKey: app.apiKey,
            query:category,
            sort:"bestseller",
            numItems:25,

        }
    }).then(function (data) {
        const totalArrayRaw = data.items; 
        const totalArray = totalArrayRaw.filter(item=>item.salePrice!==undefined);
        const threeItems = app.randomChooseThree(totalArray);
        //it will hold a retail price array for later usages
        app.realPriceArray = [];
        threeItems.forEach(item=>{
         app.realPriceArray.push(+(item.salePrice * 1.35).toFixed(2));
        })
        console.log(app.realPriceArray);
        app.htmlStringMaking(threeItems);
    }).fail(function(error){
        alert("Sorry😢 api call failed, check back later please");
    })
    return true;
}
//after users submit the form, store users' input. Then, check if users have completed the form correctly, if not, prompt them to do so; if yes, render the results for them including the actual price and the difference between their guess and the sale price, providing them with a reset button at the same time.
app.storeUserInput =function (){
    $("form.game-content").on("click", ".submit-form", function(event){
        event.preventDefault();
        const userGuessArray = $("input[type='text']").map(function(index, input){
            return parseFloat($(input).val());
        });        
        let notNumber = false;
        for (let i=0; i< userGuessArray.length; i++){
            const number = userGuessArray[i];
            if (isNaN(number)){
                notNumber = true;
            }
        }
        if (notNumber === false) {
            $(".submit-form").addClass("hide");
            for (let i = 0; i < userGuessArray.length; i++) {
                const userGuessDecimal = +userGuessArray[i].toFixed(2);                
                //if users' guess the price exactly right, tell users they win
                if (userGuessDecimal === app.realPriceArray[i]) {
                    const $emotion = $(`<p><i class="far fa-laugh-squint"></i></p>`); 
                    const $feedbackSentence =$(`<p>YOU GUESS THE RIGHT PRICE! AMAZING!</p>`)
                    const $priceDifference = $(`<p class="price-difference-match">Price Difference: $0!</p>`)
                    const $retailPrice = $(`<p class="retail-price">Retail Price:${app.realPriceArray[i]}</p>`)
                    $(`.game-results-${i+1}`).append($emotion, $feedbackSentence, $priceDifference, $retailPrice);
                    //if users'  guess is five dollars lower than actual price, give them positive feedback
                } else if (app.realPriceArray[i] > userGuessDecimal && app.realPriceArray[i] - userGuessDecimal <= 5) {
                    const priceComparison = (app.realPriceArray[i] - userGuessDecimal).toFixed(2);
                    const $emotion = $(`<p><i class="far fa-smile-beam"></i></p>`);
                    const $feedbackSentence = $(`<p>You are only less than 5 dollars away!Good job!</p>`)
                    const $priceDifference = $(`<p class="price-difference-match">Price Difference: $${priceComparison}</p>`)
                    const $retailPrice = $(`<p class="retail-price">Retail Price:${app.realPriceArray[i]}</p>`)
                    $(`.game-results-${i + 1}`).append($emotion, $feedbackSentence, $priceDifference, $retailPrice);
                    //if users' guess is less than ten dollars away from actual price, semi-positive feedback for them
                } else if (app.realPriceArray[i] > userGuessDecimal && app.realPriceArray[i] - userGuessDecimal <= 10) {
                    const priceComparison = (app.realPriceArray[i] - userGuessDecimal).toFixed(2);
                    const $emotion = $(`<p><i class="far fa-grin"></i></p>`);
                    const $feedbackSentence = $(`<p>You are only less than 10 dollars away! Not bad</p>`)
                    const $priceDifference = $(`<p class="price-difference-match">Price Difference: $${priceComparison}</p>`)
                    const $retailPrice = $(`<p class="retail-price">Retail Price:${app.realPriceArray[i]}</p>`)
                    $(`.game-results-${i + 1}`).append($emotion, $feedbackSentence, $priceDifference, $retailPrice);
                    //if users' guess is over or more than ten dollars lower than actual price, 🙁
                } else {
                    if (app.realPriceArray[i] < userGuessDecimal) {
                        const priceComparison = (userGuessDecimal - app.realPriceArray[i]).toFixed(2);
                        const $emotion = $(`<p><i class="far fa-frown"></i></p>`);
                        const $feedbackSentence = $(`<p>You went over the retail price!</p>`)
                        const $priceDifference = $(`<p class="price-difference-match">Price Difference: $${priceComparison}</p>`)
                        const $retailPrice = $(`<p class="retail-price">Retail Price:${app.realPriceArray[i]}</p>`)
                        $(`.game-results-${i + 1}`).append($emotion, $feedbackSentence, $priceDifference, $retailPrice);
                    } else {
                        const priceComparison = (app.realPriceArray[i] - userGuessDecimal).toFixed(2);
                        const $emotion = $(`<p><i class="far fa-meh"></i></p>`);
                        const $feedbackSentence = $(`<p>You are really far away!</p>`)
                        const $priceDifference = $(`<p class="price-difference-match">Price Difference: $${priceComparison}</p>`)
                        const $retailPrice = $(`<p class="retail-price">Retail Price:${app.realPriceArray[i]}</p>`)
                        $(`.game-results-${i + 1}`).append($emotion, $feedbackSentence, $priceDifference, $retailPrice);
                    }
                }    
            }
            $(".game-content").append("<button class='replay'>Replay</button>");
        } else {
            alert('Oops! Check your answers, again!');
        }
    })
}
//when users click the reset button, scroll back to the header for user to select the category and then clear the game interface.
app.resetGame = function(){
    $("form.game-content").on("click", ".replay", function (event) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: $('.header-content').offset().top
        }, 500);
        setTimeout(function(){
            $(".game-content").empty();            
        },500);
    })
}
//initialize the game app
app.init = function() {
    app.selectCategory();
    app.storeUserInput();
    app.resetGame();
}
//call the init function after the page loads
$(function(){
    app.init();
})