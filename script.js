// namespace for app 
const app = {};
//store api endpoint and apikey
app.apiEndPoint = "https://api.walmartlabs.com/v1/search?";
app.apiKey = "rk3f9sm8az24zz3wf7e5sesc";
//we randomly pick three indexes. We call 25 products back from Api, but in case of error, we only select from 20 items, and use the indexes to get products for users' game
app.randomChooseThree = function (dataArray) {
    const indexArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const chosenIndexArray = [];
    for (i = 1; i <= 3; i++) {
        const chosenIndex = Math.floor((Math.random() * (20 - i)) + 1);
        chosenIndexArray.push(indexArray[chosenIndex]);
        indexArray[chosenIndex] = indexArray[20 - i];
    }
    const selectedItems = [];
    chosenIndexArray.forEach(index => {
        selectedItems.push(dataArray[index]);
    })
    return selectedItems;
}
//print gaming interface using data from api call to DOM (with html strings and append them accordingly)
app.htmlStringMaking = function (dataArray){
    $('.game-content').empty();
    for(i=0;i<dataArray.length;i++){
        const data = dataArray[i];
        const $card = $('<fieldset>').addClass('card').attr(`tabindex`, `${2+i*5+1}`);
        const $productInfo = $('<div>').addClass('product-info');
        const $imageContainer = $('<div>').addClass('image-container');
        const $image = $(`<img class="product-image">`).attr('src',data.largeImage).attr("alt", "");
        const $name = $(`<p class="product-name">${data.name}</p>`).attr(`tabindex`,`${2 +i*5+2}`);
        const $userGuessLabel = $(`<label for="user-guess" class="visually-hidden" aria-hidden="true">Place your guess here</label>`).attr(`tabindex`,`${2 +i*5+3}`);
        const $userGuess = $(`<input type="text" id="user-guess" name="user-guess" aira-hidden="true" placeholder="$0.00"></input>`).attr(`tabindex`, `${2+i*5+4}`);
        const $gameResults = $('<div>').addClass(`game-results game-results-${i + 1}`).attr({
            "tabindex":`${2+i*5+5}`,
            "aria-live":"polite",
            "role":"status"
        })
        $imageContainer.append($image);
        $productInfo.append($imageContainer, $name, $userGuessLabel, $userGuess);
        $card.append($productInfo, $gameResults);
        $('.game-content').append($card);
    }
    const $submitGuess = $(`<button class="submit-form">Submit</button>`).attr(`tabindex`,`18`);
    $('.game-content').append($submitGuess).addClass('game-shown');
}
//ajax calling api and process the raw data to make it more usable, then we call randomChooseThree method to get three products, changing currency to Canadian dollars, display game interface for users. if the api call fails, show an alert for users.
app.apiCall = function (category) {
    $.ajax({
        url: app.apiEndPoint,
        method: 'GET',
        dataType: 'jsonp',
        data: {
            apiKey: app.apiKey,
            query: category,
            sort: "bestseller",
            numItems: 25,

        }
    }).then(function (data) {
        const totalArrayRaw = data.items;
        const totalArray = totalArrayRaw.filter(item => item.salePrice !== undefined);
        const threeItems = app.randomChooseThree(totalArray);
        //the realPriceArray property will hold a retail price array scoped on the app object for later usages
        app.realPriceArray = [];
        threeItems.forEach(item => {
            app.realPriceArray.push(+(item.salePrice * 1.35).toFixed(2));
        })
        app.htmlStringMaking(threeItems);
    }).fail(function (error) {
        Swal.fire({
            title: 'Aaah',
            background: '#ffe438',
            text: '😢Sorry, failed to get API data back, please check back later.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#349052',
        })
    })
    return true;
}
//using an event listener to store users' category choice and scroll down to game interface after api call has finished. The game content won't load again unless users finish the game. If users click the button without choosing a category, an alert will prompt them to select one.
app.selectCategory = function () {
    $('.start-game').on('click', function(event){
        event.preventDefault();
        const category = $('input[name=category]:checked').val();
        if (category !== undefined && $('.game-content').hasClass("game-shown") === false){
            async function scrollDownApi() {
                const status = await app.apiCall(category);
                if (status === true) {
                    $('html, body').animate({
                        scrollTop: $('.game-content').offset().top
                    }, 2000);
                }
            }
            scrollDownApi();
        } else if ($('.game-content').hasClass("game-shown")) {
            $('html, body').animate({
                scrollTop: $('.game-content').offset().top
            }, 1000);
        }else {
            Swal.fire({
                title: 'Ooops',
                background: '#ffe438',
                text: 'Please select a category to continue',
                confirmButtonText: 'OK',
                confirmButtonColor: '#349052',
            })
        }
    })
}
//after users submit the form, store users' input. Then, check if users have completed the form correctly, if not, prompt them to do so with an alert; if yes, render the results for them including the actual price and the difference between their guess and the sale price, providing them with a reset button at the same time.
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
            //hide the submit button from users after they submit their guess so they can only replay the game by clicking the reset button
            $(".submit-form").addClass("hide");
            for (let i = 0; i < userGuessArray.length; i++) {
                const userGuessDecimal = +userGuessArray[i].toFixed(2);                
                //if users' guess the price exactly right, tell users they win
                if (userGuessDecimal === app.realPriceArray[i]) {
                    const $emotion = $(`<p><i aria-hidden="true" class="far fa-laugh-squint"></i></p>`); 
                    const $feedbackSentence =$(`<p>YOU GUESS THE RIGHT PRICE! AMAZING!</p>`).attr( `tabindex`, 18+i*3+1);
                    const $priceDifference = $(`<p class="price-difference-match">Price Difference: $0!</p>`).attr(`tabindex`,18+i*3+2);
                    const $retailPrice = $(`<p class="retail-price">Retail Price:$${app.realPriceArray[i]}</p>`).attr(`tabindex`, 18+i*3+3);
                    $(`.game-results-${i+1}`).append($emotion, $feedbackSentence, $priceDifference, $retailPrice);
                    //if users'  guess is five dollars lower than actual price, give them positive feedback
                } else if (app.realPriceArray[i] > userGuessDecimal && app.realPriceArray[i] - userGuessDecimal <= 5) {
                    const priceComparison = (app.realPriceArray[i] - userGuessDecimal).toFixed(2);
                    const $emotion = $(`<p><i aria-hidden="true" class="far fa-smile-beam"></i></p>`);
                    const $feedbackSentence = $(`<p>You are only less than 5 dollars away!Good job!</p>`).attr(`tabindex`, 18+i*3+1);
                    const $priceDifference = $(`<p class="price-difference-match">Price Difference: $${priceComparison}</p>`).attr(`tabindex`,18+i*3+2);
                    const $retailPrice = $(`<p class="retail-price">Retail Price:$${app.realPriceArray[i]}</p>`).attr(`tabindex`, 18+i*3+3);
                    $(`.game-results-${i + 1}`).append($emotion, $feedbackSentence, $priceDifference, $retailPrice);
                    //if users' guess is less than ten dollars away from actual price, semi-positive feedback for them
                } else if (app.realPriceArray[i] > userGuessDecimal && app.realPriceArray[i] - userGuessDecimal <= 10) {
                    const priceComparison = (app.realPriceArray[i] - userGuessDecimal).toFixed(2);
                    const $emotion = $(`<p><i aria-hidden="true" class="far fa-grin"></i></p>`);
                    const $feedbackSentence = $(`<p>You are only less than 10 dollars away! Not bad</p>`).attr(`tabindex`, 18+i*3+1);
                    const $priceDifference = $(`<p class="price-difference-match">Price Difference: $${priceComparison}</p>`).attr(`tabindex`,18+i*3+2);
                    const $retailPrice = $(`<p class="retail-price">Retail Price:$${app.realPriceArray[i]}</p>`).attr(`tabindex`, 18+i*3+3);
                    $(`.game-results-${i + 1}`).append($emotion, $feedbackSentence, $priceDifference, $retailPrice);
                    //if users' guess is over or more than ten dollars lower than actual price, 🙁
                } else {
                    if (app.realPriceArray[i] < userGuessDecimal) {
                        const priceComparison = (userGuessDecimal - app.realPriceArray[i]).toFixed(2);
                        const $emotion = $(`<p><i aria-hidden="true" class="far fa-frown"></i></p>`);
                        const $feedbackSentence = $(`<p>You went over the retail price!</p>`).attr(`tabindex`, 18+i*3+1);
                        const $priceDifference = $(`<p class="price-difference-match">Price Difference: $${priceComparison}</p>`).attr(`tabindex`,18+i*3+2);
                        const $retailPrice = $(`<p class="retail-price">Retail Price:$${app.realPriceArray[i]}</p>`).attr(`tabindex`, 18+i*3+3);
                        $(`.game-results-${i + 1}`).append($emotion, $feedbackSentence, $priceDifference, $retailPrice);
                    } else {
                        const priceComparison = (app.realPriceArray[i] - userGuessDecimal).toFixed(2);
                        const $emotion = $(`<p><i aria-hidden="true" class="far fa-meh"></i></p>`);
                        const $feedbackSentence = $(`<p>You are really far away!</p>`).attr(   `tabindex`, 18+i*3+1);
                        const $priceDifference = $(`<p class="price-difference-match">Price Difference: $${priceComparison}</p>`).attr(`tabindex`,18+i*3+2);
                        const $retailPrice = $(`<p class="retail-price">Retail Price:$${app.realPriceArray[i]}</p>`).attr(`tabindex`, 18+i*3+3);
                        $(`.game-results-${i + 1}`).append($emotion, $feedbackSentence, $priceDifference, $retailPrice);
                    }
                }    
            }
            const $replayButton =$("<button class='replay'>Replay</button>").attr(`tabindex`,`28`);
            $(".game-content").append($replayButton);
        } else {
            Swal.fire({
                title: 'Oops',
                background: '#ffe438',
                text: 'Please check your answers!',
                confirmButtonText: 'OK',
                confirmButtonColor: '#349052',
            })
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
            $(".game-content").empty().removeClass('game-shown');            
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