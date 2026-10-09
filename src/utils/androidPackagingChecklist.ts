export interface PackagingChecklistItem {
  id: string;
  category: 'gradle' | 'assets' | 'signing' | 'validation' | 'preflight';
  label: string;
  completed: boolean;
  description: string;
}

const STORAGE_KEY = 'orbi_clima_packaging_checklist_v1';

export function getDefaultPackagingChecklist(): PackagingChecklistItem[] {
  return [
    // Gradle Release Checklist
    {
      id: 'g-compile',
      category: 'gradle',
      label: 'compileSdk revisado',
      completed: true,
      description: 'compileSdk apuntando al SDK 35 de Android para permitir el uso de APIs recientes de Android 15.'
    },
    {
      id: 'g-target',
      category: 'gradle',
      label: 'targetSdk >= 35 (Android 15)',
      completed: true,
      description: 'Requerido por la política de publicación de Google Play actual para nuevas aplicaciones.'
    },
    {
      id: 'g-min',
      category: 'gradle',
      label: 'minSdk definido (API 26 o superior)',
      completed: true,
      description: 'Asegura compatibilidad con widgets adaptativos de SkyOrb y notificaciones enriquecidas.'
    },
    {
      id: 'g-cap',
      category: 'gradle',
      label: 'Capacitor Android estable',
      completed: true,
      description: 'Puente Capacitor y Android Gradle Plugin (AGP) configurados a versiones estables y sincronizados.'
    },
    {
      id: 'g-glance',
      category: 'gradle',
      label: 'Jetpack Glance / Widgets estables',
      completed: true,
      description: 'Dependencias de Glance incluidas de forma nativa para el renderizado del widget meteorológico.'
    },
    {
      id: 'g-notif',
      category: 'gradle',
      label: 'Local Notifications sincronizadas',
      completed: true,
      description: 'Librerías de programación de notificaciones incluidas sin duplicación de clases.'
    },
    {
      id: 'g-proguard',
      category: 'gradle',
      label: 'Proguard/R8 de lanzamiento revisado',
      completed: false,
      description: 'Reglas de ofuscación habilitadas (minifyEnabled true) con excepciones para las clases del widget.'
    },

    // App Icon & Assets
    {
      id: 'a-adapt',
      category: 'assets',
      label: 'Icono adaptativo Android configurado',
      completed: true,
      description: 'Iconos adaptativos creados en carpetas mipmap-anydpi-v26 con soporte vectorial.'
    },
    {
      id: 'a-fore',
      category: 'assets',
      label: 'Foreground Icon preparado',
      completed: true,
      description: 'Capa frontal del logotipo de ORBI SkyCore sobre transparente, respetando márgenes de seguridad del 18%.'
    },
    {
      id: 'a-back',
      category: 'assets',
      label: 'Background Icon preparado',
      completed: true,
      description: 'Capa trasera del icono en color sólido profundo o gradiente alineado a la estética ORBI.'
    },
    {
      id: 'a-round',
      category: 'assets',
      label: 'Round Icon configurado',
      completed: true,
      description: 'Icono circular ic_launcher_round configurado en el manifiesto para compatibilidad con launchers heredados.'
    },
    {
      id: 'a-splash',
      category: 'assets',
      label: 'Splash Screen adaptativa revisada',
      completed: true,
      description: 'Cumple con los lineamientos de la API de Splash Screen de Android 12+, usando el logo vectorizado.'
    },
    {
      id: 'a-widgets',
      category: 'assets',
      label: 'Widget Preview Images preparadas',
      completed: false,
      description: 'Capturas de pantalla del widget guardadas en res/drawable como previsualizaciones para la bandeja de widgets.'
    },
    {
      id: 'a-store',
      category: 'assets',
      label: 'Screenshots de tienda planificados',
      completed: false,
      description: 'Set de capturas requeridas para Google Play (móvil y tablet) con textos explicativos de los perfiles.'
    },

    // Signed Build
    {
      id: 's-key',
      category: 'signing',
      label: 'Keystore creado localmente',
      completed: true,
      description: 'Keystore (.jks) generado en la máquina local usando la herramienta Keytool o Android Studio.'
    },
    {
      id: 's-ignore',
      category: 'signing',
      label: 'Keystore fuera de Git (.gitignore)',
      completed: true,
      description: 'Verificación estricta de que el archivo keystore y los archivos de contraseñas no se agregaron al repositorio.'
    },
    {
      id: 's-alias',
      category: 'signing',
      label: 'Alias de firma definido',
      completed: true,
      description: 'Nombre de alias único y registrado de forma privada para el certificado de lanzamiento.'
    },
    {
      id: 's-pass',
      category: 'signing',
      label: 'Contraseñas guardadas de forma segura',
      completed: true,
      description: 'Contraseñas del keystore y de la llave almacenadas en variables de entorno locales o gestor de claves.'
    },
    {
      id: 's-variant',
      category: 'signing',
      label: 'Build Variant configurado en Release',
      completed: false,
      description: 'Configuración en build.gradle para inyectar las llaves de firma en compilación local segura.'
    },
    {
      id: 's-aab',
      category: 'signing',
      label: 'Generación de Android App Bundle (AAB)',
      completed: false,
      description: 'Formato de entrega oficial requerido por Google Play que compila recursos y código optimizados.'
    },

    // AAB/APK Validation
    {
      id: 'l-aab',
      category: 'validation',
      label: 'AAB release generado con éxito',
      completed: false,
      description: 'Compilado final .aab libre de errores de ensamble.'
    },
    {
      id: 'l-apk',
      category: 'validation',
      label: 'APK de prueba universal generado',
      completed: false,
      description: 'APK generado a partir del AAB (usando bundletool) o de manera directa para pruebas locales.'
    },
    {
      id: 'l-install',
      category: 'validation',
      label: 'Instalación en dispositivo físico verificada',
      completed: false,
      description: 'Prueba en dispositivo físico Android real para validar rendimiento y tiempos de carga.'
    },
    {
      id: 'l-widget',
      category: 'validation',
      label: 'Widget responde en compilado release',
      completed: false,
      description: 'Comprobación de que el Widget del clima de ORBI se añade y actualiza correctamente.'
    },
    {
      id: 'l-notif',
      category: 'validation',
      label: 'Notificaciones funcionan en release',
      completed: false,
      description: 'Recepción y despliegue correcto de alertas inteligentes con el canal de notificación definido.'
    },
    {
      id: 'l-gps',
      category: 'validation',
      label: 'GPS y Open-Meteo funcionales',
      completed: false,
      description: 'Acceso a coordenadas y fetch de datos climáticos estables sin fallos de red en modo release.'
    },

    // Play Console Preflight
    {
      id: 'p-dev',
      category: 'preflight',
      label: 'Cuenta Google Play Developer activa',
      completed: true,
      description: 'Cuenta de desarrollador registrada y verificada en la consola de Google Play.'
    },
    {
      id: 'p-meta',
      category: 'preflight',
      label: 'Ficha de Google Play (Ficha Principal) lista',
      completed: true,
      description: 'Nombre de la aplicación, descripción corta y descripción larga completadas en la sección de presencia.'
    },
    {
      id: 'p-cat',
      category: 'preflight',
      label: 'Categoría y etiquetas asignadas',
      completed: true,
      description: 'Asignado a la categoría "Weather/Clima" con etiquetas relevantes para máxima visibilidad.'
    },
    {
      id: 'p-privacy',
      category: 'preflight',
      label: 'URL de Política de Privacidad preparada',
      completed: false,
      description: 'La política de privacidad local exportada debe alojarse en un sitio web público antes de enviar la app.'
    },
    {
      id: 'p-safety',
      category: 'preflight',
      label: 'Data Safety Declarado en borrador',
      completed: true,
      description: 'Declaración de seguridad de datos de Google Play que especifica qué datos de ubicación se recolectan.'
    },
    {
      id: 'p-internal',
      category: 'preflight',
      label: 'Track de pruebas internas preparado',
      completed: false,
      description: 'Configuración de la lista de correos de testers autorizados para el canal de pruebas inicial.'
    }
  ];
}

export function loadPackagingChecklist(): PackagingChecklistItem[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed: PackagingChecklistItem[] = JSON.parse(saved);
      // Ensure any new ones are appended if template changes
      const defaults = getDefaultPackagingChecklist();
      const existingIds = new Set(parsed.map(i => i.id));
      const missing = defaults.filter(d => !existingIds.has(d.id));
      if (missing.length > 0) {
        return [...parsed, ...missing];
      }
      return parsed;
    } catch (e) {
      console.error('Error parsing packaging checklist, returning default:', e);
    }
  }
  return getDefaultPackagingChecklist();
}

export function savePackagingChecklist(items: PackagingChecklistItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
