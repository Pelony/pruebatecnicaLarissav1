# Notas del Proyecto

## 🧠 Decisiones técnicas

- Se optó por **JWT con refresh token en cookie HTTP-only** para mejorar la seguridad y permitir persistencia de sesión.
- La validación de sesión se realiza **del lado del cliente**, evitando problemas comunes de SSR al trabajar con cookies cross-domain.
- Se utilizó **Nuxt UI 4 Dashboard** para construir una interfaz moderna, consistente y enfocada en la experiencia de usuario.
- El backend fue diseñado de forma **modular** (auth, users, expenses), siguiendo buenas prácticas de NestJS para facilitar mantenimiento y escalabilidad.
- Se eligió **TypeORM** para el manejo de la base de datos y migraciones, priorizando claridad en el modelo de datos.

---

## ⚠️ Desafíos enfrentados

- Manejo correcto de cookies **cross-site** entre frontend (localhost / Vercel) y backend (Render).
- Evitar redirecciones incorrectas durante el renderizado inicial (SSR) en Nuxt.
- Sincronizar adecuadamente el **refresh token** con middleware y estado global del frontend.
- Ajustar los layouts del **Nuxt UI Dashboard** para que el contenido se renderizara correctamente dentro del panel.
- Adaptación a la arquitectura y convenciones de **NestJS**, ya que fue la primera vez que se utilizó este framework como backend principal.

---

## 🔮 Posibles mejoras futuras

- Manejo más avanzado de usuarios, roles y permisos.
- Recuperación y restablecimiento de contraseña.
- Implementación de **tests unitarios**.
- Gráficos más avanzados y opciones de exportación adicionales.
- Mejoras en la experiencia de usuario (feedback visual, animaciones, accesibilidad).

---

## ⏱️ Tiempo invertido aproximado

- Backend: ~4–8 horas  
- Frontend: ~4–8 horas  
- Integración y despliegue: ~2 horas  

Tiempo total aproximado: **10–18 horas**

---

## 📌 Comentarios finales

Este proyecto representó la primera experiencia desarrollando un backend completo con NestJS y TypeORM 
A pesar de ser una tecnología nueva dentro de mi stack, se logró completar exitosamente la funcionalidad requerida, implementando autenticación, persistencia de sesión y una arquitectura clara y mantenible ademas de el objetivo de la prueba que es la gestion de gastos completando el CRUD y los endpoints requeridos.

El desarrollo permitió consolidar conceptos importantes como autenticación segura, manejo de estados en frontend y comunicación entre servicios en distintos entornos, sentando una base sólida para proyectos de mayor escala en el futuro.
