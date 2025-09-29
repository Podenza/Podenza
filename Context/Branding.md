# PRD: Implementación de Branding Podenza en Template Makerkit

## 📋 Objetivo
Transformar completamente el template de Makerkit aplicando la identidad visual de Podenza con un diseño minimalista, limpio y profesional que refleje los valores de colaboración, dinamismo e innovación de la marca.

---

## 🎨 Sistema de Diseño

### Paleta de Colores (Regla 60-30-10)

#### 60% - Colores Base (Fondos y Estructura)
```css
--background-primary: #FFFFFF;      /* Tarjetas y contenedores principales */
--background-secondary: #FAFAFA;    /* Fondo general de la aplicación */
--background-tertiary: #F3F4F6;     /* Fondos alternativos sutiles */
--border-light: #F3F4F6;            /* Bordes muy sutiles */
--border-medium: #E5E5E5;           /* Bordes estándar */
```

#### 30% - Color de Marca Principal (Acentos y Estados Activos)
```css
--accent-primary: #E7FF8C;          /* Verde lima suave - Pantone 2295 C */
--accent-primary-hover: #DEFF70;    /* Estado hover del verde */
```

#### 10% - Color de Acción (CTAs y Elementos Críticos)
```css
--action-primary: #FF931E;          /* Naranja - Pantone 1495 C */
--action-primary-hover: #FF8000;    /* Estado hover del naranja */
--action-secondary: #FFF4ED;        /* Naranja muy suave para fondos */
```

#### Colores de Texto
```css
--text-primary: #2C3E2B;            /* Texto principal (casi negro con tinte verde) */
--text-secondary: #6B7280;          /* Texto secundario (gris medio) */
--text-tertiary: #9CA3AF;           /* Texto terciario (gris claro) */
```

#### Colores Adicionales del Manual (Referencia)
```css
/* Colores disponibles pero usar con moderación */
--brand-green-dark: #181A00;        /* Pantone Black 6 C - SOLO para casos especiales */
--brand-green-medium: #AFDB12;      /* Pantone 2290 C */
--brand-green-bright: #C9FF00;      /* Pantone 389 C */
```

---

## 🔤 Sistema Tipográfico

### Fuentes de Marca

#### Tipografía Principal - Smooth Circular / Circular Std
**Uso:** Títulos, encabezados, números grandes, logo
**Propósito:** Trazos redondos y orgánicos que simbolizan fluidez y conexión

```css
/* Implementación en CSS */
@import url('https://fonts.cdnfonts.com/css/circular-std');

.heading-font {
  font-family: 'Circular Std', 'Circular', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.02em; /* Tracking ajustado para mejor legibilidad */
}
```

**Escalas de uso:**
- Logo: 700 weight, 20-22px
- H1 (Page Title): 700 weight, 32px
- H2 (Section Title): 700 weight, 22px
- Números de métricas: 700 weight, 40px

#### Tipografía Secundaria - Sofia Pro
**Uso:** Cuerpo de texto, navegación, descripciones, botones
**Propósito:** Simetría y equilibrio para contenido extenso

```css
/* Implementación en CSS */
@import url('https://fonts.cdnfonts.com/css/sofia-pro');

.body-font {
  font-family: 'Sofia Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

**Escalas de uso:**
- Body Large: 500 weight, 15px
- Body Medium: 500 weight, 14px
- Body Small: 500 weight, 13px
- Button Text: 600 weight, 15px
- Navigation: 600 weight (active), 500 weight (inactive), 15px

---

## 🏗️ Componentes UI - Especificaciones Detalladas

### 1. Sidebar (Navegación Lateral)

```javascript
// Estructura y estilos
const SidebarSpecs = {
  width: '256px', // w-64
  background: '#FFFFFF',
  borderRight: '1px solid #E5E5E5',
  padding: {
    container: '16px',
    logo: '32px',
    userProfile: '24px'
  }
}

// Logo Section
const LogoSpecs = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  icon: {
    width: '40px',
    height: '40px',
    background: '#E7FF8C',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontFamily: 'Circular Std',
    fontSize: '22px',
    fontWeight: '700',
    color: '#2C3E2B'
  }
}

// Navigation Items
const NavItemSpecs = {
  default: {
    padding: '12px 16px',
    borderRadius: '12px',
    color: '#6B7280',
    fontFamily: 'Sofia Pro',
    fontSize: '15px',
    fontWeight: '500',
    iconStrokeWidth: 2
  },
  active: {
    background: '#E7FF8C',
    color: '#2C3E2B',
    fontWeight: '600',
    iconStrokeWidth: 2.5
  },
  hover: {
    background: 'transparent',
    opacity: 0.8
  }
}

// User Profile Section
const UserProfileSpecs = {
  container: {
    borderTop: '1px solid #F3F4F6',
    padding: '24px'
  },
  avatar: {
    width: '44px',
    height: '44px',
    background: '#F3F4F6',
    borderRadius: '50%',
    fontFamily: 'Sofia Pro',
    fontSize: '15px',
    fontWeight: '600',
    color: '#6B7280'
  },
  name: {
    fontFamily: 'Sofia Pro',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2C3E2B'
  },
  email: {
    fontFamily: 'Sofia Pro',
    fontSize: '13px',
    color: '#9CA3AF'
  }
}
```

### 2. Header (Encabezado Principal)

```javascript
const HeaderSpecs = {
  container: {
    padding: '32px 40px',
    background: '#FFFFFF',
    borderBottom: '1px solid #F3F4F6'
  },
  title: {
    fontFamily: 'Circular Std',
    fontSize: '32px',
    fontWeight: '700',
    color: '#2C3E2B',
    letterSpacing: '-0.02em',
    marginBottom: '4px'
  },
  subtitle: {
    fontFamily: 'Sofia Pro',
    fontSize: '15px',
    color: '#6B7280'
  },
  ctaButton: {
    background: '#FF931E',
    color: '#FFFFFF',
    padding: '12px 24px',
    borderRadius: '12px',
    fontFamily: 'Sofia Pro',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'opacity 0.2s',
    hover: {
      opacity: 0.9
    }
  }
}
```

### 3. Cards (Tarjetas de Métricas)

```javascript
const CardSpecs = {
  container: {
    background: '#FFFFFF',
    border: '1px solid #E5E5E5',
    borderRadius: '16px',
    padding: '28px'
  },
  icon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    // Alternar entre dos colores:
    backgroundOptions: ['#E7FF8C', '#FFF4ED'],
    iconColor: ['#2C3E2B', '#FF931E'] // corresponde al background
  },
  badge: {
    background: '#E7FF8C',
    color: '#2C3E2B',
    padding: '6px 12px',
    borderRadius: '9999px',
    fontFamily: 'Sofia Pro',
    fontSize: '13px',
    fontWeight: '600'
  },
  label: {
    fontFamily: 'Sofia Pro',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: '8px'
  },
  value: {
    fontFamily: 'Circular Std',
    fontSize: '40px',
    fontWeight: '700',
    color: '#2C3E2B',
    letterSpacing: '-0.02em'
  }
}
```

### 4. Activity List (Lista de Actividades)

```javascript
const ActivityItemSpecs = {
  container: {
    padding: '16px 20px',
    borderRadius: '12px',
    transition: 'background-color 0.2s',
    hover: {
      background: '#FAFAFA'
    }
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    // Alternar colores:
    backgroundOptions: ['#E7FF8C', '#FFF4ED'],
    fontFamily: 'Sofia Pro',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2C3E2B'
  },
  title: {
    fontFamily: 'Sofia Pro',
    fontSize: '15px',
    fontWeight: '600',
    color: '#2C3E2B',
    marginBottom: '2px'
  },
  subtitle: {
    fontFamily: 'Sofia Pro',
    fontSize: '14px',
    color: '#9CA3AF'
  },
  timestamp: {
    fontFamily: 'Sofia Pro',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280'
  }
}
```

### 5. Buttons (Botones)

```javascript
const ButtonSpecs = {
  primary: {
    background: '#FF931E',
    color: '#FFFFFF',
    padding: '12px 24px',
    borderRadius: '12px',
    fontFamily: 'Sofia Pro',
    fontSize: '15px',
    fontWeight: '600',
    hover: {
      opacity: 0.9
    }
  },
  secondary: {
    background: '#E7FF8C',
    color: '#2C3E2B',
    padding: '12px 24px',
    borderRadius: '12px',
    fontFamily: 'Sofia Pro',
    fontSize: '15px',
    fontWeight: '600',
    hover: {
      background: '#DEFF70'
    }
  },
  ghost: {
    background: 'transparent',
    color: '#6B7280',
    padding: '12px 24px',
    borderRadius: '12px',
    fontFamily: 'Sofia Pro',
    fontSize: '15px',
    fontWeight: '500',
    hover: {
      background: '#FAFAFA'
    }
  }
}
```

---

## 📐 Sistema de Espaciado

### Escala de Spacing
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 40px;
--space-3xl: 48px;
```

### Aplicación de Espaciado
- **Gap entre elementos pequeños:** 8px (space-sm)
- **Gap entre secciones de card:** 20px
- **Padding de containers:** 28-32px (space-xl)
- **Margin entre secciones:** 40px (space-2xl)

---

## 🎯 Border Radius System

```css
--radius-sm: 8px;   /* Elementos pequeños, badges */
--radius-md: 12px;  /* Botones, nav items, iconos */
--radius-lg: 16px;  /* Cards, containers */
--radius-xl: 20px;  /* Modales, overlays */
--radius-full: 9999px; /* Avatares, pills */
```

---

## 🔄 Estados Interactivos

### Hover States
```css
/* Para botones principales */
.button-primary:hover {
  opacity: 0.9;
  transition: opacity 0.2s ease;
}

/* Para navegación */
.nav-item:hover:not(.active) {
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

/* Para items de lista */
.list-item:hover {
  background-color: #FAFAFA;
  transition: background-color 0.2s ease;
}
```

### Active States
```css
.nav-item.active {
  background-color: #E7FF8C;
  color: #2C3E2B;
  font-weight: 600;
}
```

### Focus States
```css
*:focus-visible {
  outline: 2px solid #E7FF8C;
  outline-offset: 2px;
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Móviles grandes */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Pantallas grandes */
```

### Comportamiento Responsive
- **< 768px:** Sidebar colapsa a hamburger menu
- **768px - 1024px:** Sidebar se mantiene pero puede colapsarse
- **> 1024px:** Sidebar siempre visible

---

## 🗂️ Estructura de Archivos a Modificar

### 1. Configuración Global de Estilos
```
apps/web/styles/
├── globals.css          # Actualizar con nuevas variables CSS
├── theme.css            # Definir tema Podenza
├── shadcn-ui.css        # Adaptar componentes Shadcn
└── makerkit.css         # Estilos específicos de Makerkit
```

### 2. Componentes a Actualizar
```
apps/web/components/
├── app-logo.tsx         # Actualizar logo con colores Podenza
├── personal-account-dropdown-container.tsx
└── root-providers.tsx   # Importar fuentes

apps/web/app/home/_components/
├── home-sidebar.tsx     # Aplicar estilos de sidebar
├── home-menu-navigation.tsx
└── home-mobile-navigation.tsx
```

### 3. Configuración
```
apps/web/config/
├── app.config.ts        # Actualizar nombre y colores
└── navigation.config.tsx # Iconos y estructura
```

---

## 🎨 Variables CSS Globales (globals.css)

```css
@layer base {
  :root {
    /* Fuentes */
    --font-heading: 'Circular Std', 'Circular', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-body: 'Sofia Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    
    /* Colores Base */
    --background: #FAFAFA;
    --foreground: #2C3E2B;
    --card: #FFFFFF;
    --card-foreground: #2C3E2B;
    
    /* Colores de Marca */
    --primary: #E7FF8C;
    --primary-foreground: #2C3E2B;
    --secondary: #FFF4ED;
    --secondary-foreground: #FF931E;
    
    /* Colores de Acción */
    --accent: #FF931E;
    --accent-foreground: #FFFFFF;
    
    /* Colores de Texto */
    --muted: #F3F4F6;
    --muted-foreground: #6B7280;
    
    /* Bordes */
    --border: #E5E5E5;
    --input: #E5E5E5;
    --ring: #E7FF8C;
    
    /* Radius */
    --radius: 12px;
  }
}
```

---

## 🔧 Implementación en Componentes Next.js

### Ejemplo: AppLogo Component
```typescript
// apps/web/components/app-logo.tsx
function LogoImage({ className }: { className?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: '#E7FF8C' }}
      >
        <span 
          className="font-bold text-xl"
          style={{ 
            fontFamily: "'Circular Std', sans-serif",
            color: '#2C3E2B'
          }}
        >
          P
        </span>
      </div>
      <span 
        className="font-bold text-[22px]"
        style={{ 
          fontFamily: "'Circular Std', sans-serif",
          color: '#2C3E2B',
          letterSpacing: '-0.02em'
        }}
      >
        PODENZA
      </span>
    </div>
  );
}
```

### Ejemplo: Button Component Update
```typescript
// En tus componentes de botones
const buttonVariants = {
  default: {
    backgroundColor: '#FF931E',
    color: '#FFFFFF',
    fontFamily: "'Sofia Pro', sans-serif",
    fontWeight: '600',
    fontSize: '15px',
    padding: '12px 24px',
    borderRadius: '12px',
  },
  secondary: {
    backgroundColor: '#E7FF8C',
    color: '#2C3E2B',
    fontFamily: "'Sofia Pro', sans-serif",
    fontWeight: '600',
  }
}
```

---

## ✅ Checklist de Implementación

### Fase 1: Setup de Fuentes y Colores
- [ ] Importar Circular Std y Sofia Pro en `layout.tsx`
- [ ] Actualizar `globals.css` con variables CSS de Podenza
- [ ] Actualizar `theme.css` con sistema de colores
- [ ] Configurar `app.config.ts` con nombre "PODENZA"

### Fase 2: Componentes Core
- [ ] Actualizar `app-logo.tsx` con nuevo logo
- [ ] Modificar sidebar: `home-sidebar.tsx`
- [ ] Actualizar header y navegación
- [ ] Adaptar dropdowns de usuario
- [ ] Actualizar componentes de botones

### Fase 3: Páginas Principales
- [ ] Landing page: `app/(marketing)/page.tsx`
- [ ] Dashboard: `app/home/page.tsx`
- [ ] Settings: `app/home/settings/page.tsx`
- [ ] Auth pages: `app/auth/*`

### Fase 4: Componentes UI
- [ ] Cards y estadísticas
- [ ] Formularios
- [ ] Tablas
- [ ] Modales y dialogs
- [ ] Toasts y notificaciones

### Fase 5: Testing y Refinamiento
- [ ] Verificar contraste de accesibilidad (WCAG AA)
- [ ] Probar en diferentes dispositivos
- [ ] Validar responsive design
- [ ] Revisar hover states
- [ ] Optimizar performance de fuentes

---

## 📊 Métricas de Éxito

### Diseño Visual
- Contraste mínimo 4.5:1 para texto normal
- Contraste mínimo 3:1 para texto grande
- Consistencia en uso de colores (60-30-10)
- Espaciado uniforme según sistema

### Performance
- Fuentes cargadas en < 1s
- First Contentful Paint < 1.5s
- Cumulative Layout Shift < 0.1

### Accesibilidad
- Score Lighthouse Accessibility > 95
- Navegación por teclado funcional
- Focus states visibles
- Labels apropiados en todos los inputs

---

## 🚫 Reglas de NO HACER

1. **NO usar el negro puro (#181A00)** como fondo principal - reservar solo para casos especiales
2. **NO combinar Circular Std** para texto de párrafo largo - usar Sofia Pro
3. **NO usar más de 3 colores de acento** en una misma vista
4. **NO usar gradientes** - mantener colores sólidos
5. **NO usar opacidades bajas** en texto principal - mínimo 0.87 para #2C3E2B
6. **NO ignorar el espaciado del sistema** - usar variables definidas
7. **NO usar border radius diferentes** fuera del sistema establecido
8. **NO sobrecargar con el color naranja** (#FF931E) - solo para CTAs críticos

---

## 📞 Contacto y Revisión

### Proceso de Revisión
1. Implementar cambios siguiendo especificaciones
2. Capturar screenshots de componentes
3. Validar contra mockup de referencia
4. Solicitar feedback antes de merge
5. Documentar cualquier desviación del spec

### Prioridades
**Alta:** Logo, colores principales, tipografía, navegación, botones CTA
**Media:** Cards, listas, formularios, tablas
**Baja:** Animaciones, micro-interacciones, estados de carga

---

## 🔗 Referencias

- Manual de Marca Podenza (documento fuente)
- Mockup de referencia (artifact visual)
- Makerkit Documentation: https://makerkit.dev
- Circular Std Font: https://fonts.cdnfonts.com/css/circular-std
- Sofia Pro Font: https://fonts.cdnfonts.com/css/sofia-pro

---

**Versión:** 1.0  
**Fecha:** Marzo 2025  
**Última actualización:** [Fecha actual]