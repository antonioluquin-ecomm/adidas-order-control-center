# Project Workflow

## Principios

- No realizar refactors masivos.
- Mantener compatibilidad.
- Priorizar estabilidad.
- Modularización progresiva.
- Validaciones acotadas.
- Smoke tests manuales.
- Cambios auditables.

## Metodología

- Frontend separado del backend.
- Apps Script modular.
- Documentación obligatoria.
- Cambios pequeños por etapa.

## Arquitectura recomendada

```text
apps-script/
├── Code.gs
├── config.gs
├── normalizers.gs
├── consolidator.gs
├── rules-engine.gs
├── sheets.gs
├── api.gs
└── utils.gs
```
