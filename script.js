// namespace for app 
const app = {};


app.selectCategory = function () {
    $('.start-game').on('click', function(event){
        event.preventDefault();

        const selectedCategory = $('input[name=category]:checked').val();

        
    })
}


app.init = function() {
    app.selectCategory();
}

$(function(){
    app.init();
})