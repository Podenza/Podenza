# 🏗️ ARQUITECTURA DE PODENZA

## Información General
**PODENZA** es una plataforma **SaaS multi-tenancy** de gestión de solicitudes de crédito construida sobre el stack **Next.js + Supabase**, implementando un sistema modular con arquitectura de monorepo usando Turborepo. **Optimizada para soportar +1000 transacciones por hora** con performance crítico entre Vercel, Next.js y Supabase.

---

## 📊 STACK TECNOLÓGICO

### **Frontend Framework**
- **Next.js 15.1.7** - App Router, React Server Components, Edge Runtime
- **React 19.0.0** - Biblioteca UI principal con Server Components
- **TypeScript 5.7.3** - Tipado estático estricto

### **UI/UX System**
- **Tailwind CSS 4.0.6** - Framework CSS utility-first
- **Shadcn UI** - Sistema de componentes basado en Radix UI
- **Radix UI** - Componentes primitivos accesibles
- **Lucide React** - Iconografía consistente
- **Sonner** - Sistema de notificaciones toast

### **Backend & Base de Datos**
- **Supabase** - Backend as a Service (Multi-Tenant Architecture)
  - PostgreSQL 15+ con extensiones optimizadas
  - **Row Level Security (RLS)** multi-tenant
  - **Particionado de tablas** para performance
  - **Índices optimizados** para +1000 transacciones/hora
  - Real-time subscriptions
  - Edge Functions (Deno)
  - Storage para archivos
- **Autenticación integrada** - JWT + RLS policies + Tenant isolation

### **Estado y Gestión de Datos**
- **TanStack Query 5.64.1** - Server state management
- **React Hook Form 7.54.2** - Gestión de formularios
- **Zod 3.24.2** - Validación de schemas
- **React i18next 15.4.0** - Internacionalización

---

## 🗂️ ESTRUCTURA DEL PROYECTO

### **Monorepo Architecture**
```
PODENZA/
├── apps/
│   ├── web/                    # Next.js App Principal
│   └── e2e/                    # Tests Playwright
├── packages/
│   ├── features/               # Módulos de Funcionalidad
│   ├── ui/                     # Sistema de Componentes
│   ├── supabase/              # Cliente DB
│   ├── auth/                  # Autenticación
│   └── shared/                # Utilidades Compartidas
├── tooling/                   # Configuraciones
└── Context/                   # Documentación Técnica
```

### **Frontend Structure (apps/web/)**
```
app/
├── (marketing)/               # Páginas públicas
│   ├── page.tsx              # Landing page
│   └── about/                # Información corporativa
├── auth/                     # Flow de autenticación
│   ├── sign-in/
│   ├── sign-up/
│   └── password-reset/
├── home/                     # Área protegida
│   ├── page.tsx             # Dashboard principal
│   ├── settings/            # Configuración usuario
│   └── solicitudes/         # Módulo de solicitudes
└── globals.css              # Estilos globales
```

---

## 🔐 ARQUITECTURA DE SEGURIDAD

### **Autenticación (Supabase Auth)**
- **JWT Tokens** - Manejo automático de tokens
- **Multi-provider** - Email/Password (habilitado)
- **Session Management** - Refresh automático
- **MFA Ready** - Configuración para 2FA

### **Autorización (Row Level Security)**
```sql
-- Política ejemplo para accounts
CREATE POLICY "Users can read own account" ON accounts
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can update own account" ON accounts
    FOR UPDATE USING (auth.uid() = created_by);
```

### **Seguridad de Datos**
- **RLS habilitado** en todas las tablas críticas
- **Triggers** para auditoría automática
- **Validación** en frontend y backend (Zod schemas)
- **Sanitización** de inputs y uploads

---

## 🗄️ ARQUITECTURA DE BASE DE DATOS - MULTI-TENANT

### **🏢 DISEÑO SAAS MULTI-TENANCY**

PODENZA implementa un **modelo de tenant isolation a nivel de Row Level Security (RLS)** optimizado para **+1000 transacciones por hora** con las siguientes características:

#### **Modelo de Tenancy**
- **Shared Database, Shared Schema** con isolation por `organization_id`
- **Row Level Security (RLS)** para complete tenant isolation
- **Particionado de tablas** por tenant para performance óptimo
- **Índices compuestos** optimizados para queries multi-tenant

#### **Schema Multi-Tenant Optimizado**
```sql
-- 1. TABLA DE ORGANIZACIONES (TENANTS)
organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    slug varchar(100) NOT NULL UNIQUE,           -- Para tenant identification
    plan_type varchar(50) DEFAULT 'basic',       -- basic, premium, enterprise
    max_users integer DEFAULT 10,
    max_solicitudes integer DEFAULT 100,
    settings jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    is_active boolean DEFAULT true
);

-- Índices críticos para performance
CREATE INDEX CONCURRENTLY idx_organizations_slug ON organizations (slug);
CREATE INDEX CONCURRENTLY idx_organizations_active ON organizations (is_active) WHERE is_active = true;

-- 2. ACCOUNTS EXTENDIDO PARA MULTI-TENANCY
accounts (
    id uuid PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    email varchar(320) NOT NULL,
    role varchar(50) DEFAULT 'user',              -- admin, user, viewer
    picture_url varchar(1000),
    public_data jsonb DEFAULT '{}',
    tenant_permissions jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    last_login_at timestamptz,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    created_by uuid REFERENCES auth.users,
    updated_by uuid REFERENCES auth.users,

    -- Constraint: email único por organización
    UNIQUE(organization_id, email)
);

-- Índices optimizados para multi-tenant queries
CREATE INDEX CONCURRENTLY idx_accounts_org_active ON accounts (organization_id, is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_accounts_org_role ON accounts (organization_id, role);

-- 3. SOLICITUDES PARTICIONADA (CORE BUSINESS)
solicitudes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    numero_solicitud varchar(50) NOT NULL,       -- SOL-2024-001
    cedula varchar(20) NOT NULL,
    cliente varchar(255) NOT NULL,
    asesor_id uuid REFERENCES accounts(id),
    asesor_name varchar(255) NOT NULL,
    afiliado boolean DEFAULT false,
    vitrina varchar(100),
    banco varchar(100),
    monto decimal(15,2) NOT NULL,
    producto varchar(100) NOT NULL,
    estado varchar(50) DEFAULT 'viabilidad',
    fecha_solicitud date DEFAULT CURRENT_DATE,
    metadata jsonb DEFAULT '{}',
    search_vector tsvector,                       -- Full-text search optimizado
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW(),
    created_by uuid REFERENCES accounts(id),
    updated_by uuid REFERENCES accounts(id),

    -- Constraint: número único por organización
    UNIQUE(organization_id, numero_solicitud)
) PARTITION BY HASH (organization_id);

-- Crear particiones para performance (4 particiones iniciales)
CREATE TABLE solicitudes_part_0 PARTITION OF solicitudes FOR VALUES WITH (modulus 4, remainder 0);
CREATE TABLE solicitudes_part_1 PARTITION OF solicitudes FOR VALUES WITH (modulus 4, remainder 1);
CREATE TABLE solicitudes_part_2 PARTITION OF solicitudes FOR VALUES WITH (modulus 4, remainder 2);
CREATE TABLE solicitudes_part_3 PARTITION OF solicitudes FOR VALUES WITH (modulus 4, remainder 3);

-- 4. DOCUMENTOS
documentos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    solicitud_id uuid REFERENCES solicitudes(id) ON DELETE CASCADE,
    nombre varchar(255) NOT NULL,
    tipo varchar(50) NOT NULL,                    -- cedula, ingresos, inmueble, auco
    archivo_url varchar(1000) NOT NULL,
    mime_type varchar(100),
    tamaño_bytes bigint,
    version integer DEFAULT 1,
    es_version_actual boolean DEFAULT true,
    metadata jsonb DEFAULT '{}',
    estado_validacion varchar(50) DEFAULT 'pendiente',
    created_at timestamptz DEFAULT NOW(),
    created_by uuid REFERENCES accounts(id)
);

-- 5. AUDIT TRAIL PARTICIONADO POR FECHA
audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    table_name varchar(100) NOT NULL,
    record_id uuid NOT NULL,
    action varchar(20) NOT NULL,                  -- INSERT, UPDATE, DELETE
    old_values jsonb,
    new_values jsonb,
    user_id uuid REFERENCES accounts(id),
    user_email varchar(320),
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT NOW()
) PARTITION BY RANGE (created_at);
```

### **🚀 ÍNDICES CRÍTICOS PARA PERFORMANCE**

#### **Índices Multi-Tenant Optimizados**
```sql
-- Solicitudes: Índices críticos para +1000 transacciones/hora
CREATE INDEX CONCURRENTLY idx_solicitudes_org_estado ON solicitudes (organization_id, estado);
CREATE INDEX CONCURRENTLY idx_solicitudes_org_fecha ON solicitudes (organization_id, fecha_solicitud DESC);
CREATE INDEX CONCURRENTLY idx_solicitudes_org_asesor ON solicitudes (organization_id, asesor_id);
CREATE INDEX CONCURRENTLY idx_solicitudes_cedula_org ON solicitudes (organization_id, cedula);
CREATE INDEX CONCURRENTLY idx_solicitudes_search ON solicitudes USING GIN (search_vector);

-- Índice parcial para solicitudes activas (queries más frecuentes)
CREATE INDEX CONCURRENTLY idx_solicitudes_org_activas
ON solicitudes (organization_id, estado, fecha_solicitud DESC)
WHERE estado IN ('viabilidad', 'viable', 'pre_aprobado', 'en_estudio');

-- Documentos: Performance para upload/retrieval
CREATE INDEX CONCURRENTLY idx_documentos_org_solicitud ON documentos (organization_id, solicitud_id);
CREATE INDEX CONCURRENTLY idx_documentos_org_tipo ON documentos (organization_id, tipo);
```

### **🔒 RLS POLICIES MULTI-TENANT**

#### **Tenant Isolation Completo**
```sql
-- Organizations: Solo usuarios de la organización
CREATE POLICY "Users can access their organization" ON organizations
    FOR ALL TO authenticated
    USING (
        id IN (
            SELECT organization_id
            FROM accounts
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- Solicitudes: RLS optimizado por organización
CREATE POLICY "Users can access solicitudes from their org" ON solicitudes
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id
            FROM accounts
            WHERE id = auth.uid() AND is_active = true
        )
    );
```

### **⚡ FUNCIONES OPTIMIZADAS PARA PERFORMANCE**

#### **Estadísticas Agregadas (Cached)**
```sql
-- Función optimizada para dashboard stats
CREATE OR REPLACE FUNCTION get_solicitudes_stats(org_id UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'viabilidad', COUNT(*) FILTER (WHERE estado = 'viabilidad'),
        'viable', COUNT(*) FILTER (WHERE estado = 'viable'),
        'pre_aprobado', COUNT(*) FILTER (WHERE estado = 'pre_aprobado'),
        'aprobado', COUNT(*) FILTER (WHERE estado = 'aprobado')
    ) INTO stats
    FROM solicitudes
    WHERE organization_id = org_id;

    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Búsqueda Full-Text optimizada
CREATE OR REPLACE FUNCTION search_solicitudes(
    org_id UUID,
    search_term TEXT DEFAULT '',
    estado_filter TEXT DEFAULT '',
    limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (...) AS $$
-- Implementación optimizada con índices GIN
$$;
```

### **📊 EXTENSIONES HABILITADAS**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation
CREATE EXTENSION IF NOT EXISTS "unaccent";      -- Text search sin acentos
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";     -- Índices GIN compuestos
```

### **Storage Architecture**
```
Storage Buckets:
├── profile-pictures/          # Imágenes de perfil
├── documents/                 # Documentos de solicitudes
└── uploads/                   # Archivos temporales
```

---

## 🚀 ARQUITECTURA DE DEPLOYMENT

### **Vercel Configuration**
- **Framework Preset**: Next.js
- **Node Version**: 18+
- **Build Command**: `turbo build`
- **Edge Runtime**: Habilitado para API routes
- **Serverless Functions**: Auto-scaling

### **Environment Variables**
```bash
# App Configuration
NEXT_PUBLIC_SITE_URL=https://podenza.vercel.app
NEXT_PUBLIC_PRODUCT_NAME=PODENZA
NEXT_PUBLIC_THEME_COLOR=#E7FF8C

# Supabase Integration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role
```

---

## 🔌 ARQUITECTURA DE INTEGRACIONES

### **Integraciones Implementadas**
- ✅ **Supabase** - Base de datos y autenticación
- ✅ **Vercel** - Hosting y CI/CD
- ✅ **Cloudflare** - Edge runtime support

### **Integraciones Planificadas**

#### **Email Service**
- **Sendgrid** - Transactional emails
- **Resend** - Alternative email provider
```typescript
// packages/email/
├── providers/
│   ├── sendgrid.ts
│   └── resend.ts
└── templates/
    ├── welcome.tsx
    └── password-reset.tsx
```

#### **WhatsApp Integration**
- **WhatsApp Business API** - Notificaciones
- **Webhook handling** - Messages y status updates
```typescript
// packages/whatsapp/
├── api.ts              # WhatsApp API client
├── webhook.ts          # Webhook handlers
└── templates/          # Message templates
```

#### **AUCO Integration**
- **API Client** - Consultas a AUCO
- **Webhook receiver** - Updates de status
```typescript
// packages/auco/
├── client.ts           # AUCO API client
├── types.ts            # Response types
└── webhook.ts          # Status updates
```

#### **Banking APIs**
- **Bancolombia**
- **Davivienda**
- **BBVA**
- **Banco de Bogotá**
```typescript
// packages/banking/
├── providers/
│   ├── bancolombia.ts
│   ├── davivienda.ts
│   └── bbva.ts
└── types/
    ├── responses.ts
    └── requests.ts
```

---

## 🤖 ARQUITECTURA DE AI

### **AI Services Integration**
```typescript
// packages/ai/
├── providers/
│   ├── openai.ts          # OpenAI GPT-4
│   ├── anthropic.ts       # Claude
│   └── gemini.ts          # Google Gemini
├── services/
│   ├── document-analysis.ts
│   ├── risk-assessment.ts
│   └── decision-engine.ts
└── types/
    └── ai-responses.ts
```

### **Document Processing**
- **OCR** - Extracción de texto de documentos
- **NLP** - Análisis de contenido
- **ML Models** - Scoring crediticio

---

## 📊 ARQUITECTURA DE ANALYTICS & BI

### **Business Intelligence**
```typescript
// packages/analytics/
├── providers/
│   ├── google-analytics.ts
│   ├── mixpanel.ts
│   └── posthog.ts
├── dashboards/
│   ├── executive.ts
│   ├── operations.ts
│   └── credit-risk.ts
└── reports/
    ├── monthly.ts
    └── real-time.ts
```

### **Data Warehouse**
- **Supabase Analytics** - Query analytics
- **BigQuery** - Data warehouse
- **Metabase** - BI dashboards

---

## 🔄 ARQUITECTURA DE AUTOMATIZACIÓN

### **Workflow Engine**
```typescript
// packages/automation/
├── engines/
│   ├── credit-workflow.ts
│   ├── document-workflow.ts
│   └── notification-workflow.ts
├── triggers/
│   ├── time-based.ts
│   ├── event-based.ts
│   └── condition-based.ts
└── actions/
    ├── email.ts
    ├── sms.ts
    └── api-calls.ts
```

### **Decision Engine**
```typescript
// packages/decision-engine/
├── rules/
│   ├── credit-scoring.ts
│   ├── risk-assessment.ts
│   └── approval-matrix.ts
├── models/
│   ├── ml-model.ts
│   └── rule-engine.ts
└── api/
    └── decision-api.ts
```

---

## 📁 ARQUITECTURA DE STORAGE

### **File Management**
```typescript
// packages/storage/
├── providers/
│   ├── supabase-storage.ts
│   ├── aws-s3.ts
│   └── cloudinary.ts
├── services/
│   ├── compression.ts
│   ├── virus-scan.ts
│   └── metadata-extraction.ts
└── types/
    └── file-types.ts
```

### **Document Processing**
- **Compression** - Optimización de archivos
- **Virus Scanning** - Seguridad de uploads
- **Metadata Extraction** - Información de documentos
- **Versioning** - Control de versiones

---

## 🌐 ARQUITECTURA DE APIs

### **Internal APIs**
```typescript
// apps/web/app/api/
├── auth/                 # Autenticación endpoints
├── accounts/             # Gestión de cuentas
├── solicitudes/          # CRUD solicitudes
├── webhooks/             # External webhooks
│   ├── auco/
│   ├── banks/
│   └── whatsapp/
└── integrations/         # External API calls
    ├── banking/
    ├── email/
    └── ai/
```

### **External APIs (Exposición)**
```typescript
// API pública para terceros
/api/v1/
├── auth/                 # API authentication
├── solicitudes/          # Credit applications
│   ├── GET /             # List applications
│   ├── POST /            # Create application
│   ├── GET /:id          # Get application
│   └── PUT /:id          # Update application
├── webhooks/             # Webhook endpoints
└── status/               # Health checks
```

---

## 🔍 ARQUITECTURA DE MONITORING

### **Application Monitoring**
```typescript
// packages/monitoring/
├── providers/
│   ├── sentry.ts         # Error tracking
│   ├── datadog.ts        # APM
│   └── newrelic.ts       # Performance
├── metrics/
│   ├── performance.ts
│   ├── errors.ts
│   └── business.ts
└── alerts/
    ├── error-alerts.ts
    └── performance-alerts.ts
```

### **Health Checks**
- **Database connectivity**
- **External API status**
- **Service dependencies**
- **Performance metrics**

---

## 🔄 ARQUITECTURA DE CI/CD

### **GitHub Actions**
```yaml
# .github/workflows/
├── ci.yml                # Continuous Integration
├── cd.yml                # Continuous Deployment
├── security.yml          # Security scans
└── performance.yml       # Performance tests
```

### **Deployment Pipeline**
1. **Code Push** → GitHub
2. **CI Checks** → Tests, Linting, Type checking
3. **Security Scan** → Dependency audit, SAST
4. **Build** → Turborepo build
5. **Deploy** → Vercel deployment
6. **Smoke Tests** → Post-deployment validation

---

## 📚 PATTERNS & CONVENTIONS

### **Code Organization**
- **Monorepo** - Turborepo para gestión de packages
- **Atomic Design** - Componentes organizados por complejidad
- **Feature-based** - Módulos por funcionalidad de negocio
- **Type-safe** - TypeScript estricto en todo el stack

### **API Design**
- **RESTful** - Endpoints siguiendo convenciones REST
- **Type-safe** - Zod schemas para validación
- **Error Handling** - Códigos de error consistentes
- **Rate Limiting** - Protección contra abuso

### **Database Design**
- **Normalized** - Estructura relacional optimizada
- **Audit Trail** - Tracking de cambios automático
- **Soft Deletes** - Preservación de datos históricos
- **Indexing** - Optimización de queries frecuentes

---

## 🚀 ESCALABILIDAD

### **Performance Optimizations**
- **Static Generation** - Pages estáticas donde sea posible
- **Server Components** - Renderizado en servidor
- **Image Optimization** - Next.js Image component
- **Bundle Optimization** - Tree shaking y code splitting

### **Database Scaling**
- **Read Replicas** - Distribución de carga de lectura
- **Connection Pooling** - Optimización de conexiones
- **Query Optimization** - Indexes y query planning
- **Caching** - Redis para datos frecuentes

### **Infrastructure Scaling**
- **Edge Computing** - Cloudflare/Vercel Edge
- **CDN** - Assets distribuidos globalmente
- **Load Balancing** - Distribución de tráfico
- **Auto-scaling** - Escalado automático de recursos

---

## 🛡️ DISASTER RECOVERY

### **Backup Strategy**
- **Database Backups** - Daily automated backups
- **Point-in-time Recovery** - Supabase PITR
- **File Backups** - Storage replication
- **Configuration Backups** - Infrastructure as Code

### **Monitoring & Alerting**
- **Uptime Monitoring** - 24/7 availability checks
- **Error Tracking** - Real-time error notifications
- **Performance Monitoring** - Response time tracking
- **Business Metrics** - KPI monitoring

---

Esta arquitectura proporciona una base sólida, escalable y mantenible para el crecimiento de PODENZA, con patrones claros para la extensión de funcionalidades y integración de nuevos servicios.