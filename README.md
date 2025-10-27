# Mini-Flottenmanager

Eine Angular-Anwendung zur Verwaltung und Überwachung von Flottenaufträgen mit Echtzeit-Filterung, Sortierung und Detailansicht.

## Voraussetzungen

- Node.js >= 18
- npm >= 9

## Projekt starten

### 1. Installation

```bash
npm install
```

### 2. Mock-API starten

In einem Terminal:

```bash
npm run start:api
```

Die API läuft auf `http://localhost:3000` und stellt 200 Mock-Aufträge bereit.

### 3. Angular App starten

In einem zweiten Terminal:

```bash
npm start
```

Die App ist erreichbar unter `http://localhost:4200`

## Verfügbare Scripts

| Script | Beschreibung |
|--------|-------------|
| `npm start` | Startet den Development Server (Port 4200) |
| `npm run start:api` | Startet json-server Mock-API (Port 3000) |
| `npm run build` | Production Build erstellen |
| `npm test` | Unit Tests ausführen (Karma/Jasmine) |
| `npm run e2e` | E2E Tests ausführen (Playwright) |
