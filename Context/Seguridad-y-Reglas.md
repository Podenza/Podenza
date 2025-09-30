# 🛡️ SEGURIDAD Y REGLAS DE CÓDIGO - PODENZA

## Información General
Este documento establece las **reglas de seguridad y mejores prácticas** para el desarrollo en PODENZA, específicamente diseñadas para el stack **Vercel + Supabase** con **arquitectura SaaS multi-tenancy** optimizada para **+1000 transacciones por hora** y todas las integraciones externas.

---

## 🔐 SEGURIDAD DE AUTENTICACIÓN

### **Supabase Auth - Reglas Obligatorias**

#### **JWT Token Management**
```typescript
// ✅ CORRECTO - Verificar token en cada request crítico
const { data: { session }, error } = await supabase.auth.getSession();
if (!session?.access_token) {
  throw new Error('Authentication required');
}

// ❌ INCORRECTO - Confiar solo en localStorage
const token = localStorage.getItem('token');
```

#### **Session Validation**
```typescript
// ✅ CORRECTO - Validar sesión en middleware
export async function middleware(request: NextRequest) {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session && request.nextUrl.pathname.startsWith('/home')) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }
}

// ❌ INCORRECTO - Validar solo en cliente
```

#### **Password Security**
```typescript
// ✅ CORRECTO - Políticas de contraseña fuertes
const passwordSchema = z.string()
  .min(12, 'Mínimo 12 caracteres')
  .regex(/[A-Z]/, 'Debe contener mayúsculas')
  .regex(/[a-z]/, 'Debe contener minúsculas')
  .regex(/[0-9]/, 'Debe contener números')
  .regex(/[^A-Za-z0-9]/, 'Debe contener símbolos');

// ❌ INCORRECTO - Contraseñas débiles
const weakPassword = z.string().min(6);
```

---

## 🗄️ SEGURIDAD DE BASE DE DATOS - MULTI-TENANT

### **🏢 TENANT ISOLATION (CRÍTICO PARA SAAS)**

PODENZA implementa **isolation completo de tenants** usando Row Level Security optimizado para performance crítico:

#### **Políticas RLS Multi-Tenant Obligatorias**
```sql
-- ✅ CORRECTO - RLS multi-tenant para todas las tablas
-- TABLA: accounts (extendida para multi-tenancy)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access accounts from their org" ON accounts
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id
            FROM accounts
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- TABLA: solicitudes (particionada por organization_id)
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access solicitudes from their org" ON solicitudes
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id
            FROM accounts
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- TABLA: organizations (solo la organización del usuario)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their organization" ON organizations
    FOR ALL TO authenticated
    USING (
        id IN (
            SELECT organization_id
            FROM accounts
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- ❌ INCORRECTO - RLS sin tenant isolation
-- CREATE POLICY "All users can access" ON solicitudes FOR ALL USING (true);
```

#### **Validation Multi-Tenant en Frontend**
```typescript
// ✅ CORRECTO - Siempre incluir organization_id en queries
const { data: solicitudes, error } = await supabase
  .from('solicitudes')
  .select('*')
  .eq('organization_id', currentOrganization.id)  // OBLIGATORIO
  .eq('estado', 'viabilidad')
  .order('fecha_solicitud', { ascending: false });

// ✅ CORRECTO - Verificar tenant antes de operaciones críticas
const validateTenantAccess = async (solicitudId: string) => {
  const { data } = await supabase
    .from('solicitudes')
    .select('organization_id')
    .eq('id', solicitudId)
    .single();

  if (data?.organization_id !== currentOrganization.id) {
    throw new Error('Unauthorized: Cross-tenant access attempt');
  }
};

// ❌ INCORRECTO - Query sin tenant isolation
const { data } = await supabase
  .from('solicitudes')
  .select('*')
  .eq('id', solicitudId); // Vulnerable a cross-tenant access
```

### **⚡ PERFORMANCE OPTIMIZATION RULES**

#### **Índices Obligatorios para Queries Multi-Tenant**
```sql
-- ✅ OBLIGATORIO - Índices compuestos con organization_id PRIMERO
CREATE INDEX CONCURRENTLY idx_solicitudes_org_estado
    ON solicitudes (organization_id, estado);

CREATE INDEX CONCURRENTLY idx_solicitudes_org_fecha
    ON solicitudes (organization_id, fecha_solicitud DESC);

-- ✅ OBLIGATORIO - Índices parciales para queries frecuentes
CREATE INDEX CONCURRENTLY idx_solicitudes_org_activas
    ON solicitudes (organization_id, estado, fecha_solicitud DESC)
    WHERE estado IN ('viabilidad', 'viable', 'pre_aprobado', 'en_estudio');

-- ❌ INCORRECTO - Índice sin organization_id
-- CREATE INDEX idx_bad_index ON solicitudes (estado); -- No optimizado para multi-tenant
```

#### **Query Performance Rules**
```typescript
// ✅ CORRECTO - Query optimizada para +1000 TPS
const getActiveSolicitudes = async (organizationId: string) => {
  const { data, error } = await supabase
    .rpc('search_solicitudes', {
      org_id: organizationId,
      estado_filter: 'viabilidad',
      limit_results: 50
    });

  return data;
};

// ✅ CORRECTO - Usar funciones optimizadas con cache
const getStats = async (organizationId: string) => {
  const { data } = await supabase
    .rpc('get_solicitudes_stats', { org_id: organizationId });

  return data;
};

// ❌ INCORRECTO - Query sin optimización
const getBadStats = async () => {
  const { data } = await supabase
    .from('solicitudes')
    .select('*'); // Sin filtros, sin paginación, sin cache
};
```

#### **Validación de Datos de Entrada**
```typescript
// ✅ CORRECTO - Validación estricta con Zod
const solicitudSchema = z.object({
  monto: z.number().positive().max(100000000), // Límite máximo
  cedula: z.string().regex(/^\d{8,11}$/, 'Cédula inválida'),
  email: z.string().email().max(320),
  telefono: z.string().regex(/^\+57[0-9]{10}$/, 'Teléfono colombiano requerido')
});

// ❌ INCORRECTO - Sin validación
const data = JSON.parse(request.body);
```

#### **Prevención de SQL Injection**
```typescript
// ✅ CORRECTO - Usar parámetros preparados
const { data, error } = await supabase
  .from('solicitudes')
  .select('*')
  .eq('cedula', userCedula)
  .eq('status', 'active');

// ❌ INCORRECTO - Concatenación de strings
const query = `SELECT * FROM solicitudes WHERE cedula = '${userInput}'`;
```

### **Backup y Recuperación**
```typescript
// ✅ CORRECTO - Configurar backups automáticos
// En Supabase Dashboard:
// 1. Habilitar Point-in-Time Recovery
// 2. Configurar backups diarios automáticos
// 3. Retención de 30 días mínimo
// 4. Verificar backups semanalmente

// ❌ INCORRECTO - Sin estrategia de backup
```

---

## 🌐 SEGURIDAD DE APIs

### **Rate Limiting y DDoS Protection**

#### **Vercel Edge Functions**
```typescript
// ✅ CORRECTO - Rate limiting implementado
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  // Process request...
}

// ❌ INCORRECTO - Sin rate limiting
```

#### **Input Sanitization**
```typescript
// ✅ CORRECTO - Sanitizar todos los inputs
import DOMPurify from 'isomorphic-dompurify';

const sanitizedInput = DOMPurify.sanitize(userInput);
const validatedData = solicitudSchema.parse(sanitizedInput);

// ❌ INCORRECTO - Usar input directamente
const data = JSON.parse(request.body);
await saveToDatabase(data);
```

#### **CORS Configuration**
```typescript
// ✅ CORRECTO - CORS restrictivo
export async function GET(request: Request) {
  const response = new Response(JSON.stringify(data));

  response.headers.set('Access-Control-Allow-Origin', 'https://podenza.vercel.app');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

// ❌ INCORRECTO - CORS permisivo
// response.headers.set('Access-Control-Allow-Origin', '*');
```

---

## 🔑 GESTIÓN DE VARIABLES DE ENTORNO

### **Manejo Seguro de Secrets**
```bash
# ✅ CORRECTO - Variables de entorno seguras
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... # Solo clave anónima en frontend
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Solo en servidor
AUCO_API_SECRET=xxx # Solo en Edge Functions
WHATSAPP_WEBHOOK_SECRET=xxx
SENDGRID_API_KEY=SG.xxx
BANCOLOMBIA_CLIENT_SECRET=xxx

# ❌ INCORRECTO - Secrets en frontend
# NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJ...
# NEXT_PUBLIC_BANKING_SECRET=xxx
```

### **Rotación de Claves**
```typescript
// ✅ CORRECTO - Implementar rotación automática
// 1. Claves de API: Rotar cada 90 días
// 2. Webhooks secrets: Rotar cada 30 días
// 3. JWT secrets: Rotar cada 6 meses
// 4. Certificados: Renovar automáticamente (Let's Encrypt)

// Ejemplo de verificación de webhook con rotación
const verifyWebhookSignature = (payload: string, signature: string) => {
  const secrets = [process.env.WEBHOOK_SECRET_CURRENT, process.env.WEBHOOK_SECRET_PREVIOUS];

  return secrets.some(secret => {
    const expectedSignature = crypto
      .createHmac('sha256', secret!)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  });
};
```

---

## 🌍 SEGURIDAD DE INTEGRACIONES EXTERNAS

### **WhatsApp Business API**
```typescript
// ✅ CORRECTO - Validación de webhooks
export async function POST(request: Request) {
  const signature = request.headers.get('x-hub-signature-256');
  const payload = await request.text();

  if (!verifyWhatsAppWebhook(payload, signature)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Validar estructura del mensaje
  const messageSchema = z.object({
    entry: z.array(z.object({
      id: z.string(),
      changes: z.array(z.object({
        value: z.object({
          messages: z.array(z.object({
            from: z.string().regex(/^\d{10,15}$/),
            text: z.object({
              body: z.string().max(4096) // Límite de WhatsApp
            })
          }))
        })
      }))
    }))
  });

  const validatedData = messageSchema.parse(JSON.parse(payload));
}

// ❌ INCORRECTO - Sin validación de webhook
```

### **Banking APIs Security**
```typescript
// ✅ CORRECTO - Implementación segura de APIs bancarias
class BankingAPIClient {
  private async makeSecureRequest(endpoint: string, data: any) {
    // 1. Encriptar datos sensibles
    const encryptedData = await this.encryptSensitiveData(data);

    // 2. Usar certificados mutuos (mTLS)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getSecureToken()}`,
        'X-Request-ID': crypto.randomUUID(),
        'X-Timestamp': Date.now().toString()
      },
      body: JSON.stringify(encryptedData),
      // Configurar certificados client para mTLS
    });

    // 3. Validar respuesta y logs de auditoría
    await this.logBankingTransaction(endpoint, response.status);

    return response;
  }

  private async encryptSensitiveData(data: any) {
    // Encriptar números de cuenta, cédulas, etc.
    return data;
  }
}

// ❌ INCORRECTO - Datos sensibles sin encriptar
```

### **AUCO Integration Security**
```typescript
// ✅ CORRECTO - Seguridad para consultas de centrales de riesgo
const aucoClient = {
  async consultarCentralRiesgo(cedula: string) {
    // 1. Validar autorización previa del usuario
    const consent = await this.verifyUserConsent(cedula);
    if (!consent) {
      throw new Error('User consent required for credit bureau check');
    }

    // 2. Encriptar cédula en tránsito
    const encryptedCedula = await this.encrypt(cedula);

    // 3. Log de auditoría
    await this.auditLog({
      action: 'AUCO_CONSULTATION',
      user_id: getCurrentUserId(),
      cedula_hash: crypto.createHash('sha256').update(cedula).digest('hex'),
      timestamp: new Date().toISOString()
    });

    // 4. Request con timeout y retry
    const response = await this.secureApiCall('/consulta', {
      cedula: encryptedCedula,
      timeout: 10000,
      retries: 2
    });

    return response;
  }
};

// ❌ INCORRECTO - Sin consentimiento ni auditoría
```

---

## 📁 SEGURIDAD DE ARCHIVOS Y STORAGE

### **Supabase Storage Security**
```typescript
// ✅ CORRECTO - Upload seguro de archivos
const uploadSecureFile = async (file: File, userId: string) => {
  // 1. Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed');
  }

  // 2. Validar tamaño (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large');
  }

  // 3. Scanear virus (implementar con ClamAV o similar)
  const isSafe = await scanFileForVirus(file);
  if (!isSafe) {
    throw new Error('File contains malware');
  }

  // 4. Generar nombre seguro
  const fileExtension = file.name.split('.').pop();
  const safeFileName = `${userId}/${crypto.randomUUID()}.${fileExtension}`;

  // 5. Upload con políticas RLS
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(safeFileName, file, {
      upsert: false,
      metadata: {
        uploaded_by: userId,
        original_name: file.name,
        upload_timestamp: new Date().toISOString()
      }
    });

  return data;
};

// ❌ INCORRECTO - Upload sin validación
const { data } = await supabase.storage.from('documents').upload(file.name, file);
```

### **Storage Policies**
```sql
-- ✅ CORRECTO - Políticas restrictivas de storage
CREATE POLICY "Users can upload own documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' AND
        auth.uid()::text = (storage.foldername(name))[1] AND
        octet_length(metadata) < 1048576 -- 1MB metadata limit
    );

CREATE POLICY "Users can read own documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ❌ INCORRECTO - Política permisiva
-- CREATE POLICY "Anyone can access" ON storage.objects FOR ALL USING (true);
```

---

## 🤖 SEGURIDAD DE IA

### **OpenAI/Claude Integration Security**
```typescript
// ✅ CORRECTO - Uso seguro de APIs de IA
class AIService {
  async processDocument(document: string, userId: string) {
    // 1. Sanitizar documento antes de enviar a IA
    const sanitized = this.sanitizeDocument(document);

    // 2. Remover información sensible
    const redacted = this.redactSensitiveInfo(sanitized);

    // 3. Log de auditoría
    await this.logAIUsage({
      user_id: userId,
      action: 'DOCUMENT_ANALYSIS',
      data_hash: crypto.createHash('sha256').update(document).digest('hex'),
      ai_provider: 'openai'
    });

    // 4. Request con timeout
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Analiza el documento sin revelar información personal."
        },
        {
          role: "user",
          content: redacted
        }
      ],
      max_tokens: 1000,
      temperature: 0.1 // Respuestas determinísticas
    });

    return response;
  }

  private redactSensitiveInfo(text: string): string {
    // Redactar números de cédula, cuentas bancarias, etc.
    return text
      .replace(/\d{8,11}/g, '[CEDULA_REDACTED]')
      .replace(/\d{10,20}/g, '[ACCOUNT_REDACTED]')
      .replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '[EMAIL_REDACTED]');
  }
}

// ❌ INCORRECTO - Enviar datos sensibles sin redactar
```

---

## 📊 MONITOREO Y ALERTAS

### **Security Monitoring**
```typescript
// ✅ CORRECTO - Monitoreo proactivo de seguridad
const securityMonitor = {
  // Detectar intentos de login sospechosos
  async detectSuspiciousLogin(userId: string, ip: string) {
    const recentLogins = await this.getRecentLogins(userId, '1 hour');

    // Multiple IPs en corto tiempo
    const uniqueIPs = new Set(recentLogins.map(login => login.ip));
    if (uniqueIPs.size > 3) {
      await this.triggerSecurityAlert('MULTIPLE_IP_LOGIN', { userId, ips: Array.from(uniqueIPs) });
    }

    // Logins desde países inusuales
    const userCountry = await this.getUserCountry(userId);
    const currentCountry = await this.getIPCountry(ip);
    if (userCountry !== currentCountry) {
      await this.triggerSecurityAlert('FOREIGN_LOGIN', { userId, country: currentCountry });
    }
  },

  // Monitorear uso anómalo de APIs
  async monitorAPIUsage(userId: string) {
    const usage = await this.getAPIUsage(userId, '1 hour');
    const avgUsage = await this.getAvgAPIUsage(userId, '7 days');

    if (usage > avgUsage * 5) {
      await this.triggerSecurityAlert('ANOMALOUS_API_USAGE', { userId, usage, average: avgUsage });
    }
  }
};

// ❌ INCORRECTO - Sin monitoreo de seguridad
```

### **Error Handling y Logging**
```typescript
// ✅ CORRECTO - Logging seguro sin exponer datos
const secureLogger = {
  logError(error: Error, context: any) {
    // No loggear datos sensibles
    const safeContext = {
      ...context,
      cedula: context.cedula ? '[REDACTED]' : undefined,
      account_number: context.account_number ? '[REDACTED]' : undefined,
      password: undefined,
      token: undefined
    };

    console.error('Application error:', {
      message: error.message,
      stack: error.stack,
      context: safeContext,
      timestamp: new Date().toISOString(),
      user_id: context.user_id
    });
  }
};

// ❌ INCORRECTO - Loggear datos sensibles
console.log('User data:', { cedula: userCedula, password: userPassword });
```

---

## 🔄 MANTENIMIENTO Y ACTUALIZACIONES

### **Dependency Security**
```bash
# ✅ CORRECTO - Auditoría regular de dependencias
npm audit --audit-level=moderate
npm update
npx @next/codemod@latest next-safe-navigation

# Verificar vulnerabilidades en tiempo real
npm install --save-dev @snyk/cli
npx snyk test

# ❌ INCORRECTO - Dependencias desactualizadas
# No ejecutar npm audit durante meses
```

### **Security Updates**
```typescript
// ✅ CORRECTO - Pipeline de actualizaciones automáticas
// .github/workflows/security-updates.yml
/*
name: Security Updates
on:
  schedule:
    - cron: '0 2 * * 1' # Lunes a las 2 AM

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run security audit
        run: |
          npm audit --audit-level=high
          npm outdated

      - name: Update dependencies
        run: |
          npm update

      - name: Run tests
        run: |
          npm run test
          npm run build
*/
```

---

## 📋 CHECKLIST DE SEGURIDAD

### **Pre-deployment Checklist**
- [ ] RLS habilitado en todas las tablas
- [ ] Variables de entorno configuradas correctamente
- [ ] Rate limiting implementado
- [ ] Input validation con Zod en todos los endpoints
- [ ] Webhook signatures verificadas
- [ ] File upload restrictions configuradas
- [ ] Error logging sin datos sensibles
- [ ] Dependencies actualizadas y sin vulnerabilidades
- [ ] CORS configurado restrictivamente
- [ ] Backup automático configurado
- [ ] Monitoring y alertas activos
- [ ] SSL/TLS certificados válidos
- [ ] Security headers configurados
- [ ] Authentication flow tested
- [ ] API documentation actualizada

### **Incident Response Plan**
1. **Detección** - Monitoreo 24/7 con alertas automáticas
2. **Contención** - Procedimientos para aislar amenazas
3. **Erradicación** - Eliminar vulnerabilidades identificadas
4. **Recuperación** - Restaurar servicios de forma segura
5. **Lecciones Aprendidas** - Documentar y mejorar procesos

---

Este documento debe ser revisado y actualizado **mensualmente** para mantener las mejores prácticas de seguridad actualizadas con las últimas amenazas y vulnerabilidades del stack tecnológico de PODENZA.