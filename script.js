document.addEventListener("DOMContentLoaded", function () {
    var API_KEY = "AIzaSyCeH84xNssZ3FplzEtwRS1AbX-h85FL0_g";

    var video = '';

    document.getElementById("form").addEventListener("submit", function (event) {
        event.preventDefault();

        var search = document.getElementById("search").value;
        if (!search.trim()) {
            alert("Wpisz frazę do wyszukiwania.");
            console.log("Nie wpisano frazy do wyszukiwania.");
            return;
        }

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

                    // Pobierz informacje o kanale za pomocą osobnego żądania
                    var channelInfo = await getChannelInfo(item.snippet.channelId);

                    // Pobierz opis filmu za pomocą osobnego żądania
                    var videoDescription = await getVideoDescription(item.id.videoId);
                    // Ogranicz opis filmu do 100 znaków
                    videoDescription = videoDescription.substring(0, 100);
                    if(videoDescription.length > 99){
                        videoDescription = videoDescription.substring(0,99) + "...";
                    }

                    // Formatuj liczbę wyświetleń
                    var formattedViewCount = formatViewCount(viewCount);

                    video = `
                        <div class="video-container">
                            <iframe width="420" height="315" src="http://www.youtube.com/embed/${item.id.videoId}" frameborder="0" allowfullscreen></iframe>
                            <div class="video-details">
                                <p><b id="title">${title}</b></p>
                                <p id="channel"><img src="${channelInfo.avatar}" alt="Avatar kanału">&nbsp; ${channelInfo.title}</p>
                                <p>${uploadDate} &#x2022; ${formattedViewCount} wyświetleń</p>
                                <p id="description">${videoDescription}</p>
                            </div>
                        </div>
                        <hr>
                    `;

                    document.getElementById("videos").innerHTML += video;
                    console.log("Wyświetlono wyniki wyszukiwania.");
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

    async function getChannelInfo(channelId) {
        // Pobierz informacje o kanale za pomocą osobnego żądania
        var channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?id=${channelId}&part=snippet&key=${API_KEY}`);
        var channelData = await channelResponse.json();

        // Sprawdź, czy informacje o kanale są dostępne i pobierz tytuł kanału oraz URL do avataru
        var channelTitle = channelData.items.length > 0 ? channelData.items[0].snippet.title : 'N/A';
        var channelAvatar = channelData.items.length > 0 ? channelData.items[0].snippet.thumbnails.default.url : 'N/A';

        return {
            title: channelTitle,
            avatar: channelAvatar
        };
    }

    async function getVideoDescription(videoId) {
        // Pobierz opis filmu za pomocą osobnego żądania
        var videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${API_KEY}`);
        var videoData = await videoResponse.json();

        // Sprawdź, czy opis filmu jest dostępny i pobierz go
        var description = videoData.items.length > 0 ? videoData.items[0].snippet.description : 'N/A';

        return description;
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

    var slidein = document.getElementById('slidein');

    // Po kliknięciu w element o klasie 'contact'
    document.querySelector('.contact').addEventListener('click', function (event) {
        // Przełącz między klasami 'show' i 'hide'
        slidein.classList.toggle('show');
        slidein.classList.toggle('hide');

        // Zatrzymaj propagację zdarzenia, aby uniknąć zbędnych interakcji
        event.stopPropagation();
    });

    // Po załadowaniu okna
    window.addEventListener('DOMContentLoaded', function () {
        // Po kliknięciu w dowolne miejsce w dokumencie
        document.querySelector('html').addEventListener('click', function () {
            // Dodaj klasę 'hide', usuń klasę 'show'
            slidein.classList.add('hide');
            slidein.classList.remove('show');
        });

        // Dodaj obsługę zdarzeń na formularzu
        document.getElementById('slidein').addEventListener('click', function (event) {
            // Zatrzymaj propagację zdarzenia, aby nie zamykać okna po kliknięciu w formularz
            event.stopPropagation();
        });
    });
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

let top_page_button = document.getElementById("top-page");

window.onscroll = function () {
    scrollFunction()
};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        top_page_button.style.visibility = "visible";
        top_page_button.style.opacity = "1";
    } else {
        top_page_button.style.visibility = "hidden";
        top_page_button.style.opacity = "0";
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}
