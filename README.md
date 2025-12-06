# README.md

## Opis aplikacji
Aplikacja jest prostym systemem do publikowania artykułów i zarządzania komentarzami. Umożliwia użytkownikom tworzenie artykułów, przeglądanie istniejących wpisów, dodawanie komentarzy oraz odpowiadanie na komentarze innych użytkowników.

## Główne funkcjonalności
- Dodawanie artykułów.
- Przeglądanie listy artykułów.
- Dodawanie komentarzy do artykułów.
- Odpowiadanie na komentarze.
- Responsywny interfejs użytkownika.
- Obsługa prostego API REST.

## Technologie użyte w projekcie
- Frontend: HTML, CSS, JavaScript (lub framework np. React/Vue)
- Backend: Node.js + Express (lub inny)
- Baza danych: MongoDB (lub inna)
- Hosting: GitHub Pages (frontend), Heroku / Railway / Vercel (backend)

# docs/functional.md

## Widoki
1. **Lista artykułów** – przeglądanie wszystkich artykułów.
2. **Widok artykułu** – szczegóły artykułu wraz z komentarzami.
3. **Dodawanie artykułu** – formularz do dodawania nowego artykułu.
4. **Dodawanie komentarza** – formularz pod artykułem do dodania komentarza.
5. **Dodawanie odpowiedzi** – możliwość odpowiedzi na komentarz.

## Scenariusze użytkownika
1. **Dodawanie artykułu**
   - Użytkownik wypełnia formularz tytułu i treści.
   - Kliknięcie „Dodaj artykuł” zapisuje artykuł w bazie.
2. **Przeglądanie artykułów**
   - Użytkownik wchodzi na stronę główną.
   - Wyświetlana jest lista artykułów.
   - Kliknięcie artykułu otwiera szczegóły i komentarze.
3. **Dodawanie komentarza**
   - Użytkownik wpisuje komentarz w formularzu pod artykułem.
   - Kliknięcie „Dodaj komentarz” zapisuje go w bazie.
4. **Dodawanie odpowiedzi na komentarz**
   - Użytkownik klika „Odpowiedz” przy komentarzu.
   - Formularz odpowiedzi umożliwia dodanie treści.
   - Po wysłaniu odpowiedź pojawia się pod komentarzem.

## Architektura
Aplikacja oparta jest na modelu klient-serwer.  
- Frontend obsługuje interakcje użytkownika i wysyła żądania do API.  
- Backend realizuje logikę aplikacji, zarządza bazą danych i obsługuje żądania HTTP.  
- Dane przechowywane są w bazie danych w formie artykułów i komentarzy.

## Endpointy API
| URL | Metoda | Opis | Parametry | Body | Response |
|-----|--------|------|-----------|------|----------|
| `/api/articles` | GET | Pobierz wszystkie artykuły | - | - | Lista artykułów |
| `/api/articles` | POST | Dodaj nowy artykuł | - | `{ title, content, author }` | Stworzony artykuł |
| `/api/articles/:id/comments` | GET | Pobierz komentarze do artykułu | `id` (artykułu) | - | Lista komentarzy |
| `/api/articles/:id/comments` | POST | Dodaj komentarz | `id` (artykułu) | `{ content, author }` | Stworzony komentarz |
| `/api/comments/:id/replies` | POST | Dodaj odpowiedź do komentarza | `id` (komentarza) | `{ content, author }` | Stworzona odpowiedź |

## Model danych
### Artykuł
- `id` (string, unikalny)
- `title` (string)
- `content` (string)
- `author` (string)
- `comments` (lista ID komentarzy)

### Komentarz
- `id` (string, unikalny)
- `content` (string)
- `author` (string)
- `articleId` (ID artykułu)
- `replies` (lista ID odpowiedzi)

### Odpowiedź
- `id` (string, unikalny)
- `content` (string)
- `author` (string)
- `commentId` (ID komentarza)


## Instrukcja uruchomienia lokalnie
1. Sklonuj repozytorium:  
   ```bash
   git clone <link_do_repo>
   ```
2. Przejdź do katalogu projektu:  
   ```bash
   cd <nazwa_projektu>
   ```
3. Zainstaluj zależności:  
   ```bash
   npm install
   ```
4. Uruchom serwer:  
   ```bash
   npm start
   ```
5. Otwórz przeglądarkę pod adresem `http://localhost:3000` (lub wskazanym w terminalu).

## Hosting
- Aplikacja hostowana pod adresem: [link do hostingu]
- GitHub Pages (frontend): [link do GitHub Pages]

## Prezentacja i nagranie
- Prezentacja PDF: [link do PDF]
- Nagranie wideo: [link do wideo]
