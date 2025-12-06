# docs/technical.md

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
