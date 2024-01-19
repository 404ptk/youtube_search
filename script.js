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

                videoslist.forEach(async function (item) {
                    var title = item.snippet.title;
                    var uploadDate = formatDate(item.snippet.publishedAt);

                    // Pobierz liczbę wyświetleń za pomocą osobnego żądania
                    var viewCount = await getViewCount(item.id.videoId);

                    // Formatuj liczbę wyświetleń
                    var formattedViewCount = formatViewCount(viewCount);

                    video = `
                        <div class="video-container">
                            <iframe width="420" height="315" src="http://www.youtube.com/embed/${item.id.videoId}" frameborder="0" allowfullscreen></iframe>
                            <div class="video-details">
                                <p><b>Tytuł:</b> ${title}</p>
                                <p><b>Data dodania:</b> ${uploadDate}</p>
                                <p><b>Wyświetlenia:</b> ${formattedViewCount}</p>
                            </div>
                        </div>
                        <hr>
                    `;

                    document.getElementById("videos").innerHTML += video;
                });
            }
        };

        xhr.send();
    }

    async function getViewCount(videoId) {
        // Pobierz liczbę wyświetleń za pomocą osobnego żądania
        var statisticsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=statistics&key=${API_KEY}`);
        var statisticsData = await statisticsResponse.json();

        // Sprawdź, czy statystyki są dostępne i pobierz liczbę wyświetleń
        var viewCount = statisticsData.items.length > 0 ? statisticsData.items[0].statistics.viewCount : 'N/A';

        return viewCount;
    }

    function formatDate(dateString) {
        var options = { year: 'numeric', month: 'long', day: 'numeric' };
        var formattedDate = new Date(dateString).toLocaleDateString('pl-PL', options);
        return formattedDate;
    }

    // Funkcja do konwersji liczby wyświetleń na format "1mln" lub "563,5tys"
    function formatViewCount(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'mln';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'tys';
        } else {
            return count.toString();
        }
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

var contact = document.getElementById("formularz");
contact.style.display = "none";

function contact_form() {
    if (contact.style.display == "none") {
        contact.style.display = "block";
    } else {
        contact.style.display = "none";
    }
}
