# Mini-Flottenmanager

[![CI/CD Pipeline](https://github.com/FatihGueltekin/mini-fleet-manager/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/FatihGueltekin/mini-fleet-manager/actions)

Eine Angular-Anwendung zur Verwaltung und Überwachung von Flottenaufträgen mit Echtzeit-Filterung, Sortierung und Detailansicht.

**🌐 Live Demo:** https://fatihgueltekin.github.io/mini-fleet-manager

## 🚀 Features

### MUSS-Kriterien (alle erfüllt)
- ✅ **Tabelle mit allen Spalten**: ID, Status, Priorität, Quelle, Ziel, Fahrzeug, Erstellt am, ETA, Dauer (min)
- ✅ **Sortierung**: Klickbare Spaltenüberschriften für Auf-/Absteigende Sortierung
- ✅ **Filterung**: Textsuche über ID, Quelle, Ziel und Fahrzeug
- ✅ **Pagination**: 25/50/100 Einträge pro Seite mit Navigation
- ✅ **Status-Badges**: Farbcodierte Chips (Orange=queued, Blau=in_progress, Grün=completed, Rot=failed)
- ✅ **EU-Datumsformat**: TT.MM.JJJJ HH:mm in deutscher Lokalisierung
- ✅ **Datenservice**: Saubere Trennung Model/Service/UI mit Lade- und Fehlerzuständen
- ✅ **Tests**: Playwright E2E Tests (6 Testszenarien, 24 Tests über 3 Browser)
- ✅ **Developer Experience**: README, Scripts, einfacher Start

### Nice-to-Have (ALLE implementiert!)
- ✅ **Detailansicht**: Expandierbare Zeilen mit Animation direkt unter dem geklickten Auftrag
- ✅ **Signals**: Moderne Angular Signals für reaktive State-Verwaltung (loading, error, selectedOrder)
- ✅ **Zoneless Change Detection**: Verbesserte Performance durch Zone.js-freie Architektur
- ✅ **E2E Tests**: Playwright Tests für alle Kernfunktionen
- ✅ **Spaltenauswahl**: Dynamisches Ein-/Ausblenden von Tabellenspalten via Menu
- ✅ **URL-State**: Filter, Pagination und Sortierung werden in URL gespeichert (Bookmarkable, Shareable)
- ✅ **Reactive Forms**: Filter mit debounced Reactive Form Control
- ✅ **CI/CD**: GitHub Actions Pipeline mit Build, Test und Deploy

## 🛠️ Tech Stack

- **Angular 20.3** (neueste Version mit modernster Syntax)
- **New Control Flow Syntax** (@if, @for statt *ngIf, *ngFor)
- **Angular Material 20.2** für UI-Komponenten
- **TypeScript 5.9**
- **RxJS 7.8** für asynchrone Datenströme
- **Playwright 1.56** für E2E Tests
- **json-server** für Mock-API

## 📋 Voraussetzungen

- Node.js ≥ 18
- npm ≥ 9

## 🏁 Schnellstart

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

## 📦 Verfügbare Scripts

| Script | Beschreibung |
|--------|-------------|
| `npm start` | Startet den Development Server (Port 4200) |
| `npm run start:api` | Startet json-server Mock-API (Port 3000) |
| `npm run build` | Production Build erstellen |
| `npm test` | Unit Tests ausführen (Karma/Jasmine) |
| `npm run e2e` | E2E Tests ausführen (Playwright) |

## 🧪 Tests

### E2E Tests mit Playwright

Die Anwendung verfügt über umfassende E2E Tests:

```bash
# Tests ausführen
npm run e2e

# Tests im UI-Modus ausführen
npx playwright test --ui

# Nur einen Browser testen
npx playwright test --project=chromium
```

**Testabdeckung:**
- ✅ Tabelle lädt und zeigt Daten an
- ✅ Auftrags-Daten werden korrekt dargestellt
- ✅ Filterung funktioniert
- ✅ Sortierung nach Spalten
- ✅ Pagination zwischen Seiten
- ✅ Status-Badges mit korrekten Farben

**Test-Ergebnisse:** 24/24 Tests bestanden (Chromium, Firefox, WebKit)

## 🏗️ Architektur

### Projektstruktur

```
src/
├── app/
│   ├── components/
│   │   └── orders-table/          # Haupt-Tabellenkomponente
│   │       ├── orders-table.ts    # Komponenten-Logik
│   │       ├── orders-table.html  # Template
│   │       └── orders-table.css   # Styles
│   ├── services/
│   │   └── orders.ts              # Datenservice + Order Interface
│   ├── app.config.ts              # App-Konfiguration
│   └── app.ts                     # Root-Komponente
├── main.ts                        # Bootstrap
└── orders.json                    # Mock-Daten (200 Aufträge)
```

### Design-Entscheidungen

#### Signals vs. RxJS State
**Gewählt: Signals**

**Begründung:**
- Angular 20 empfiehlt Signals als moderne Alternative zu Zone.js
- Zoneless Change Detection für bessere Performance
- Feinere Kontrolle über Reaktivität
- Einfacherer Code ohne komplexe Subscription-Management
- RxJS wird weiterhin für HTTP-Calls verwendet (Best Practice)

```typescript
// Beispiel Signal-Nutzung
selectedOrder = signal<Order | null>(null);

selectOrder(order: Order): void {
  this.selectedOrder.set(order);  // Reactive Update
}
```

#### Zoneless Change Detection
Die App nutzt `provideZonelessChangeDetection()` statt Zone.js:
- ✅ Bessere Performance (kein monkey-patching)
- ✅ Explizite Reaktivität durch Signals
- ✅ Moderne Angular Best Practice

## 🎨 UI/UX Features

- **Responsive Design**: Funktioniert auf Desktop und Tablet
- **Material Design**: Konsistente UI mit Angular Material
- **Hover-Effekte**: Visuelle Rückmeldung bei Zeilen-Hover
- **Expandable Rows**: Details klappen animiert unter der Zeile auf
- **Toggle-Funktion**: Erneutes Klicken schließt die Detailansicht
- **Loading State**: Anzeige während Daten geladen werden
- **Error Handling**: Benutzerfreundliche Fehlermeldungen
- **Spaltenauswahl**: Button mit Checkbox-Menu zum Ein-/Ausblenden von Spalten
- **Debounced Search**: Suche mit 300ms Verzögerung für bessere Performance
- **URL-Persistenz**: Teile Links mit aktivem Filter/Sortierung/Seite

## 📊 Datenmodell

```typescript
interface Order {
  id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  target: string;
  vehicleId?: string;
  createdAt: string;
  eta?: string;
  durationMinutes?: number;
}
```

## 🔧 Konfiguration

### Deutsche Lokalisierung
Die App ist vollständig auf Deutsch konfiguriert:
- Datumsformat: `dd.MM.yyyy HH:mm`
- Sprachcode: `de-DE`
- UI-Texte: Deutsch

### Angular Material Theme
Standard Material Design Theme mit Indigo/Pink Farbschema.

## 🚀 Production Build

```bash
npm run build
```

Build-Artefakte werden im `dist/` Verzeichnis erstellt und sind für Deployment bereit.

## 🔄 CI/CD Pipeline

Die App verfügt über eine vollautomatische CI/CD Pipeline mit GitHub Actions.

### Pipeline Features:
- ✅ **Multi-Node Testing**: Tests auf Node.js 18.x und 20.x
- ✅ **Automated Build**: Production Build bei jedem Push
- ✅ **E2E Tests**: Playwright Tests in Chromium
- ✅ **Artifact Upload**: Build-Artefakte und Test-Reports
- ✅ **Auto-Deploy**: Deployment zu GitHub Pages bei Push auf `main`

### Workflow Trigger:
- Push auf `main` oder `develop` Branch
- Pull Requests zu `main` oder `develop`

### Workflow-Datei:
`.github/workflows/ci.yml`

### Status Badge:
```markdown
![CI/CD](https://github.com/USERNAME/mini-fleet-manager/workflows/CI%2FCD%20Pipeline/badge.svg)
```

## 🐛 Bekannte Einschränkungen

Keine bekannten kritischen Bugs. Die Anwendung erfüllt alle MUSS-Kriterien vollständig.

## 📝 Lizenz

Dieses Projekt wurde als Bewerberaufgabe erstellt.

## 👤 Autor

Bewerberaufgabe: Mini-Flottenmanager (Angular)
