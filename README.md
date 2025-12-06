Opis aplikacji

Aplikacja jest prostym systemem do publikowania artykułów i zarządzania komentarzami. Umożliwia użytkownikom tworzenie artykułów, przeglądanie istniejących wpisów, dodawanie komentarzy oraz odpowiadanie na komentarze innych użytkowników.

Główne funkcjonalności

Dodawanie artykułów.

Przeglądanie listy artykułów.

Dodawanie komentarzy do artykułów.

Odpowiadanie na komentarze.

Responsywny interfejs użytkownika.

Obsługa prostego API REST.

Technologie użyte w projekcie

Frontend: HTML, CSS, JavaScript (lub framework np. React/Vue)

Backend: Node.js + Express (lub inny)

Baza danych: MongoDB (lub inna)

Hosting: GitHub Pages (frontend), Heroku / Railway / Vercel (backend)

Instrukcja uruchomienia lokalnie

Sklonuj repozytorium:

git clone <link_do_repo>


Przejdź do katalogu projektu:

cd <nazwa_projektu>


Zainstaluj zależności:

npm install


Uruchom serwer:

npm start


Otwórz przeglądarkę pod adresem http://localhost:3000 (lub wskazanym w terminalu).

Hosting

Aplikacja hostowana pod adresem: [link do hostingu]

GitHub Pages (frontend): [link do GitHub Pages]

Prezentacja i nagranie

Prezentacja PDF: [link do PDF]

Nagranie wideo: [link do wideo]

docs/technical.md
Architektura

Aplikacja oparta jest na modelu klient-serwer.

Frontend obsługuje interakcje użytkownika i wysyła żądania do API.

Backend realizuje logikę aplikacji, zarządza bazą danych i obsługuje żądania HTTP.

Dane przechowywane są w bazie danych w formie artykułów i komentarzy.

Endpointy API
URL	Metoda	Opis	Parametry	Body	Response
/api/articles	GET	Pobierz wszystkie artykuły	-	-	Lista artykułów
/api/articles	POST	Dodaj nowy artykuł	-	{ title, content, author }	Stworzony artykuł
/api/articles/:id/comments	GET	Pobierz komentarze do artykułu	id (artykułu)	-	Lista komentarzy
/api/articles/:id/comments	POST	Dodaj komentarz	id (artykułu)	{ content, author }	Stworzony komentarz
/api/comments/:id/replies	POST	Dodaj odpowiedź do komentarza	id (komentarza)	{ content, author }	Stworzona odpowiedź
Model danych
Artykuł

id (string, unikalny)

title (string)

content (string)

author (string)

comments (lista ID komentarzy)

Komentarz

id (string, unikalny)

content (string)

author (string)

articleId (ID artykułu)

replies (lista ID odpowiedzi)

Odpowiedź

id (string, unikalny)

content (string)

author (string)

commentId (ID komentarza)

docs/functional.md
Widoki

Lista artykułów – przeglądanie wszystkich artykułów.

Widok artykułu – szczegóły artykułu wraz z komentarzami.

Dodawanie artykułu – formularz do dodawania nowego artykułu.

Dodawanie komentarza – formularz pod artykułem do dodania komentarza.

Dodawanie odpowiedzi – możliwość odpowiedzi na komentarz.

Scenariusze użytkownika

Dodawanie artykułu

Użytkownik wypełnia formularz tytułu i treści.

Kliknięcie „Dodaj artykuł” zapisuje artykuł w bazie.

Przeglądanie artykułów

Użytkownik wchodzi na stronę główną.

Wyświetlana jest lista artykułów.

Kliknięcie artykułu otwiera szczegóły i komentarze.

Dodawanie komentarza

Użytkownik wpisuje komentarz w formularzu pod artykułem.

Kliknięcie „Dodaj komentarz” zapisuje go w bazie.

Dodawanie odpowiedzi na komentarz

Użytkownik klika „Odpowiedz” przy komentarzu.

Formularz odpowiedzi umożliwia dodanie treści.

Po wysłaniu odpowiedź pojawia się pod komentarzem.
