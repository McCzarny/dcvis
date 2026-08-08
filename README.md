# Data Center Domiechowice

Interaktywne narzędzie do wizualizacji informacji na temat planów inwestycji Data Center w Domiechowicach.

>  [!IMPORTANT]
> Projekt jest w fazie rozwoju i nie jest jeszcze gotowy do użytku publicznego. Wszelkie dane i funkcjonalności są poglądowe i wymagają dalszej weryfikacji.

## O projekcie

Portal umożliwia:
- Interaktywną eksplorację map z danymi o wpływie planowanej inwestycji
- Wizualizację warstw tematycznych (hałas, temperatura, obszary chronione, zabudowa mieszkalna)

## Technologia

Projekt został zbudowany przy użyciu:
- **React 18** + TypeScript
- **Leaflet** – biblioteka do interaktywnych map
- **Vite** – nowoczesny build tool
- **Tailwind CSS** – stylizacja interfejsu
- **Recharts** – wykresy i symulatory

## Instalacja

### Wymagania
- Node.js 16+
- npm lub yarn

### Kroki instalacji

```bash
# Klonuj repozytorium
git clone <adres-repozytorium>
cd dcvis

# Zainstaluj zależności
npm install
```

## Uruchomienie

### Tryb deweloperski

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:5173`

### Build produkcyjny

```bash
npm run build
```

Wygenerowany kod będzie w folderze `dist/`

### Podgląd wersji produkcyjnej

```bash
npm run preview
```

## Publikowanie na GitHub Pages

Projekt jest konfigurowany do automatycznego publikowania na GitHub Pages przy każdym push do gałęzi `main` lub `master`.

### Automatyczny deploy (GitHub Actions)

1. Skonfiguruj GitHub Pages w ustawieniach repozytorium:
   - Settings → Pages → Source: GitHub Actions

2. Po push do `main`/`master` workflow automatycznie:
   - Buduje projekt
   - Publikuje na GitHub Pages

Aplikacja będzie dostępna pod adresem: `https://[twoja-nazwa].github.io/dcvis/`

### Ręczny deploy

Jeśli chcesz deployować lokalnie, zainstaluj `gh-pages`:

```bash
npm install --save-dev gh-pages
npm run deploy
```

## Struktura projektu

```
src/
├── components/        # Komponenty React (mapa, panele, modały)
├── data/             # Dane GIS i rejestr warstw
├── types/            # Definicje typów TypeScript
├── utils/            # Funkcje pomocnicze
└── App.tsx           # Komponent główny
```

## Konfiguracja

- **`tailwind.config.js`** – konfiguracja stylów
- **`tsconfig.json`** – ustawienia TypeScript
- **`vite.config.ts`** – konfiguracja build tool
