// namespace for app 
const app = {};
app.apiEndPoint = "https://api.walmartlabs.com/v1/search?";
app.apiKey = "rk3f9sm8az24zz3wf7e5sesc";


app.htmlStringMaking = function (dataArray){
    $('.game-content').empty();
    dataArray.forEach(data => {
        const $card = $(`<div>`).addClass('inner-wrapper');
        const $image = $(`<img class="product-image">`).attr('src',data.largeImage);
        const $name = $(`<p class="product-name">${data.name}</p>`); 
        const $userGuess = $(`<input type="number" id="userGuess" name="userGuess" placeholder="Guess the Price"></input>`);
        const $userGuessLabel = $(`<label for="userGuess" class="visually-hidden">Guess the price of the item</label>`);
        $card.append($image, $name, $userGuess, $userGuessLabel);
        console.log($card);
    
        $('.game-content').append($card);
    })
    
    const $submitGuess = $(`<button>Submit</button>`);

    $('.game-content').append($submitGuess);
}

app.selectCategory = function () {
    $('.start-game').on('click', function(event){
        event.preventDefault();
        const selectedCategory = $('input[name=category]:checked').val();
        app.apiCall(selectedCategory);
        
     
    })
}



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
    
    return(selectedItems);

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
            numItems:20,

        }
    }).then(function (data) {
        const totalArray = data.items; 
        
        const threeItems = app.randomChooseThree(totalArray);
        
        app.htmlStringMaking(threeItems);
        
    }).fail(function(error){
        console.log("nah", error);
    })
}

app.init = function() {
    app.selectCategory();
    
}

$(function(){
    app.init();
})