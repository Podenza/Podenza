# 🎨 SISTEMA DE BRANDING - PODENZA

## Información General
Este documento define el **sistema de branding completo** de PODENZA, basado en la implementación actual en el archivo `shadcn-ui.css` y establece las directrices para mantener la consistencia visual en toda la plataforma.

---

## 🎯 IDENTIDAD DE MARCA

### **Concepto de Marca**
**PODENZA** representa **poder y potencia** en el sector fintech colombiano, combinando:
- **Confiabilidad** - Solidez en el manejo de créditos
- **Innovación** - Tecnología de vanguardia
- **Accesibilidad** - Democratización del acceso al crédito
- **Transparencia** - Procesos claros y honestos

### **Valores de Marca**
- **Eficiencia** - Procesos rápidos y optimizados
- **Seguridad** - Protección de datos y transacciones
- **Inclusión** - Acceso para todos los colombianos
- **Sostenibilidad** - Crecimiento responsable

---

## 🎨 PALETA DE COLORES

### **Colores Primarios (Implementados)**

#### **Verde Podenza - Color Principal**
```css
--primary: #E7FF8C;             /* Pantone 2295 C - Verde lima brillante */
--primary-foreground: #2C3E2B;  /* Texto sobre verde primary */
```
- **Uso**: Elementos de marca, navegación activa, highlights
- **Significado**: Crecimiento, prosperidad, confianza
- **Aplicación**: 60% de la interfaz (backgrounds principales)

#### **Naranja Podenza - Color de Acción**
```css
--accent: #FF931E;              /* Pantone 1495 C - Naranja vibrante */
--accent-foreground: #FFFFFF;   /* Texto sobre naranja */
```
- **Uso**: CTAs, botones principales, elementos interactivos
- **Significado**: Energía, acción, conversión
- **Aplicación**: 10% de la interfaz (elementos críticos)

### **Colores Secundarios**

#### **Verde Oscuro - Base Institucional**
```css
--foreground: #2C3E2B;          /* Verde oscuro corporativo */
--sidebar-primary: #2C3E2B;     /* Elementos primarios de navegación */
```
- **Uso**: Textos principales, iconografía, elementos estructurales
- **Significado**: Estabilidad, profesionalismo, confianza

#### **Gris Neutro - Estructura**
```css
--background: #F5F5F5;          /* Fondo general de aplicación */
--card: #FFFFFF;                /* Tarjetas y contenedores */
--muted: #F0F0F0;              /* Fondos sutiles */
--muted-foreground: #5A6B57;    /* Texto secundario */
```

### **Paleta Extendida para Charts y Visualizaciones**
```css
--chart-1: #E7FF8C;             /* Verde primary */
--chart-2: #FF931E;             /* Naranja accent */
--chart-3: #AFDB12;             /* Verde medio */
--chart-4: #FFF4ED;             /* Naranja suave */
--chart-5: #DEFF70;             /* Verde hover */
```

---

---

## 🌙 MODO OSCURO

### **Paleta Dark Mode**
```css
.dark {
  --background: #181A00;         /* Verde muy oscuro - exclusivo dark mode */
  --foreground: #FFFFFF;         /* Texto claro */
  --card: #2C3E2B;              /* Tarjetas en dark */
  --primary: #E7FF8C;           /* Verde primary mantiene consistencia */
  --accent: #FF931E;            /* Naranja accent mantiene consistencia */
  --sidebar-background: #181A00; /* Sidebar oscuro */
}
```

**Principios Dark Mode:**
- Mantener colores de marca (**#E7FF8C** y **#FF931E**) consistentes
- Usar **#181A00** como base para crear atmósfera de marca
- Garantizar contraste suficiente (WCAG AA)
- Transiciones suaves entre modos

---

## 📝 TIPOGRAFÍA

### **Jerarquía Tipográfica**
```css
/* Sistema base implementado */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
--font-heading: var(--font-sans);  /* Consistencia tipográfica */
```

### **Aplicación de Tipografía**
```css
/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  letter-spacing: -0.02em;       /* Tracking ajustado */
  font-weight: 600;              /* Semibold para impacto */
}

/* Body Text */
body {
  font-family: var(--font-sans);
  font-feature-settings: "rlig" 1, "calt" 1;  /* Ligaduras tipográficas */
}
```

### **Escalas de Tamaño**
- **H1**: 2.5rem (40px) - Títulos principales
- **H2**: 2rem (32px) - Títulos de sección
- **H3**: 1.5rem (24px) - Subtítulos
- **H4**: 1.25rem (20px) - Títulos menores
- **Body**: 1rem (16px) - Texto base
- **Small**: 0.875rem (14px) - Texto secundario

---

## 🎯 SISTEMA DE BOTONES

### **Botón Primario - Implementado**
```css
.btn-podenza-primary {
  background-color: var(--accent);     /* #FF931E */
  color: var(--accent-foreground);     /* #FFFFFF */
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 15px;
  padding: 12px 24px;
  border-radius: var(--radius);        /* 0.75rem */
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-podenza-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
```

### **Botón Secundario - Implementado**
```css
.btn-podenza-secondary {
  background-color: var(--primary);    /* #E7FF8C */
  color: var(--primary-foreground);    /* #2C3E2B */
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 15px;
  padding: 12px 24px;
  border-radius: var(--radius);
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-podenza-secondary:hover {
  background-color: var(--chart-5);    /* #DEFF70 */
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
```

### **Estados de Botones**
- **Default**: Estado base con colores primarios
- **Hover**: Elevación sutil + cambio de opacidad/color
- **Active**: Pressed state con transform reducido
- **Disabled**: Opacidad 50% + cursor not-allowed
- **Loading**: Spinner + texto "Cargando..."

---

## 📏 SISTEMA DE ESPACIADO

### **Espaciado Base**
```css
--radius: 0.75rem;               /* 12px - Radio estándar */
```

### **Escala de Espaciado (Tailwind Compatible)**
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 2.5rem (40px)

### **Border Radius Personalizado**
```css
.rounded-podenza {
  border-radius: var(--radius);        /* 12px estándar */
}

.rounded-podenza-lg {
  border-radius: 1rem;                 /* 16px para tarjetas */
}

.rounded-podenza-xl {
  border-radius: 1.25rem;              /* 20px para modales */
}
```

---

## 🏗️ SISTEMA DE COMPONENTES

### **Tarjetas (Cards)**
```css
/* Implementación base */
.card {
  background: var(--card);             /* #FFFFFF */
  color: var(--card-foreground);       /* #2C3E2B */
  border-radius: var(--radius);        /* 12px */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border);     /* #D1D5DB */
}
```

### **Sidebar - Sistema Implementado**
```css
/* Mejoras específicas implementadas para sidebar */
[data-sidebar="menu-button"] svg {
  width: 20px !important;
  height: 20px !important;
  flex-shrink: 0;
}

/* Estado activo */
[data-sidebar="menu-button"][data-active="true"] {
  background-color: var(--primary) !important;    /* #E7FF8C */
  color: var(--primary-foreground) !important;    /* #2C3E2B */
  font-weight: 600;
}

/* Estado colapsado */
.group[data-collapsible="icon"] [data-sidebar="menu-button"] {
  justify-content: center !important;
  padding: 8px !important;
}
```

### **Inputs y Formularios**
```css
input, textarea {
  border: 1px solid var(--input);      /* #D1D5DB */
  border-radius: var(--radius);        /* 12px */
  background: var(--background);       /* #F5F5F5 */
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--ring);           /* #E7FF8C */
  box-shadow: 0 0 0 2px var(--ring);
}
```

---

## 🎭 ICONOGRAFÍA

### **Sistema de Iconos**
- **Biblioteca**: Lucide React (implementado)
- **Tamaño estándar**: 20px (sidebar), 16px (inline), 24px (headers)
- **Peso**: Outline style para consistencia
- **Color**: Hereda del texto contenedor

### **Iconos de Estado**
- **Éxito**: CheckCircle - Color `#10B981`
- **Error**: XCircle - Color `#EF4444`
- **Advertencia**: AlertTriangle - Color `#F59E0B`
- **Info**: Info - Color `var(--primary)`

---

## 📱 RESPONSIVE DESIGN

### **Breakpoints**
```css
/* Tailwind CSS breakpoints utilizados */
sm: 640px    /* Tablet portrait */
md: 768px    /* Tablet landscape */
lg: 1024px   /* Desktop small */
xl: 1280px   /* Desktop large */
2xl: 1536px  /* Desktop XL */
```

### **Sidebar Responsive**
- **Desktop**: Sidebar expandido por defecto
- **Tablet**: Sidebar colapsible
- **Mobile**: Sidebar como overlay

---

## 🎨 GUIDELINES DE APLICACIÓN

### **Regla 60-30-10**
- **60%**: Colores neutros (grises, blancos) para estructura
- **30%**: Color primario (#E7FF8C) para elementos de marca
- **10%**: Color accent (#FF931E) para CTAs y elementos críticos

### **Consistencia Visual**
```css
/* Utilities implementadas para consistencia */
.text-podenza-primary {
  color: var(--primary);
}

.bg-podenza-primary {
  background-color: var(--primary);
}

.text-podenza-action {
  color: var(--accent);
}

.bg-podenza-action {
  background-color: var(--accent);
}
```

### **Accesibilidad**
- **Contraste mínimo**: 4.5:1 para texto normal
- **Contraste mejorado**: 7:1 para texto pequeño
- **Focus visible**: Ring de 2px con color `var(--ring)`
- **Estados hover**: Transiciones de 0.2s ease

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### **Variables CSS Personalizadas**
```css
/* Todas las variables están centralizadas en shadcn-ui.css */
:root {
  /* Variables de color definidas */
  /* Variables de tipografía definidas */
  /* Variables de espaciado definidas */
}

.dark {
  /* Override para modo oscuro */
}
```

### **Uso en Componentes React**
```tsx
// ✅ CORRECTO - Usar clases utility implementadas
<button className="btn-podenza-primary">
  Solicitar Crédito
</button>

<div className="bg-podenza-primary text-podenza-action rounded-podenza-lg">
  <h2 className="font-heading">Título</h2>
</div>

// ❌ INCORRECTO - Colores hardcoded
<button style={{ backgroundColor: '#FF931E' }}>
  Botón
</button>
```

### **Componentes Shadcn UI Customizados**
```tsx
// Todos los componentes de Shadcn UI heredan automáticamente
// las variables CSS definidas en shadcn-ui.css
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Los componentes ya tienen los colores de PODENZA aplicados
<Button variant="default">Botón Primario</Button>
<Button variant="secondary">Botón Secundario</Button>
```

---

## 📋 CHECKLIST DE BRANDING

### **Implementación Correcta**
- [ ] Variables CSS de PODENZA utilizadas en lugar de colores hardcoded
- [ ] Botones usando clases `.btn-podenza-primary` y `.btn-podenza-secondary`
- [ ] Sidebar con estilos específicos de PODENZA implementados
- [ ] Typography usando `font-heading` y `font-sans`
- [ ] Border radius usando `--radius` y variantes
- [ ] Dark mode implementado con paleta consistente
- [ ] Iconos de Lucide React con tamaños estándar
- [ ] Transiciones suaves (0.2s ease) en elementos interactivos
- [ ] Focus states visibles con `var(--ring)`
- [ ] Contraste de color cumpliendo WCAG AA
- [ ] Responsive design en todos los componentes
- [ ] Estados hover/active definidos

### **Consistencia de Marca**
- [ ] Logo PODENZA presente en header/sidebar
- [ ] Colores primarios (#E7FF8C) y accent (#FF931E) consistentes
- [ ] Tipografía siguiendo hierarchy definida
- [ ] Espaciado usando escala establecida
- [ ] Componentes siguiendo patrones de diseño definidos

---

Este sistema de branding garantiza la **consistencia visual** y la **identidad sólida** de PODENZA en toda la plataforma, manteniendo la cohesión entre funcionalidades y proporcionando una experiencia de usuario profesional y confiable.