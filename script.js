// namespace for app 
const app = {};
app.apiEndPoint = "https://api.walmartlabs.com/v1/search?";
app.apiKey = "rk3f9sm8az24zz3wf7e5sesc";
app.realPriceArray =[];

app.htmlStringMaking = function (dataArray){
    $('.game-content').empty();
    dataArray.forEach(data => {
        const $card = $(`<fieldset>`).addClass('inner-wrapper');
        const $image = $(`<img class="product-image">`).attr('src',data.largeImage);
        const $name = $(`<p class="product-name">${data.name}</p>`); 
        const $userGuess = $(`<input type="text" id="userGuess" name="userGuess" placeholder="Guess the Price"></input>`);
        const $userGuessLabel = $(`<label for="userGuess" class="visually-hidden">Guess the price of the item</label>`);
        $card.append($image, $name, $userGuess, $userGuessLabel);
        // console.log($card);
    
        $('.game-content').append($card);
    })
    
    const $submitGuess = $(`<button>Submit</button>`);

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
            app.apiCall(selectedCategory);
        }
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
}
app.storeUserInput =function (){
    $("form.game-content").on("submit", function(event){
        event.preventDefault();

        const userGuessArray = $("input[type='text']").map(function(index, input){
            return parseFloat($(input).val());
        }); 


        if (userGuessArray.index(NaN) !== -1) {
            alert('Oops! Check your answers, again!')
            
        } else {
            for (let i = 0; i < userGuessArray.length; i++) {
                const userGuessDecimal = +userGuessArray[i].toFixed(2);
                console.log(userGuessDecimal, typeof(userGuessDecimal));
                //if user guess the price exactly right, tell users they win
                if (userGuessDecimal ===app.realPriceArray[i]) {
                    alert("you win!");
                //if user is five dollars lower than actual price, praise
                }else if (app.realPriceArray[i]>userGuessDecimal&&app.realPriceArray[i] - userGuessDecimal <=5){
                    alert("you are very close!");
                //if user is less ten dollars away than actual price, small clap
                } else if (app.realPriceArray[i] >userGuessDecimal&&app.realPriceArray[i] -userGuessDecimal <=10){
                    alert("not bad");
                //if users' guess is over or far away from actual price, indicates the result.
                }else{
                    alert("😢");
                }
                
            }
        }

        console.log(userGuessArray);       
        

        
        
    })
}

app.init = function() {
    app.selectCategory();
    app.storeUserInput();
    
}

$(function(){
    app.init();
})