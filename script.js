// namespace for app 
const app = {};
app.apiEndPoint = "https://api.walmartlabs.com/v1/search?";
app.apiKey = "rk3f9sm8az24zz3wf7e5sesc";
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
    console.log(chosenIndexArray);

    const selectedItem = [];
    chosenIndexArray.forEach(index => {
        selectedItem.push(dataArray[index]);
    })
    console.log(selectedItem);

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
        
        app.randomChooseThree(data.items);
        
    }).fail(function(error){
        console.log("nah");
    })
}

app.init = function() {
    app.selectCategory();

}

$(function(){
    app.init();
})