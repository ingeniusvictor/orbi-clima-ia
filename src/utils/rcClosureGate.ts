export interface ClosureGateCriteria {
  id: string;
  name: string;
  description: string;
}

export const RC_CLOSURE_CRITERIA: ClosureGateCriteria[] = [
  { id: 'qa-score', name: 'Puntaje QA >= 95%', description: 'Asegura que el centro de pruebas QA tenga un puntaje verde' },
  { id: 'pkg-score', name: 'Packaging Score >= 95%', description: 'Requiere que la configuración técnica de compilación esté lista' },
  { id: 'store-score', name: 'Store Readiness >= 90%', description: 'Exige la compleción de los textos, privacidad y Data Safety' },
  { id: 'notes-approved', name: 'Release Notes Aprobadas', description: 'Revisión y autorización del texto del changelog final' },
  { id: 'protocol-approved', name: 'Protocolo de Testing Aprobado', description: 'Conformidad con las directrices de Play Console' },
  { id: 'testers-completed', name: 'Fidelidad de Testing en Terreno', description: 'Requiere al menos 1 tester técnico y 1 general completados' }
];
