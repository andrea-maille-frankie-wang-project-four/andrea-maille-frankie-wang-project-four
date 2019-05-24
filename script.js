// namespace for app 
const app = {};

app.apiEndPoint = "https://api.walmartlabs.com/v1/search?";
app.apiKey = "rk3f9sm8az24zz3wf7e5sesc";
app.smoothScroll = function () {

    $('.replay').smoothScroll({

        autoFocus: false,

        easing: 'swing',

        speed: '400',

    });

},
app.realPriceArray =[];

app.htmlStringMaking = function (dataArray){
    $('.game-content').empty();
    for(i=0;i<dataArray.length;i++){
        const data = dataArray[i];
        const $card = $('<fieldset>').addClass('card');
        const $productInfo = $('<div>').addClass('product-info');
        const $imageContainer = $('<div>').addClass('image-container');
        const $image = $(`<img class="product-image">`).attr('src',data.largeImage).attr("alt", "");
        const $name = $(`<p class="product-name">${data.name}</p>`); 
        const $userGuess = $(`<input type="text" id="userGuess" name="userGuess" placeholder="Guess the Price"></input>`);
        const $userGuessLabel = $(`<label for="userGuess" class="visually-hidden">Guess the price of the item</label>`);
        const $gameResults = $('<div>').addClass('game-results').addClass(`game-results-${i+1}`);

        $imageContainer.append($image);

        $productInfo.append($imageContainer, $name, $userGuess, $userGuessLabel);

        $card.append($productInfo, $gameResults);

        $('.game-content').append($card);
    }
    // dataArray.forEach(data => {
    //     const $card = $('<fieldset>').addClass('card');
    //     const $productInfo = $('<div>').addClass('product-info');
    //     const $imageContainer = $('<div>').addClass('image-container');
    //     const $image = $(`<img class="product-image">`).attr('src',data.largeImage);
    //     const $name = $(`<p class="product-name">${data.name}</p>`); 
    //     const $userGuess = $(`<input type="text" id="userGuess" name="userGuess" placeholder="Guess the Price"></input>`);
    //     const $userGuessLabel = $(`<label for="userGuess" class="visually-hidden">Guess the price of the item</label>`);
    //     const $gameResults = $('<div>').addClass(`game-results-${i+1}`);

    //     $imageContainer.append($image);

    //     $productInfo.append($imageContainer, $name, $userGuess, $userGuessLabel, $gameResults);

    //     $card.append($productInfo);
        
    //     $('.game-content').append($card);
    // })
    
    const $submitGuess = $(`<button class="submit-form">Submit</button>`);

    $('.game-content').append($submitGuess);
}

app.selectCategory = function () {
    $('.start-game').on('click', function(event){

        event.preventDefault();

        // store user category choice
        const category = $('input[name=category]:checked').val();

        if (category === undefined){
            alert(`Please select your category of items`);
        } else {
            const selectedCategory = $('input[name=category]:checked').val();
            // app.apiCall(selectedCategory);
            async function scrollDownApi (){ 
                const status = await app.apiCall(selectedCategory);
                console.log(status);
                
                if (status === true){
                    $('html, body').animate({
                    scrollTop: $('.game-content').offset().top
                    }, 2000);
                }
            }
            scrollDownApi();
        }

        // $('html, body').animate({
        //     scrollTop: $('.game-content').offset().top
        // }, 3000);


    })
}
// 


app.randomChooseThree = function (dataArray) {
    // indexArray is 20 though we ask for 25 items, in case of error
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

    console.log(chosenIndexArray);
    
    return selectedItems ;

}

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
        const totalArray = data.items; 
        
        const threeItems = app.randomChooseThree(totalArray);
        console.log(threeItems);
        
    //     app.realPriceArray = threeItems.map(function (item) {
    //     return Number(item.salePrice*1.35.toFixed(2));
       
    // })
        app.realPriceArray =[];
        threeItems.forEach(item=>{
         app.realPriceArray.push(+(item.salePrice * 1.35).toFixed(2));
            
        })
        console.log(app.realPriceArray);
        
        app.htmlStringMaking(threeItems);
        
    }).fail(function(error){
        console.log("nah", error);
    })
    return true;
}
app.storeUserInput =function (){
    $("form.game-content").on("click", ".submit-form", function(event){
        event.preventDefault();

        const userGuessArray = $("input[type='text']").map(function(index, input){
            return parseFloat($(input).val());
        }); 

        console.log(userGuessArray);
        

        let notNumber = false;

        for (let i=0; i< userGuessArray.length; i++){
            const number = userGuessArray[i];
            if (isNaN(number)){
                notNumber = true;
            }
        }
        
        // userGuessArray(function(number){
        //     if (number === NaN) {
        //         return false;
        //     }
            
        // });

        console.log(notNumber);
        

        if (notNumber === false) {
            $(".submit-form").addClass("hide");

            
            

            for (let i = 0; i < userGuessArray.length; i++) {
                const userGuessDecimal = +userGuessArray[i].toFixed(2);
                
                console.log(userGuessDecimal, typeof (userGuessDecimal));
                
                //if user guess the price exactly right, tell users they win
                if (userGuessDecimal === app.realPriceArray[i]) {

                    const $emotion = $(`<p><i class="far fa-laugh-squint"></i></p>`); 
                    const $feedbackSentence =$(`<p>YOU GUESS THE RIGHT PRICE! AMAZING!</p>`)
                    const $priceDifference = $(`<p class="price-difference-match">Price Difference: $0!</p>`)
                    const $retailPrice = $(`<p class="retail-price">Retail Price:${app.realPriceArray[i]}</p>`)

                    $(`.game-results-${i+1}`).append($emotion, $feedbackSentence, $priceDifference, $retailPrice);
                    
                    //if user is five dollars lower than actual price, praise
                    // Works 
                } else if (app.realPriceArray[i] > userGuessDecimal && app.realPriceArray[i] - userGuessDecimal <= 5) {
                    const priceComparison = (app.realPriceArray[i] - userGuessDecimal).toFixed(2);
                    const $emotion = $(`<p><i class="far fa-smile-beam"></i></p>`);
                    const $feedbackSentence = $(`<p>You are only less than 5 dollars away!Good job!</p>`)
                    const $priceDifference = $(`<p class="price-difference-match">Price Difference: $${priceComparison}</p>`)
                    const $retailPrice = $(`<p class="retail-price">Retail Price:${app.realPriceArray[i]}</p>`)

                    $(`.game-results-${i + 1}`).append($emotion, $feedbackSentence, $priceDifference, $retailPrice);
                    //if user is less ten dollars away than actual price, small clap


                } else if (app.realPriceArray[i] > userGuessDecimal && app.realPriceArray[i] - userGuessDecimal <= 10) {
                    const priceComparison = (app.realPriceArray[i] - userGuessDecimal).toFixed(2);
                    const $emotion = $(`<p><i class="far fa-grin"></i></p>`);
                    const $feedbackSentence = $(`<p>You are only less than 10 dollars away! Not bad</p>`)
                    const $priceDifference = $(`<p class="price-difference-match">Price Difference: $${priceComparison}</p>`)
                    const $retailPrice = $(`<p class="retail-price">Retail Price:${app.realPriceArray[i]}</p>`)

                    $(`.game-results-${i + 1}`).append($emotion, $feedbackSentence, $priceDifference, $retailPrice);
                    //if users' guess is over or far away from actual price, indicates the result.
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
                        const $feedbackSentence = $(`<p>You are really far away! Try again</p>`)
                        const $priceDifference = $(`<p class="price-difference-match">Price Difference: $${priceComparison}</p>`)
                        const $retailPrice = $(`<p class="retail-price">Retail Price:${app.realPriceArray[i]}</p>`)

                        $(`.game-results-${i + 1}`).append($emotion, $feedbackSentence, $priceDifference, $retailPrice);
                    }
                }

                
                // $('.card').append($gameResults);
            }

            $(".game-content").append("<button class='replay'>Replay</button>");
            
        } else {
            alert('Oops! Check your answers, again!');
        }


        

        
        
    })
}
app.resetGame = function(){
    $("form.game-content").on("click", ".replay", function (event) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: $('.header-content').offset().top
        }, 500);
        setTimeout(function(){
            $(".game-content").empty()
            console.log("settimeout worked");
            
        },1000);
        
    })
}


app.init = function() {
    app.selectCategory();
    app.storeUserInput();
    app.resetGame();
}

$(function(){
    app.init();
})