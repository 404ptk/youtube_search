// specjalna animacja ładowania, trwa dopóki cały content strony się nie załaduje
window.onload = function(){
    document.getElementById("loading").remove()
    document.querySelector(".container").removeAttribute("hidden")
    document.querySelector("footer").removeAttribute("hidden")
}

let i = 0;
let placeholder = "";
const txt = "Podaj tytuł filmu...";
const speed = 120;

if(i < txt.length){
    function type(){
        placeholder += txt.charAt(i);
        document.getElementById("search").setAttribute("placeholder",placeholder);
        i++;
        setTimeout(type, speed);
    }
}
type();

document.addEventListener("DOMContentLoaded", function () {
    // klucz api Youtube
    var API_KEY = "AIzaSyC_CVzKGFtLAqxNdAZ_EyLbL0VRGJ-FaMU";

    // czyszczenie poprzedniego outputu, jeśli taki był
    var video = '';

    // Pobierz element wskaźnika ładowania
    var loadingIndicator = document.getElementById("loading-indicator");

    // Po zakończeniu animacji (pełny obrót)
    loadingIndicator.addEventListener("animationiteration", function () {
        // Zmniejsz opacity do 0
        loadingIndicator.style.opacity = "0";
    });


    // po kliknięciu przycisku Search
    document.getElementById("form").addEventListener("submit", function (event) {
        event.preventDefault();

        // Pokaż wskaźnik ładowania
        loadingIndicator.style.display = "block";

        // Rozpocznij animację obrotu
        loadingIndicator.style.animation = "spin 1s linear infinite";

        var search = document.getElementById("search").value;
        // sprawdzanie czy pole search jest puste
        if(!search){
            console.log("Podana fraza była pusta\nUżyto plików cookie do wyszukania defaultowej wartości.")
            search = "Uniwersytet Rzeszowski";

            // wykorzystanie elementów ciasteczek, aby przy pustym polu search nie była wyszukiwana losowa fraza
            document.cookie = "defaultSearch=Uniwersytet Rzeszowski; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
        }

        // pobieranie danych z filtrów 
        var results = document.getElementById("max-results").value;
        var before_date = document.getElementById("upload-range").value + "T00:00:00Z";

        document.getElementById("videos").innerHTML = '';

        // wywołanie funkcji videoSearch
        videoSearch(API_KEY, search, results, before_date).then(() => {
            // Ukryj wskaźnik ładowania po zakończeniu działania funkcji videoSearch
            loadingIndicator.style.display = "none";
            // Zresetuj opacity do 1
            loadingIndicator.style.opacity = "1";
        });
    });

    function videoSearch(key, search, maxResults, before_date) {
        // utworzenie requesta do http
        var xhr = new XMLHttpRequest();
        // wykorzystanie api youtube
        // dokumentacja - https://developers.google.com/youtube/v3/docs?hl=pl
        xhr.open("GET", "https://www.googleapis.com/youtube/v3/search?key=" + key
            + "&type=video&part=snippet&maxResults=" + maxResults
            + "&order=viewCount" + "&publishedBefore=" + before_date
            + "&q=" + search, true);

        // jeśli zmienił się stan w zapytaniu do serwera
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var data = JSON.parse(xhr.responseText);
                console.log(data);

                var videoslist = data.items;

                // pobieranie linku do kanału twórcy filmu ze sprawdzaniem
                function getChannelLink(channelId) {
                    if (channelId) {
                        return `https://www.youtube.com/channel/${channelId}`;
                    } else {
                        return 'N/A';
                    }
                }

                videoslist.forEach(async function (item) {
                    // pobieranie tytułu filmu
                    var title = item.snippet.title;

                    // pobieranie daty uploadu filmu
                    var uploadDate = formatDate(item.snippet.publishedAt);

                    // pobieranie liczby wyświetleń
                    var viewCount = await getViewCount(item.id.videoId);

                    // pobieranie nazwy kanału
                    var channelInfo = await getChannelInfo(item.snippet.channelId);

                    // pobieranie opisu filmu
                    var videoDescription = await getVideoDescription(item.id.videoId);
                    
                    // jeśli opis ma więcej niż 99 znaków, ograniczam go do 99 i dodaje na końcu "..."
                    if(videoDescription.length > 99){
                        videoDescription = videoDescription.substring(0,99) + "...";
                    }

                    // pobieranie linku do kanału autora
                    var channelLink = getChannelLink(item.snippet.channelId);

                    // formatowanie liczby wyświetleń (np. zamiast 1230, to 1,2tys) za pomocą funkcji formatViewCount
                    var formattedViewCount = formatViewCount(viewCount);

                    // ustawienie wyglądu każdego z osobna kafelka z nagraniem (reszta w css)
                    video = `
                        <div class="video-container">
                            <iframe width="420" height="315" src="http://www.youtube.com/embed/${item.id.videoId}" frameborder="0" allowfullscreen></iframe>
                            <div class="video-details">
                                <p><b id="title">${title}</b></p>
                                <a id="channel" href="${channelLink}" target="_blank"><img src="${channelInfo.avatar}" alt="Avatar kanału">&nbsp; ${channelInfo.title}</a>
                                <p id="upload_date">${uploadDate} &#x2022; ${formattedViewCount} wyświetleń</p>
                                <p id="description">${videoDescription}</p>
                            </div>
                        </div>
                        <hr>
                    `;

                    // 
                    document.getElementById("videos").innerHTML += video;
                    console.log("Wyświetlono film o tytule: " + title);
                });
                console.log("Wyświetlono wszystkie filmy.\nFiltry:\n\tIlość filmów: " + maxResults + "\n\tDodane przed datą: " + before_date);
            }
        };
        xhr.send();
    }

    // Promise
    function getViewCount(videoId) {
        return new Promise(async (resolve, reject) => {
            try {
                // Pobierz liczbę wyświetleń za pomocą osobnego żądania
                var statisticsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=statistics&key=${API_KEY}`);
                var statisticsData = await statisticsResponse.json();
    
                // Sprawdź, czy statystyki są dostępne i pobierz liczbę wyświetleń
                var viewCount = statisticsData.items.length > 0 ? statisticsData.items[0].statistics.viewCount : 'N/A';
    
                resolve(viewCount);
            } catch (error) {
                reject(error);
            }
        });
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

    // Funkcja od animacji (slidera) formularzu kontaktowego
    var slidein = document.getElementById('slidein');

    // po kliknięciu przycisku
    document.querySelector('.contact').addEventListener('click', function (event) {
        // przełącz między klasami show i hide
        slidein.classList.toggle('show');
        slidein.classList.toggle('hide');

        // zatrzymanie eventu, aby uniknac zbednych interakcji
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

// Funkcja od pokazywania menu filtrów za użyciem przycisku Filtry
var menu_filtrow = document.getElementById("filters");
menu_filtrow.style.display = "none";

function filtry() {
    if (menu_filtrow.style.display == "none") {
        menu_filtrow.style.display = "flex";
    } else {
        menu_filtrow.style.display = "none";
    }
}

// Funkcja która ukrywa/pokazuje przycisk Top, w zależności od obecnej pozycji na stronie
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

// Funkcjonalność przycisku Top, która przerzuca na początek strony
function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

//local storage dla formularza
const name = document.getElementById("name");
const surname = document.getElementById("surname");
const mail = document.getElementById("mail");
const textmessage = document.getElementById("text-message");

name.addEventListener("change", updateValue);
surname.addEventListener("change", updateValue);
mail.addEventListener("change", updateValue);
textmessage.addEventListener("change", updateValue);

try {
    name.value = localStorage.getItem("name");
    surname.value = localStorage.getItem("surname");
    mail.value = localStorage.getItem("mail");
    textmessage.value = localStorage.getItem("textmessage");
} catch (error) {
    console.error(error);
}

function updateValue(e) {
    console.log(localStorage.getItem("name"));
    console.log(localStorage.getItem("surname"));
    console.log(localStorage.getItem("mail"));
    console.log(localStorage.getItem("textmessage"));
    console.log(localStorage);
        // mógłbym tutaj dopisać inny program który faktycznie te dane będzie mi pobierał
        // i wysyłał w inne miejsce, lecz nie obejmuje to oceny projektu
    // if (name.value.length < 1 || surname.value.length < 1 || mail.value.length < 1 || textmessage.value.length < 1) {
    //     alert("Nie zostawiaj pustych miejsc");
    // } 
}

