# 📚 CONTEXT ENGINEERING - PODENZA

## 🎯 Objetivo
Esta carpeta contiene toda la **ingeniería de contexto** para el desarrollo de la plataforma PODENZA. Es la **fuente única de verdad** para arquitectura, reglas de código, branding, y planificación que debe consultar cualquier agente de desarrollo.

---

## 📂 Estructura de Documentación

### **📋 Documentos Principales**

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| **[Arquitectura.md](./Arquitectura.md)** | 🏗️ Arquitectura completa del sistema | ✅ |
| **[Seguridad-y-Reglas.md](./Seguridad-y-Reglas.md)** | 🛡️ Reglas de seguridad y mejores prácticas | ✅ |
| **[Branding.md](./Branding.md)** | 🎨 Sistema de branding y diseño | ✅ |
| **[Plan-de-Trabajo.md](./Plan-de-Trabajo.md)** | 📋 Plan de trabajo detallado con checkboxes | ✅ |
| **[External-Integrations-Best-Practices.md](./External-Integrations-Best-Practices.md)** | 🔌 Mejores prácticas para integraciones | ✅ |

### **📁 Carpetas de Soporte**

| Carpeta | Propósito | Estado |
|---------|-----------|--------|
| **[HU/](./HU/)** | 👥 Historias de usuario organizadas por módulo | ✅ |

---

## 🔍 Guía de Uso para Agentes de Desarrollo

### **📖 Orden de Lectura Recomendado**

1. **[Arquitectura.md](./Arquitectura.md)** - Entender el stack tecnológico completo
2. **[Seguridad-y-Reglas.md](./Seguridad-y-Reglas.md)** - Conocer las reglas de código obligatorias
3. **[Branding.md](./Branding.md)** - Aplicar el sistema de diseño consistente
4. **[Plan-de-Trabajo.md](./Plan-de-Trabajo.md)** - Identificar tareas y prioridades
5. **[External-Integrations-Best-Practices.md](./External-Integrations-Best-Practices.md)** - Implementar integraciones seguras

### **🎯 Casos de Uso por Tipo de Tarea**

#### **🔧 Desarrollo de Nueva Funcionalidad**
1. Consultar **Plan-de-Trabajo.md** para verificar prioridad y estado
2. Revisar **Arquitectura.md** para ubicación de archivos y patrones
3. Aplicar **Seguridad-y-Reglas.md** durante implementación
4. Seguir **Branding.md** para consistencia visual

#### **🔌 Implementación de Integración Externa**
1. Consultar **External-Integrations-Best-Practices.md** para el servicio específico
2. Aplicar **Seguridad-y-Reglas.md** para validaciones y audit trails
3. Seguir **Arquitectura.md** para ubicación de packages

#### **🎨 Trabajo de UI/UX**
1. Seguir **Branding.md** como fuente única de verdad
2. Consultar **Arquitectura.md** para componentes existentes
3. Aplicar **Seguridad-y-Reglas.md** para estados de seguridad

#### **🛡️ Implementación de Seguridad**
1. **Seguridad-y-Reglas.md** como guía principal
2. **Arquitectura.md** para configuración de RLS y Auth
3. **External-Integrations-Best-Practices.md** para APIs externas

---

## 🏗️ Resumen de Arquitectura

### **Stack Tecnológico Principal**
- **Frontend**: Next.js 15.1.7 + React 19.0.0 + TypeScript 5.7.3
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **UI**: Tailwind CSS 4.0.6 + Shadcn UI + Radix UI
- **State**: TanStack Query 5.64.1 + React Hook Form 7.54.2
- **Build**: Turborepo (Monorepo)
- **Deploy**: Vercel

### **Módulos Principales**
```
🔐 Autenticación (✅ Completo)
🏠 Dashboard (✅ Completo)
📄 Gestión de Solicitudes (🔄 Base + Workbench)
🏦 Integración Bancaria (📋 Planificado)
📱 Comunicaciones (📋 Planificado)
🤖 IA y Automatización (📋 Planificado)
```

---

## 🛡️ Reglas de Seguridad Críticas

### **🔒 Autenticación y Autorización**
- **RLS habilitado** en todas las tablas
- **JWT tokens** con renovación automática
- **MFA disponible** para usuarios críticos
- **Row Level Security** para aislamiento de datos

### **🔐 Validación de Datos**
- **Zod schemas** obligatorios para todos los inputs
- **Sanitización** de contenido antes de procesamiento
- **Rate limiting** en todas las APIs públicas
- **Audit logging** para acciones críticas

### **🌐 Integraciones Externas**
- **mTLS** para APIs bancarias
- **Webhook signatures** verificadas siempre
- **Datos sensibles** encriptados en tránsito
- **Timeouts y retries** configurados

---

## 🎨 Sistema de Branding

### **🎯 Colores Principales**
- **Verde PODENZA**: `#E7FF8C` (60% - Elementos de marca)
- **Naranja Acción**: `#FF931E` (10% - CTAs críticos)
- **Verde Oscuro**: `#2C3E2B` (30% - Texto y estructura)

### **📏 Componentes Implementados**
- **Botones**: `.btn-podenza-primary`, `.btn-podenza-secondary`
- **Variables CSS**: Centralizadas en `shadcn-ui.css`
- **Sidebar**: Estados activos con colores de marca
- **Typography**: Sistema de headings y body text

---

## 📋 Estado del Proyecto

### **✅ Completado (Base Sólida)**
- ✅ Sistema de autenticación completo
- ✅ Dashboard y navegación responsiva
- ✅ Gestión básica de solicitudes
- ✅ Configuración de usuarios
- ✅ Seguridad base (RLS, MFA, audit)
- ✅ Branding system implementado

### **🔄 En Desarrollo**
- 🔄 Workbench para gestión de solicitudes (8 etapas)
- 🔄 Sistema de documentos (upload, validación)
- 🔄 Integración bancaria básica

### **📋 Planificado (Prioridad Alta)**
- 📋 WhatsApp Business API
- 📋 Email notifications (Sendgrid)
- 📋 AUCO integration (centrales de riesgo)
- 📋 Banking APIs (Bancolombia, Davivienda, BBVA)
- 📋 IA para análisis de documentos

---

## 🚀 Próximos Pasos

### **Sprint Actual (P1 - Alto)**
1. **Completar workbench** - Formularios de las 8 etapas
2. **Sistema de documentos** - Upload, validación, categorización
3. **Configuración bancaria** - Setup de entidades financieras
4. **WhatsApp integration** - API setup y webhook handling

### **Sprint Siguiente (P2 - Medio)**
1. **APIs bancarias** - Integración con Bancolombia y Davivienda
2. **AUCO integration** - Consultas de centrales de riesgo
3. **Email notifications** - Sendgrid setup y templates
4. **IA básica** - Análisis automático de documentos

---

## 📞 Soporte y Mantenimiento

### **📅 Frecuencia de Actualización**
- **Arquitectura**: Mensual o al agregar nuevas tecnologías
- **Seguridad**: Mensual o al detectar nuevas amenazas
- **Plan de Trabajo**: Semanal o al completar tareas
- **Branding**: Al realizar cambios en el design system

### **🔄 Proceso de Actualización**
1. **Identificar cambios** en código, arquitectura o requerimientos
2. **Actualizar documentación** correspondiente
3. **Validar consistencia** entre documentos
4. **Comunicar cambios** al equipo de desarrollo

---

## ⚠️ Recordatorios Importantes

### **🚫 NO HACER**
- ❌ Hardcodear colores - usar variables CSS de PODENZA
- ❌ Implementar APIs sin validación de seguridad
- ❌ Crear componentes UI sin seguir el branding
- ❌ Saltarse las validaciones de Zod
- ❌ Implementar integraciones sin audit logging

### **✅ SIEMPRE HACER**
- ✅ Consultar documentación antes de implementar
- ✅ Aplicar RLS en nuevas tablas
- ✅ Usar componentes existentes cuando sea posible
- ✅ Validar inputs con Zod schemas
- ✅ Implementar audit trails para acciones críticas
- ✅ Seguir patrones de error handling establecidos

---

**Versión**: 1.0
**Última actualización**: Enero 2025
**Mantenido por**: Equipo de desarrollo PODENZA

> 📌 **Nota**: Esta documentación es **living documentation** - debe mantenerse actualizada con cada cambio significativo en el proyecto.