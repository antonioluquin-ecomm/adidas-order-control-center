# CLAUDE.md — Centro de Control de Pedidos Seller Adidas

## Contexto del proyecto

Interfaz HTML/CSS/JS conectada a Google Sheets via Apps Script para consolidar
pedidos entre PIM, VTEX y TMS Adidas, detectar inconsistencias y sugerir
acciones operativas.

## Stack

- Frontend: HTML + CSS + JavaScript Vanilla (sin frameworks, sin bundlers, sin npm)
- Backend: Google Apps Script (.gs) + Google Sheets

## Convenciones clave

- JavaScript sin ES modules — usar patrón de namespace global (`window.App`)
- Apps Script: cada archivo .gs tiene una responsabilidad única (ver estructura)
- El frontend consume la API del Apps Script desplegado como Web App (`doGet` → JSON)
- Cambios pequeños y auditables; no refactors masivos
- Seguir PROJECT_WORKFLOW.md en todo momento

## Estructura de archivos

Ver README.md.

## Lo que NO hacer

- No inventar reglas operativas no documentadas en `docs/reglas-estados.md`
- No agregar funcionalidades fuera de la etapa actual del roadmap
- No modificar múltiples módulos en un solo commit
- No usar localStorage / IndexedDB (MVP sin persistencia — ver `docs/persistencia.md`)
- No usar librerías externas sin consenso explícito
- No tocar el despliegue de Apps Script (solo escribir el código `.gs`)
