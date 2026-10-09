# ORBI Clima IA — FINAL RISK REVIEW & MITIGATION

Aviso Principal:
> Directiva HSE Terreno: Las alertas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno ni instrucciones del empleador.

| ID | Categoría | Riesgo Identificado | Nivel de Riesgo | Mitigación Aplicada | Estado |
|---|---|---|---|---|---|
| R1 | Funcional | La precisión del pronóstico depende del proveedor meteorológico externo Open-Meteo. | Medio | Implementación de caché local, fallback de datos sintéticos y aviso claro al usuario. | Mitigado |
| R2 | Android | El usuario debe conceder permisos de ubicación para GPS. | Medio | Fomento del uso de búsqueda manual y explicación del beneficio del GPS en terreno. | Mitigado |
| R3 | Notificaciones | Las notificaciones dependen de la configuración del sistema Android o capas de fabricantes. | Alto | Instrucciones claras en la sección de Ayuda de la app para deshabilitar el ahorro de energía agresivo. | Monitoreado |
| R4 | Widgets | Los widgets de pantalla de inicio pueden experimentar demoras en refresco debido a restricciones de batería. | Medio | Uso de patrones de actualización eficientes y advertencias del sistema en el simulador. | Mitigado |
| R5 | Store / Privacidad | La política de privacidad debe subirse a un sitio web público externo antes de enviar a Google Play. | Bajo | Se entrega el borrador de Política de Privacidad completo para que el usuario lo aloje con un clic. | Aceptado |
| R6 | Mantenimiento | Obsolescencia tecnológica de APIs web de clima. | Bajo | Canalizar modificaciones exclusivamente en la rama de servicio v1.0.x bajo la política de parches. | Aceptado |
| R7 | HSE | Dependencia indebida del operador en las alertas de la aplicación sobre los protocolos HSE físicos. | Alto | Visualización obligatoria y constante de la Directiva HSE Terreno. Prohibición de anulación legal. | Mitigado |
