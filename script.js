$(document).ready(function(){
    var API_KEY = "AIzaSyCaHD8ew4SAagtZcgKmpcrc_AFvlP0zx18"

    var video = ''

    

    $("#form").submit(function(event){
        event.preventDefault();

        var search = $("#search").val()
        var results = $("#max-results").val()
        var before_date = $("#upload-range").val() + "T00:00:00Z"
        //console.log(before_date) f.ex. log: 2024-01-03T00:00:00Z

        $("#videos").empty();

        videoSearch(API_KEY, search, results, before_date)
    })
    // $("#form").submit(function(event){
    //     event.preventDefault();

    //     $("#description").empty();
    //     $("<p>Wyniki wyszukiwania dla</p>").insertAfter("#form");
    // })

    function videoSearch(key, search, maxResults, before_date){
        $.get("https://www.googleapis.com/youtube/v3/search?key=" + key
        + "&type=video&part=snippet&maxResults=" + maxResults  
        + "&order=viewCount" + "&publishedBefore=" + before_date
        + "&q=" + search, function(data) {
            console.log(data)
            let videoslist = data.items

            videoslist.forEach(item => {
                
                video = `

                <iframe width="420" height="315" src="http://www.youtube.com/embed/${item.id.videoId}" frameborder="0" allowfullscreen></iframe>

                `

                $("#videos").append(video)
            });
        })
    }
})

const menu_filtrow = document.getElementById("filters");
menu_filtrow.style.display = "none"
function filtry(){
        if (menu_filtrow.style.display == "none") {
            menu_filtrow.style.display = "flex";
        } else {
            menu_filtrow.style.display = "none";
        }
}