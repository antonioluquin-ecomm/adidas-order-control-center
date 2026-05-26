# Centro de Control de Pedidos Seller Adidas

Interfaz operativa HTML + CSS + JavaScript conectada a Google Sheets mediante Apps Script
para consolidar y analizar inconsistencias de pedidos entre PIM, VTEX y TMS Adidas.

## Objetivos

- Consolidar pedidos automáticamente.
- Detectar inconsistencias.
- Sugerir acciones operativas.
- Centralizar seguimiento.
- Reducir análisis manual.
- Mejorar trazabilidad.

## Stack

- HTML + CSS + JavaScript Vanilla (sin frameworks)
- Google Apps Script
- Google Sheets

## Principios

- estabilidad primero;
- modularización progresiva;
- evitar refactors masivos;
- cambios pequeños y auditables;
- documentación continua.

## Estructura de archivos

```
adidas-order-control-center/
├── README.md
├── PROJECT_WORKFLOW.md
├── CLAUDE.md
├── .gitignore
├── docs/
│   ├── roadmap.md
│   ├── arquitectura.md
│   ├── estructura-sheets.md
│   ├── reglas-estados.md
│   ├── normalizacion-estados.md
│   ├── ux-operativa.md
│   ├── flujo-operativo.md
│   ├── persistencia.md
│   └── test-matrix.md
├── apps-script/
│   ├── Code.gs
│   ├── config.gs
│   ├── normalizers.gs
│   ├── consolidator.gs
│   ├── rules-engine.gs
│   ├── sheets.gs
│   ├── api.gs
│   └── utils.gs
└── frontend/
    ├── index.html
    ├── css/
    │   └── main.css
    └── js/
        ├── main.js
        ├── api.js
        ├── table.js
        ├── filters.js
        └── dashboard.js
```

## Setup

### Apps Script

1. Crear un Google Sheets con las hojas definidas en [`docs/estructura-sheets.md`](docs/estructura-sheets.md).
2. Abrir Apps Script (Extensiones → Apps Script).
3. Copiar el contenido de `apps-script/*.gs` en los archivos correspondientes.
4. Verificar y ajustar los nombres de columna en `config.gs`.
5. Desplegar como Web App (Ejecutar como: yo — Acceso: Cualquier usuario).
6. Copiar la URL del despliegue en `frontend/js/api.js` → `App.API_URL`.

### Frontend

Abrir `frontend/index.html` en el navegador o servir desde cualquier servidor estático.

## Documentación

| Documento | Descripción |
|---|---|
| [docs/roadmap.md](docs/roadmap.md) | Etapas de implementación con tareas técnicas |
| [docs/arquitectura.md](docs/arquitectura.md) | Arquitectura técnica y contrato de API |
| [docs/estructura-sheets.md](docs/estructura-sheets.md) | Hojas requeridas en Google Sheets |
| [docs/reglas-estados.md](docs/reglas-estados.md) | Reglas operativas por combinación de estados |
| [docs/normalizacion-estados.md](docs/normalizacion-estados.md) | Normalización de estados por fuente |
| [docs/ux-operativa.md](docs/ux-operativa.md) | Principios y componentes de la interfaz |
| [docs/flujo-operativo.md](docs/flujo-operativo.md) | Flujo de trabajo del operador |
| [docs/persistencia.md](docs/persistencia.md) | Decisiones de persistencia del MVP |
| [docs/test-matrix.md](docs/test-matrix.md) | Casos de prueba esperados |
