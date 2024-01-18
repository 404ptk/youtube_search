document.addEventListener("DOMContentLoaded", function () {
    var API_KEY = "AIzaSyCaHD8ew4SAagtZcgKmpcrc_AFvlP0zx18";

    var video = '';

    document.getElementById("form").addEventListener("submit", function (event) {
        event.preventDefault();

        var search = document.getElementById("search").value;
        var results = document.getElementById("max-results").value;
        var before_date = document.getElementById("upload-range").value + "T00:00:00Z";

        document.getElementById("videos").innerHTML = '';

        videoSearch(API_KEY, search, results, before_date);
    });

    function videoSearch(key, search, maxResults, before_date) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.googleapis.com/youtube/v3/search?key=" + key
            + "&type=video&part=snippet&maxResults=" + maxResults
            + "&order=viewCount" + "&publishedBefore=" + before_date
            + "&q=" + search, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var data = JSON.parse(xhr.responseText);
                console.log(data);

                var videoslist = data.items;

                videoslist.forEach(function (item) {
                    video = `
                        <iframe width="420" height="315" src="http://www.youtube.com/embed/${item.id.videoId}" frameborder="0" allowfullscreen></iframe>
                    `;

                    document.getElementById("videos").innerHTML += video;
                });

                var zgloszenie = `<hr></hr>`;
                document.getElementById("zgloszenie").innerHTML += zgloszenie;
            }
        };

        xhr.send();
    }
});

var menu_filtrow = document.getElementById("filters");
menu_filtrow.style.display = "none";

function filtry() {
    if (menu_filtrow.style.display == "none") {
        menu_filtrow.style.display = "flex";
    } else {
        menu_filtrow.style.display = "none";
    }
}
