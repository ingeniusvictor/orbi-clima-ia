# ORBI Clima IA - Borrador de Declaración Data Safety (Google Play)

Este documento contiene las respuestas orientativas preparadas para rellenar el formulario de Seguridad de Datos (Data Safety) en Google Play Console.

---

## Sección 1: Ubicación (Location)

### Tipo de Datos:
- **Ubicación aproximada (Approximate Location)**
- **Ubicación precisa (Precise Location)**

### ¿Se recopila este tipo de datos?
**Sí**.

### ¿Se comparten estos datos?
**No**. La app no los transmite a ningún backend propio ni a terceros. Las coordenadas se envían directamente de forma anónima al proveedor público Open-Meteo para obtener el clima de la posición consultada.

### ¿Se procesan de forma efímera?
**Sí**. Las coordenadas obtenidas por GPS no se registran persistentemente a menos que el usuario guarde la ubicación de forma manual en su dispositivo como "Ubicación preferida".

### Finalidades de uso declaradas:
- **Funcionalidad de la app (App Functionality)**: Necesario para mostrar el pronóstico meteorológico local correcto al usuario.

---

## Sección 2: Configuración y Preferencias (App Preferences)

### Tipo de Datos:
- **Preferencias de la aplicación (App Preferences / Settings)**

### ¿Se recopila este tipo de datos?
**Sí**, se almacenan en el almacenamiento local del dispositivo.

### ¿Se comparten estos datos?
**No**. No se envían a ningún servidor en la nube ni backend de terceros.

### Finalidades de uso declaradas:
- **Personalización (Personalization)**: Se utiliza para recordar el perfil seleccionado (Persona o Técnico), umbrales de sensibilidad de alertas, horario silencioso y widgets favoritos.

---

## Sección 3: Historial y Notificaciones (Notification Preferences)

### Tipo de Datos:
- **Preferencias de Notificaciones e Historial de Alertas Locales**

### ¿Se recopila este tipo de datos?
**Sí**, localmente en el dispositivo.

### ¿Se comparten estos datos?
**No**.

### Finalidades de uso declaradas:
- **Funcionalidad de la app (App Functionality)**: Permite almacenar el historial de notificaciones enviadas para que el usuario pueda revisarlas y verificar el estado del Scheduler.

---

## Sección 4: Memoria de Uso (Usage History / Local Patterns)

### Tipo de Datos:
- **Patrones simples de uso (Ubicaciones frecuentes, perfil más usado, widgets favoritos)**

### ¿Se recopila este tipo de datos?
**Sí**, únicamente en la memoria climática local en localStorage.

### ¿Se comparten estos datos?
**No**.

### Finalidades de uso declaradas:
- **Personalización (Personalization)**: Se utiliza para sugerir de forma no invasiva cambios de perfil o widgets que se adapten mejor al patrón local del usuario.

---

### NOTA IMPORTANTE PARA EL DESARROLLADOR:
La declaración de Data Safety en Google Play Console es vinculante. Asegúrate de que no se incluyan SDKs de anuncios, analíticas de terceros u otros plugins que recopilen datos sin ser declarados.