/**
 * Funkcja inicjująca animację ładowania strony, ukrywająca wskaźnik ładowania po załadowaniu całej zawartości.
 * @global
 * @function
 */
window.onload = function () {
    document.getElementById("loading").remove();
    document.querySelector(".container").removeAttribute("hidden");
    document.querySelector("footer").removeAttribute("hidden");
};

/**
 * Zmienna do obsługi animacji wprowadzania tekstu w placeholderze pola wyszukiwania.
 * @global
 * @type {number}
 */
let i = 0;

/**
 * Zmienna przechowująca aktualny placeholder.
 * @global
 * @type {string}
 */
let placeholder = "";

/**
 * Tekst do animacji wprowadzania tekstu w placeholderze pola wyszukiwania.
 * @global
 * @type {string}
 */
const txt = "Podaj tytuł filmu...";

/**
 * Prędkość animacji wprowadzania tekstu.
 * @global
 * @type {number}
 */
const speed = 120;

/**
 * Funkcja obsługująca animację wprowadzania tekstu w placeholderze pola wyszukiwania.
 * @global
 * @function
 */
function type() {
    placeholder += txt.charAt(i);
    document.getElementById("search").setAttribute("placeholder", placeholder);
    i++;
    setTimeout(type, speed);
}

// Wywołanie funkcji type po załadowaniu skryptu
type();

/**
 * Nasłuchiwacz na zdarzenie załadowania strony.
 * @global
 * @event window#DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", function () {
    /**
     * Klucz API Youtube.
     * @global
     * @type {string}
     */
    var API_KEY = "AIzaSyC_CVzKGFtLAqxNdAZ_EyLbL0VRGJ-FaMU";

    /**
     * Czyszczenie poprzedniego outputu, jeśli taki był.
     * @global
     * @type {string}
     */
    var video = '';

    /**
     * Pobierz element wskaźnika ładowania.
     * @global
     * @type {Element}
     */
    var loadingIndicator = document.getElementById("loading-indicator");

    /**
     * Nasłuchiwacz na zdarzenie iteracji animacji wskaźnika ładowania.
     * @global
     * @event Element#animationiteration
     */
    loadingIndicator.addEventListener("animationiteration", function () {
        // Zmniejsz opacity do 0
        loadingIndicator.style.opacity = "0";
    });

    /**
     * Nasłuchiwacz na zdarzenie submit formularza.
     * @global
     * @event HTMLFormElement#submit
     */
    document.getElementById("form").addEventListener("submit", function (event) {
        event.preventDefault();

        // Pokaż wskaźnik ładowania
        loadingIndicator.style.display = "block";

        // Rozpocznij animację obrotu
        loadingIndicator.style.animation = "spin 1s linear infinite";

        /**
         * Wprowadzony tytuł filmu do wyszukania.
         * @global
         * @type {string}
         */
        var search = document.getElementById("search").value;

        // Sprawdzanie czy pole search jest puste
        if (!search) {
            console.log("Podana fraza była pusta\nUżyto plików cookie do wyszukania defaultowej wartości.");
            search = "Uniwersytet Rzeszowski";

            // Wykorzystanie elementów ciasteczek, aby przy pustym polu search nie była wyszukiwana losowa fraza
            document.cookie = "defaultSearch=Uniwersytet Rzeszowski; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
        }

        /**
         * Maksymalna liczba wyników.
         * @global
         * @type {number}
         */
        var results = document.getElementById("max-results").value;

        /**
         * Data dodania filmu (filtr).
         * @global
         * @type {string}
         */
        var before_date = document.getElementById("upload-range").value + "T00:00:00Z";

        document.getElementById("videos").innerHTML = '';

        // Wywołanie funkcji videoSearch
        videoSearch(API_KEY, search, results, before_date).then(() => {
            // Ukryj wskaźnik ładowania po zakończeniu działania funkcji videoSearch
            loadingIndicator.style.display = "none";
            // Zresetuj opacity do 1
            loadingIndicator.style.opacity = "1";
        });
    });

    /**
     * Funkcja obsługująca wyszukiwanie filmów na platformie YouTube.
     * @global
     * @function
     * @param {string} key - Klucz API YouTube.
     * @param {string} search - Wprowadzony tytuł filmu do wyszukania.
     * @param {number} maxResults - Maksymalna liczba wyników.
     * @param {string} before_date - Data dodania filmu (filtr).
     */
    function videoSearch(key, search, maxResults, before_date) {
        // Utworzenie requesta do http
        var xhr = new XMLHttpRequest();
        // Wykorzystanie API YouTube
        // Dokumentacja: https://developers.google.com/youtube/v3/docs?hl=pl
        xhr.open("GET", "https://www.googleapis.com/youtube/v3/search?key=" + key +
            "&type=video&part=snippet&maxResults=" + maxResults +
            "&order=viewCount" + "&publishedBefore=" + before_date +
            "&q=" + search, true);

        // Jeśli zmienił się stan w zapytaniu do serwera
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var data = JSON.parse(xhr.responseText);
                console.log(data);

                var videoslist = data.items;

                /**
                 * Funkcja do pobierania linku do kanału twórcy filmu ze sprawdzaniem.
                 * @global
                 * @function
                 * @param {string} channelId - Identyfikator kanału YouTube.
                 * @returns {string} - Link do kanału.
                 */
                function getChannelLink(channelId) {
                    if (channelId) {
                        return `https://www.youtube.com/channel/${channelId}`;
                    } else {
                        return 'N/A';
                    }
                }

                videoslist.forEach(async function (item) {
                    /**
                     * Tytuł filmu.
                     * @global
                     * @type {string}
                     */
                    var title = item.snippet.title;

                    /**
                     * Data uploadu filmu.
                     * @global
                     * @type {string}
                     */
                    var uploadDate = formatDate(item.snippet.publishedAt);

                    /**
                     * Liczba wyświetleń.
                     * @global
                     * @type {string}
                     */
                    var viewCount = await getViewCount(item.id.videoId);

                    /**
                     * Informacje o kanale.
                     * @global
                     * @type {{title: string, avatar: string}}
                     */
                    var channelInfo = await getChannelInfo(item.snippet.channelId);

                    /**
                     * Opis filmu.
                     * @global
                     * @type {string}
                     */
                    var videoDescription = await getVideoDescription(item.id.videoId);

                    // Jeśli opis ma więcej niż 99 znaków, ograniczam go do 99 i dodaje na końcu "..."
                    if (videoDescription.length > 99) {
                        videoDescription = videoDescription.substring(0, 99) + "...";
                    }

                    /**
                     * Link do kanału autora.
                     * @global
                     * @type {string}
                     */
                    var channelLink = getChannelLink(item.snippet.channelId);

                    /**
                     * Sformatowana liczba wyświetleń.
                     * @global
                     * @type {string}
                     */
                    var formattedViewCount = formatViewCount(viewCount);

                    // Ustawienie wyglądu każdego z osobna kafelka z nagraniem (reszta w CSS)
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

                    // Dodanie kafelka z nagraniem do sekcji z wynikami
                    document.getElementById("videos").innerHTML += video;
                    console.log("Wyświetlono film o tytule: " + title);
                });
                console.log("Wyświetlono wszystkie filmy.\nFiltry:\n\tIlość filmów: " + maxResults + "\n\tDodane przed datą: " + before_date);
            }
        };
        xhr.send();
    }

    /**
     * Funkcja asynchroniczna do pobierania liczby wyświetleń filmu.
     * @global
     * @function
     * @param {string} videoId - Identyfikator filmu na YouTube.
     * @returns {Promise<string>} - Promise z liczbą wyświetleń filmu.
     */
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

    /**
     * Funkcja asynchroniczna do pobierania informacji o kanale autora filmu.
     * @global
     * @function
     * @param {string} channelId - Identyfikator kanału na YouTube.
     * @returns {Promise<{title: string, avatar: string}>} - Promise z danymi o kanale (tytuł, avatar).
     */
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

    /**
     * Funkcja asynchroniczna do pobierania opisu filmu.
     * @global
     * @function
     * @param {string} videoId - Identyfikator filmu na YouTube.
     * @returns {Promise<string>} - Promise z opisem filmu.
     */
    async function getVideoDescription(videoId) {
        // Pobierz opis filmu za pomocą osobnego żądania
        var videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${API_KEY}`);
        var videoData = await videoResponse.json();

        // Sprawdź, czy opis filmu jest dostępny i pobierz go
        var description = videoData.items.length > 0 ? videoData.items[0].snippet.description : 'N/A';

        return description;
    }

    /**
     * Funkcja formatująca datę publikacji filmu.
     * @global
     * @function
     * @param {string} dateString - Data w formacie ISO 8601.
     * @returns {string} - Sformatowana data.
     */
    function formatDate(dateString) {
        var options = { year: 'numeric', month: 'long', day: 'numeric' };
        var formattedDate = new Date(dateString).toLocaleDateString('pl-PL', options);
        return formattedDate;
    }
        /**
     * Funkcja formatująca liczbę wyświetleń dla lepszej czytelności.
     * @global
     * @function
     * @param {string} count - Liczba wyświetleń.
     * @returns {string} - Sformatowana liczba wyświetleń.
     */
        function formatViewCount(count) {
            if (count >= 1000000) {
                return (count / 1000000).toFixed(1) + 'mln';
            } else if (count >= 1000) {
                return (count / 1000).toFixed(1) + 'tys';
            } else {
                return count.toString();
            }
        }
    
        /**
         * Funkcja do animacji (slidera) formularza kontaktowego.
         * @global
         * @function
         */
        var slidein = document.getElementById('slidein');
    
        /**
         * Nasłuchiwacz na zdarzenie kliknięcia przycisku kontaktowego.
         * @global
         * @event HTMLElement#click
         */
        document.querySelector('.contact').addEventListener('click', function (event) {
            // przełącz między klasami show i hide
            slidein.classList.toggle('show');
            slidein.classList.toggle('hide');
    
            // zatrzymanie eventu, aby uniknąć zbędnych interakcji
            event.stopPropagation();
        });
    
        /**
         * Nasłuchiwacz na zdarzenie załadowania okna.
         * @global
         * @event window#DOMContentLoaded
         */
        window.addEventListener('DOMContentLoaded', function () {
            /**
             * Nasłuchiwacz na zdarzenie kliknięcia w dowolne miejsce w dokumencie.
             * @global
             * @event HTMLHtmlElement#click
             */
            document.querySelector('html').addEventListener('click', function () {
                // Dodaj klasę 'hide', usuń klasę 'show'
                slidein.classList.add('hide');
                slidein.classList.remove('show');
            });
    
            /**
             * Nasłuchiwacz na zdarzenie kliknięcia w formularz.
             * @global
             * @event HTMLElement#click
             */
            document.getElementById('slidein').addEventListener('click', function (event) {
                // Zatrzymaj propagację zdarzenia, aby nie zamykać okna po kliknięciu w formularz
                event.stopPropagation();
            });
        });
    
        /**
         * Element menu filtrów.
         * @global
         * @type {HTMLElement}
         */
        var menu_filtrow = document.getElementById("filters");
    
        /**
         * Inicjalizacja stanu wyświetlania menu filtrów.
         * @global
         * @type {string}
         */
        menu_filtrow.style.display = "none";
    
        /**
         * Przycisk "Top" przerzucający na początek strony.
         * @global
         * @type {HTMLElement}
         */
        let top_page_button = document.getElementById("top-page");
    
        /**
         * Nasłuchiwacz na zdarzenie scrollowania strony.
         * @global
         * @event window#onscroll
         */
        window.onscroll = function () {
            scrollFunction()
        };
    
        /**
         * Funkcja obsługująca przycisk "Top", przerzucająca na początek strony.
         * @global
         * @function
         */
        function topFunction() {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }
    
        /**
         * Funkcja obsługująca zdarzenie scrollowania strony.
         * @global
         * @function
         */
        function scrollFunction() {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                top_page_button.style.visibility = "visible";
                top_page_button.style.opacity = "1";
            } else {
                top_page_button.style.visibility = "hidden";
                top_page_button.style.opacity = "0";
            }
        }
    
        // Local storage dla formularza
        const nameInput = document.getElementById("name");
        const surnameInput = document.getElementById("surname");
        const mailInput = document.getElementById("mail");
        const textmessageInput = document.getElementById("text-message");
    
        // Pobranie danych z local storage po załadowaniu strony
        window.addEventListener("DOMContentLoaded", function () {
            try {
                nameInput.value = localStorage.getItem("name") || "";
                surnameInput.value = localStorage.getItem("surname") || "";
                mailInput.value = localStorage.getItem("mail") || "";
                textmessageInput.value = localStorage.getItem("textmessage") || "";
            } catch (error) {
                console.error(error);
            }
        });
    
        // Dodanie nasłuchiwaczy zmiany wartości dla pól formularza
        nameInput.addEventListener("input", updateValue);
        surnameInput.addEventListener("input", updateValue);
        mailInput.addEventListener("input", updateValue);
        textmessageInput.addEventListener("input", updateValue);
    
        /**
         * Funkcja obsługująca zapisywanie danych formularza do local storage.
         * @global
         * @function
         * @param {Event} e - Zdarzenie zmiany wartości w polu formularza.
         */
        function updateValue(e) {
            localStorage.setItem("name", nameInput.value);
            localStorage.setItem("surname", surnameInput.value);
            localStorage.setItem("mail", mailInput.value);
            localStorage.setItem("textmessage", textmessageInput.value);
        }
    
    });
    /**
         * Funkcja obsługująca pokazywanie/ukrywanie menu filtrów.
         * @global
         * @function
         */
    function filtry() {
        if (filters.style.display == "none") {
            filters.style.display = "flex";
        } else {
            filters.style.display = "none";
        }
    }