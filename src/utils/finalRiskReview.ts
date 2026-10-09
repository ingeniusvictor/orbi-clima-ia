export interface RiskReviewItem {
  id: string;
  category: string;
  risk: string;
  level: 'Bajo' | 'Medio' | 'Alto';
  mitigation: string;
  status: 'Mitigado' | 'Monitoreado' | 'Aceptado';
}

export const FINAL_RISK_REVIEW: RiskReviewItem[] = [
  {
    id: 'R1',
    category: 'Funcional',
    risk: 'La precisión del pronóstico depende del proveedor meteorológico externo Open-Meteo.',
    level: 'Medio',
    mitigation: 'Implementación de caché local, fallback de datos sintéticos y aviso claro al usuario.',
    status: 'Mitigado'
  },
  {
    id: 'R2',
    category: 'Android',
    risk: 'El usuario debe conceder permisos de ubicación para GPS.',
    level: 'Medio',
    mitigation: 'Fomento del uso de búsqueda manual y explicación del beneficio del GPS en terreno.',
    status: 'Mitigado'
  },
  {
    id: 'R3',
    category: 'Notificaciones',
    risk: 'Las notificaciones dependen de la configuración del sistema Android o capas de fabricantes.',
    level: 'Alto',
    mitigation: 'Instrucciones claras en la sección de Ayuda de la app para deshabilitar el ahorro de energía agresivo.',
    status: 'Monitoreado'
  },
  {
    id: 'R4',
    category: 'Widgets',
    risk: 'Los widgets de pantalla de inicio pueden experimentar demoras en refresco debido a restricciones de batería.',
    level: 'Medio',
    mitigation: 'Uso de patrones de actualización eficientes y advertencias del sistema en el simulador.',
    status: 'Mitigado'
  },
  {
    id: 'R5',
    category: 'Store / Privacidad',
    risk: 'La política de privacidad debe subirse a un sitio web público externo antes de enviar a Google Play.',
    level: 'Bajo',
    mitigation: 'Se entrega el borrador de Política de Privacidad completo para que el usuario lo aloje con un clic.',
    status: 'Aceptado'
  },
  {
    id: 'R6',
    category: 'Mantenimiento',
    risk: 'Obsolescencia tecnológica de APIs web de clima.',
    level: 'Bajo',
    mitigation: 'Canalizar modificaciones exclusivamente en la rama de servicio v1.0.x bajo la política de parches.',
    status: 'Aceptado'
  },
  {
    id: 'R7',
    category: 'HSE',
    risk: 'Dependencia indebida del operador en las alertas de la aplicación sobre los protocolos HSE físicos.',
    level: 'Alto',
    mitigation: 'Visualización obligatoria y constante de la Directiva HSE Terreno. Prohibición de anulación legal.',
    status: 'Mitigado'
  }
];
export function getResidualRiskSummary() {
  const high = FINAL_RISK_REVIEW.filter(r => r.level === 'Alto').length;
  const med = FINAL_RISK_REVIEW.filter(r => r.level === 'Medio').length;
  const low = FINAL_RISK_REVIEW.filter(r => r.level === 'Bajo').length;
  return { high, med, low };
}
export const NATIVE_HSE_DIRECTIVE = 'Directiva HSE Terreno: Las alertas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno ni instrucciones del empleador.';
export const EXCLUDED_TERM_HSEC = 'HSEC';
export const EXCLUDED_TERM_HASEC = 'HASEC';
