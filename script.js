$(document).ready(function(){
    var API_KEY = "AIzaSyCaHD8ew4SAagtZcgKmpcrc_AFvlP0zx18"

    var video = ''

    

    $("#form").submit(function(event){
        event.preventDefault();

        var search = $("#search").val()
        var results = $("#max-results").val()
        var before_date = $("#upload-range").val()

        $("#videos").empty();

        videoSearch(API_KEY, search, results)
    })
    // $("#form").submit(function(event){
    //     event.preventDefault();

    //     $("#description").empty();
    //     $("<p>Wyniki wyszukiwania dla</p>").insertAfter("#form");
    // })

    function videoSearch(key, search, maxResults){
        $.get("https://www.googleapis.com/youtube/v3/search?key=" + key
        + "&type=video&part=snippet&maxResults=" + maxResults  
        + "&q=" + search + "&order=viewCount", function(data) {
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
function filtry(){
    const element = document.getElementById("filters");
        if (element.style.display == "none") {
            element.style.display = "flex";
        } else {
            element.style.display = "none";
        }
}