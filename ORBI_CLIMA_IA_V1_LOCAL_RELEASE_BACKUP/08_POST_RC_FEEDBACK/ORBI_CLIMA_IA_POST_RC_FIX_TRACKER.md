# ORBI Clima IA — Tracker de Correcciones Post-RC

**Versión:** 1.0.0-local-release
**Fecha de Reporte:** 01-07-2026 4:29:30 p. m.
**Total de Correcciones:** 2

## 🛠️ Listado de Parches y Correcciones

### 1. [P2] Compactar y ocultar secciones avanzadas de Home Móvil
- **Severidad de Entrada:** MEDIUM
- **Estado:** VALIDATED
- **Encargado:** Equipo UX
- **Descripción:** Se colapsaron o removieron los paneles innecesarios de MobileHomeScreen para Android para evitar scroll excesivo en terreno.
- **Evidencia de Corrección:** Se implementó un diseño de una sola columna compacto con sections colapsables mediante CompactSectionCard.
- **Notas de Validación:** Probado en simulador y dispositivo real. Altura de scroll reducida en un 40%.
- **Feedback Origen (IDs):** fb1

---

### 2. [P2] Ajustar microcopy descriptivo de origen de datos cached/fallback
- **Severidad de Entrada:** LOW
- **Estado:** CLOSED
- **Encargado:** Desarrollador
- **Descripción:** Reemplazar etiquetas genéricas con mensajes amigables y de preservación de seguridad.
- **Evidencia de Corrección:** Modificadas las funciones auxiliares de traducción en MobileHomeScreen y mapeo de clima.
- **Notas de Validación:** Revisado el linter, los textos cortos se ven impecables.
- **Feedback Origen (IDs):** fb2

---


**Directiva HSE Terreno:** Las alertas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno ni instrucciones del empleador.