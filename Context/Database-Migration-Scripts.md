# 🗄️ SCRIPTS DE MIGRACIÓN - MULTI-TENANT DATABASE

## 📋 Información General
Este documento contiene todos los **scripts de migración** necesarios para transformar la arquitectura actual de PODENZA a un **sistema SaaS multi-tenancy optimizado** para soportar **+1000 transacciones por hora**.

---

## 🚀 SCRIPT PRINCIPAL DE MIGRACIÓN

### **Migration: 20250101000000_multi_tenant_optimization.sql**

```sql
/*
 * -------------------------------------------------------
 * PODENZA - MIGRACIÓN A ARQUITECTURA MULTI-TENANT
 * Optimización crítica para +1000 transacciones/hora
 * Performance: Vercel + Next.js + Supabase
 * -------------------------------------------------------
 */

-- ========================================
-- SECCIÓN 1: EXTENSIONES NECESARIAS
-- ========================================

-- Extensiones para performance optimizado
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ========================================
-- SECCIÓN 2: TABLA DE ORGANIZACIONES (TENANTS)
-- ========================================

-- Crear tabla principal de organizaciones
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    plan_type VARCHAR(50) NOT NULL DEFAULT 'basic',
    max_users INTEGER NOT NULL DEFAULT 10,
    max_solicitudes INTEGER NOT NULL DEFAULT 100,
    settings JSONB NOT NULL DEFAULT '{}',
    billing_email VARCHAR(320),
    subscription_status VARCHAR(50) DEFAULT 'active',
    subscription_ends_at TIMESTAMPTZ,
    features JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Índices críticos para organizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_slug
    ON public.organizations (slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_active
    ON public.organizations (is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_plan
    ON public.organizations (plan_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organizations_status
    ON public.organizations (subscription_status);

-- Comentarios de documentación
COMMENT ON TABLE public.organizations IS 'Tabla principal de organizaciones/tenants para SaaS multi-tenancy';
COMMENT ON COLUMN public.organizations.slug IS 'Slug único para URL y tenant identification';
COMMENT ON COLUMN public.organizations.plan_type IS 'Tipo de plan: basic, premium, enterprise';
COMMENT ON COLUMN public.organizations.features IS 'Features habilitadas por plan';

-- ========================================
-- SECCIÓN 3: EXTENDER TABLA ACCOUNTS
-- ========================================

-- Agregar columnas necesarias para multi-tenancy
ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tenant_permissions JSONB NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS invitation_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES public.accounts(id),
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();

-- Agregar constraint único para email por organización
ALTER TABLE public.accounts
ADD CONSTRAINT IF NOT EXISTS uk_accounts_email_org
UNIQUE (organization_id, email);

-- Índices optimizados para accounts multi-tenant
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_org_active
    ON public.accounts (organization_id, is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_org_role
    ON public.accounts (organization_id, role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_email_org
    ON public.accounts (email, organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_invitation
    ON public.accounts (invitation_token) WHERE invitation_token IS NOT NULL;

-- ========================================
-- SECCIÓN 4: TABLA SOLICITUDES PARTICIONADA
-- ========================================

-- Crear tabla principal de solicitudes (particionada)
CREATE TABLE IF NOT EXISTS public.solicitudes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    numero_solicitud VARCHAR(50) NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    cliente VARCHAR(255) NOT NULL,
    asesor_id UUID REFERENCES public.accounts(id),
    asesor_name VARCHAR(255) NOT NULL,
    afiliado BOOLEAN NOT NULL DEFAULT false,
    vitrina VARCHAR(100),
    banco VARCHAR(100),
    monto DECIMAL(15,2) NOT NULL,
    producto VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'viabilidad',
    fecha_solicitud DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}',
    search_vector TSVECTOR,
    priority_score INTEGER DEFAULT 0,
    estimated_approval_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.accounts(id),
    updated_by UUID REFERENCES public.accounts(id)
) PARTITION BY HASH (organization_id);

-- Crear particiones para mejor performance
CREATE TABLE IF NOT EXISTS solicitudes_part_0 PARTITION OF public.solicitudes
    FOR VALUES WITH (modulus 4, remainder 0);
CREATE TABLE IF NOT EXISTS solicitudes_part_1 PARTITION OF public.solicitudes
    FOR VALUES WITH (modulus 4, remainder 1);
CREATE TABLE IF NOT EXISTS solicitudes_part_2 PARTITION OF public.solicitudes
    FOR VALUES WITH (modulus 4, remainder 2);
CREATE TABLE IF NOT EXISTS solicitudes_part_3 PARTITION OF public.solicitudes
    FOR VALUES WITH (modulus 4, remainder 3);

-- Constraint único para número de solicitud por organización
ALTER TABLE public.solicitudes
ADD CONSTRAINT IF NOT EXISTS uk_solicitudes_numero_org
UNIQUE (organization_id, numero_solicitud);

-- ========================================
-- SECCIÓN 5: ÍNDICES CRÍTICOS PARA PERFORMANCE
-- ========================================

-- Índices principales para solicitudes (CRÍTICOS para +1000 TPS)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitudes_org_estado
    ON public.solicitudes (organization_id, estado);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitudes_org_fecha
    ON public.solicitudes (organization_id, fecha_solicitud DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitudes_org_asesor
    ON public.solicitudes (organization_id, asesor_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitudes_cedula_org
    ON public.solicitudes (organization_id, cedula);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitudes_monto_org
    ON public.solicitudes (organization_id, monto);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitudes_created_org
    ON public.solicitudes (organization_id, created_at DESC);

-- Índice GIN para full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitudes_search
    ON public.solicitudes USING GIN (search_vector);

-- Índice parcial para solicitudes activas (queries más frecuentes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitudes_org_activas
    ON public.solicitudes (organization_id, estado, fecha_solicitud DESC)
    WHERE estado IN ('viabilidad', 'viable', 'pre_aprobado', 'en_estudio');

-- Índice compuesto para dashboard stats
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitudes_stats
    ON public.solicitudes (organization_id, estado, fecha_solicitud)
    WHERE estado IN ('viabilidad', 'viable', 'pre_aprobado', 'aprobado', 'negado');

-- ========================================
-- SECCIÓN 6: TABLA DE DOCUMENTOS
-- ========================================

CREATE TABLE IF NOT EXISTS public.documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    solicitud_id UUID REFERENCES public.solicitudes(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    categoria VARCHAR(100),
    archivo_url VARCHAR(1000) NOT NULL,
    mime_type VARCHAR(100),
    tamaño_bytes BIGINT,
    checksum VARCHAR(64),
    version INTEGER NOT NULL DEFAULT 1,
    es_version_actual BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}',
    estado_validacion VARCHAR(50) DEFAULT 'pendiente',
    validado_por UUID REFERENCES public.accounts(id),
    validado_at TIMESTAMPTZ,
    observaciones TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.accounts(id)
);

-- Índices para documentos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documentos_org_solicitud
    ON public.documentos (organization_id, solicitud_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documentos_org_tipo
    ON public.documentos (organization_id, tipo);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documentos_version_actual
    ON public.documentos (solicitud_id, es_version_actual)
    WHERE es_version_actual = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documentos_validacion
    ON public.documentos (organization_id, estado_validacion);

-- ========================================
-- SECCIÓN 7: AUDIT TRAIL PARTICIONADO
-- ========================================

-- Tabla de auditoría particionada por fecha
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES public.accounts(id),
    user_email VARCHAR(320),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    request_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Crear particiones mensuales para audit (mejor performance)
CREATE TABLE IF NOT EXISTS audit_logs_2024_12 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
CREATE TABLE IF NOT EXISTS audit_logs_2025_01 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE IF NOT EXISTS audit_logs_2025_02 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE IF NOT EXISTS audit_logs_2025_03 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- Índices para audit logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_org_table
    ON public.audit_logs (organization_id, table_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_record
    ON public.audit_logs (table_name, record_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_user
    ON public.audit_logs (organization_id, user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_created
    ON public.audit_logs (organization_id, created_at DESC);

-- ========================================
-- SECCIÓN 8: GESTIÓN BANCARIA
-- ========================================

-- Configuración de bancos por organización
CREATE TABLE IF NOT EXISTS public.bancos_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    banco_nombre VARCHAR(100) NOT NULL,
    banco_codigo VARCHAR(20) NOT NULL,
    api_endpoint VARCHAR(500),
    configuracion JSONB NOT NULL DEFAULT '{}',
    credenciales_encrypted JSONB NOT NULL DEFAULT '{}',
    limits_config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(organization_id, banco_codigo)
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bancos_org_active
    ON public.bancos_config (organization_id, is_active) WHERE is_active = true;

-- Envíos a bancos (tracking detallado)
CREATE TABLE IF NOT EXISTS public.envios_bancarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    solicitud_id UUID NOT NULL REFERENCES public.solicitudes(id) ON DELETE CASCADE,
    banco_id UUID NOT NULL REFERENCES public.bancos_config(id),
    estado VARCHAR(50) NOT NULL DEFAULT 'enviado',
    sub_estado VARCHAR(100),
    referencia_banco VARCHAR(100),
    monto_enviado DECIMAL(15,2),
    respuesta_banco JSONB,
    error_details JSONB,
    retry_count INTEGER DEFAULT 0,
    fecha_envio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_respuesta TIMESTAMPTZ,
    fecha_vencimiento TIMESTAMPTZ,
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_envios_org_solicitud
    ON public.envios_bancarios (organization_id, solicitud_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_envios_estado
    ON public.envios_bancarios (organization_id, estado);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_envios_banco
    ON public.envios_bancarios (banco_id, estado);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_envios_fecha
    ON public.envios_bancarios (organization_id, fecha_envio DESC);

-- ========================================
-- SECCIÓN 9: CONFIGURACIONES Y CACHE
-- ========================================

-- Tabla para cache de estadísticas (performance crítico)
CREATE TABLE IF NOT EXISTS public.stats_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    cache_key VARCHAR(200) NOT NULL,
    cache_data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(organization_id, cache_key)
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stats_cache_key
    ON public.stats_cache (organization_id, cache_key);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stats_cache_expires
    ON public.stats_cache (expires_at) WHERE expires_at > NOW();

-- Configuraciones globales por organización
CREATE TABLE IF NOT EXISTS public.org_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.accounts(id),

    UNIQUE(organization_id, setting_key)
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_settings
    ON public.org_settings (organization_id, setting_key);

-- ========================================
-- SECCIÓN 10: FUNCIONES OPTIMIZADAS
-- ========================================

-- Función para actualizar search_vector automáticamente
CREATE OR REPLACE FUNCTION update_solicitudes_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('spanish',
        COALESCE(NEW.numero_solicitud, '') || ' ' ||
        COALESCE(NEW.cedula, '') || ' ' ||
        COALESCE(NEW.cliente, '') || ' ' ||
        COALESCE(NEW.asesor_name, '') || ' ' ||
        COALESCE(NEW.vitrina, '') || ' ' ||
        COALESCE(NEW.banco, '') || ' ' ||
        COALESCE(NEW.producto, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para search vector
DROP TRIGGER IF EXISTS trigger_update_solicitudes_search ON public.solicitudes;
CREATE TRIGGER trigger_update_solicitudes_search
    BEFORE INSERT OR UPDATE ON public.solicitudes
    FOR EACH ROW EXECUTE FUNCTION update_solicitudes_search_vector();

-- Función para estadísticas optimizada (con cache)
CREATE OR REPLACE FUNCTION get_solicitudes_stats(org_id UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
    cache_key VARCHAR(200);
    cached_result RECORD;
BEGIN
    -- Verificar cache primero
    cache_key := 'solicitudes_stats';

    SELECT cache_data, expires_at INTO cached_result
    FROM public.stats_cache
    WHERE organization_id = org_id
    AND cache_key = cache_key
    AND expires_at > NOW();

    IF FOUND THEN
        RETURN cached_result.cache_data;
    END IF;

    -- Calcular estadísticas
    SELECT json_build_object(
        'total', COUNT(*),
        'viabilidad', COUNT(*) FILTER (WHERE estado = 'viabilidad'),
        'viable', COUNT(*) FILTER (WHERE estado = 'viable'),
        'pre_aprobado', COUNT(*) FILTER (WHERE estado = 'pre_aprobado'),
        'en_estudio', COUNT(*) FILTER (WHERE estado = 'en_estudio'),
        'aprobado', COUNT(*) FILTER (WHERE estado = 'aprobado'),
        'negado', COUNT(*) FILTER (WHERE estado = 'negado'),
        'monto_total', COALESCE(SUM(monto), 0),
        'monto_promedio', COALESCE(AVG(monto), 0),
        'por_asesor', (
            SELECT json_object_agg(asesor_name, cnt)
            FROM (
                SELECT asesor_name, COUNT(*) as cnt
                FROM public.solicitudes
                WHERE organization_id = org_id
                GROUP BY asesor_name
                ORDER BY cnt DESC
                LIMIT 10
            ) t
        ),
        'last_updated', NOW()
    ) INTO stats
    FROM public.solicitudes
    WHERE organization_id = org_id;

    -- Guardar en cache (5 minutos)
    INSERT INTO public.stats_cache (organization_id, cache_key, cache_data, expires_at)
    VALUES (org_id, cache_key, stats, NOW() + INTERVAL '5 minutes')
    ON CONFLICT (organization_id, cache_key)
    DO UPDATE SET
        cache_data = EXCLUDED.cache_data,
        expires_at = EXCLUDED.expires_at;

    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función de búsqueda optimizada con full-text
CREATE OR REPLACE FUNCTION search_solicitudes(
    org_id UUID,
    search_term TEXT DEFAULT '',
    estado_filter TEXT DEFAULT '',
    fecha_desde DATE DEFAULT NULL,
    fecha_hasta DATE DEFAULT NULL,
    asesor_filter UUID DEFAULT NULL,
    limit_results INTEGER DEFAULT 50,
    offset_results INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    numero_solicitud VARCHAR,
    cedula VARCHAR,
    cliente VARCHAR,
    asesor_name VARCHAR,
    afiliado BOOLEAN,
    vitrina VARCHAR,
    banco VARCHAR,
    monto DECIMAL,
    producto VARCHAR,
    estado VARCHAR,
    fecha_solicitud DATE,
    created_at TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.numero_solicitud,
        s.cedula,
        s.cliente,
        s.asesor_name,
        s.afiliado,
        s.vitrina,
        s.banco,
        s.monto,
        s.producto,
        s.estado,
        s.fecha_solicitud,
        s.created_at,
        CASE
            WHEN search_term = '' THEN 1.0
            ELSE ts_rank(s.search_vector, plainto_tsquery('spanish', search_term))
        END as rank
    FROM public.solicitudes s
    WHERE s.organization_id = org_id
    AND (search_term = '' OR s.search_vector @@ plainto_tsquery('spanish', search_term))
    AND (estado_filter = '' OR s.estado = estado_filter)
    AND (fecha_desde IS NULL OR s.fecha_solicitud >= fecha_desde)
    AND (fecha_hasta IS NULL OR s.fecha_solicitud <= fecha_hasta)
    AND (asesor_filter IS NULL OR s.asesor_id = asesor_filter)
    ORDER BY
        CASE
            WHEN search_term = '' THEN s.fecha_solicitud
            ELSE NULL
        END DESC,
        CASE
            WHEN search_term != '' THEN ts_rank(s.search_vector, plainto_tsquery('spanish', search_term))
            ELSE NULL
        END DESC,
        s.created_at DESC
    LIMIT limit_results
    OFFSET offset_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- SECCIÓN 11: RLS POLICIES OPTIMIZADAS
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bancos_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envios_bancarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_settings ENABLE ROW LEVEL SECURITY;

-- Actualizar RLS policy para accounts
DROP POLICY IF EXISTS "accounts_read" ON public.accounts;
DROP POLICY IF EXISTS "accounts_update" ON public.accounts;

CREATE POLICY "Users can access accounts from their org" ON public.accounts
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.accounts
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies para organizations
CREATE POLICY "Users can access their organization" ON public.organizations
    FOR ALL TO authenticated
    USING (
        id IN (
            SELECT organization_id
            FROM public.accounts
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies para solicitudes (CRÍTICO para performance)
CREATE POLICY "Users can access solicitudes from their org" ON public.solicitudes
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.accounts
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies para documentos
CREATE POLICY "Users can access documentos from their org" ON public.documentos
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.accounts
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies para bancos_config
CREATE POLICY "Users can access bancos from their org" ON public.bancos_config
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.accounts
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies para envios_bancarios
CREATE POLICY "Users can access envios from their org" ON public.envios_bancarios
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.accounts
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies para audit_logs (solo admins)
CREATE POLICY "Admins can access audit logs from their org" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.accounts
            WHERE id = auth.uid()
            AND is_active = true
            AND role IN ('admin', 'super_admin')
        )
    );

-- RLS Policies para stats_cache
CREATE POLICY "Users can access stats cache from their org" ON public.stats_cache
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.accounts
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies para org_settings
CREATE POLICY "Users can access settings from their org" ON public.org_settings
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.accounts
            WHERE id = auth.uid() AND is_active = true
        )
    );

-- ========================================
-- SECCIÓN 12: TRIGGERS DE AUDITORÍA
-- ========================================

-- Función genérica de auditoría optimizada
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
    user_info RECORD;
    changed_fields TEXT[] := '{}';
    old_json JSONB;
    new_json JSONB;
BEGIN
    -- Obtener organization_id
    IF TG_OP = 'DELETE' THEN
        org_id := OLD.organization_id;
        old_json := to_jsonb(OLD);
    ELSE
        org_id := NEW.organization_id;
        new_json := to_jsonb(NEW);
        IF TG_OP = 'UPDATE' THEN
            old_json := to_jsonb(OLD);
            -- Detectar campos cambiados
            SELECT array_agg(key) INTO changed_fields
            FROM jsonb_each(new_json)
            WHERE value != COALESCE(old_json->key, 'null'::jsonb);
        END IF;
    END IF;

    -- Obtener info del usuario actual
    SELECT organization_id, email INTO user_info
    FROM public.accounts
    WHERE id = auth.uid();

    -- Solo auditar si hay cambios significativos
    IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' OR
       (TG_OP = 'UPDATE' AND array_length(changed_fields, 1) > 0) THEN

        INSERT INTO public.audit_logs (
            organization_id,
            table_name,
            record_id,
            action,
            old_values,
            new_values,
            changed_fields,
            user_id,
            user_email
        ) VALUES (
            org_id,
            TG_TABLE_NAME,
            CASE
                WHEN TG_OP = 'DELETE' THEN OLD.id
                ELSE NEW.id
            END,
            TG_OP,
            old_json,
            new_json,
            changed_fields,
            auth.uid(),
            user_info.email
        );
    END IF;

    RETURN CASE
        WHEN TG_OP = 'DELETE' THEN OLD
        ELSE NEW
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar triggers de auditoría
DROP TRIGGER IF EXISTS audit_solicitudes_trigger ON public.solicitudes;
CREATE TRIGGER audit_solicitudes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.solicitudes
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_documentos_trigger ON public.documentos;
CREATE TRIGGER audit_documentos_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.documentos
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_envios_trigger ON public.envios_bancarios;
CREATE TRIGGER audit_envios_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.envios_bancarios
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ========================================
-- SECCIÓN 13: FUNCIONES UTILITARIAS
-- ========================================

-- Función para limpiar cache expirado
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.stats_cache WHERE expires_at <= NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener configuración de organización
CREATE OR REPLACE FUNCTION get_org_setting(org_id UUID, setting_key VARCHAR)
RETURNS JSONB AS $$
DECLARE
    setting_value JSONB;
BEGIN
    SELECT setting_value INTO setting_value
    FROM public.org_settings
    WHERE organization_id = org_id AND setting_key = setting_key;

    RETURN COALESCE(setting_value, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vista para monitoreo de performance
CREATE OR REPLACE VIEW performance_monitoring AS
SELECT
    schemaname,
    tablename,
    n_tup_ins as inserts_per_hour,
    n_tup_upd as updates_per_hour,
    n_tup_del as deletes_per_hour,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    ROUND((n_dead_tup::float / NULLIF(n_live_tup + n_dead_tup, 0)) * 100, 2) as dead_tuple_ratio,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
AND tablename IN ('solicitudes', 'documentos', 'audit_logs', 'accounts', 'organizations')
ORDER BY n_live_tup DESC;

-- ========================================
-- SECCIÓN 14: GRANTS Y PERMISOS
-- ========================================

-- Revocar todos los permisos públicos
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, public;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, public;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, public;

-- Otorgar permisos a usuarios autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Permisos específicos para funciones
GRANT EXECUTE ON FUNCTION get_solicitudes_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_solicitudes(UUID, TEXT, TEXT, DATE, DATE, UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_org_setting(UUID, VARCHAR) TO authenticated;

-- Permisos completos para service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ========================================
-- SECCIÓN 15: DATOS DE EJEMPLO Y SEED
-- ========================================

-- Insertar organización por defecto
INSERT INTO public.organizations (id, name, slug, plan_type, max_users, max_solicitudes)
VALUES (
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    'PODENZA Demo',
    'podenza-demo',
    'enterprise',
    100,
    10000
) ON CONFLICT (slug) DO NOTHING;

-- Actualizar accounts existentes con organización por defecto
UPDATE public.accounts
SET organization_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
WHERE organization_id IS NULL;

-- ========================================
-- COMENTARIOS Y DOCUMENTACIÓN FINAL
-- ========================================

COMMENT ON TABLE public.solicitudes IS 'Tabla principal de solicitudes particionada por organization_id para performance óptimo en SaaS multi-tenant. Optimizada para +1000 transacciones/hora';
COMMENT ON TABLE public.audit_logs IS 'Tabla de auditoría particionada por fecha para compliance y performance';
COMMENT ON FUNCTION get_solicitudes_stats(UUID) IS 'Función optimizada con cache para estadísticas de solicitudes por organización';
COMMENT ON FUNCTION search_solicitudes(UUID, TEXT, TEXT, DATE, DATE, UUID, INTEGER, INTEGER) IS 'Función de búsqueda full-text optimizada para +1000 transacciones/hora con soporte multi-tenant';
COMMENT ON VIEW performance_monitoring IS 'Vista para monitorear performance de tablas críticas en tiempo real';

-- Finalización del script
SELECT 'MIGRACIÓN MULTI-TENANT COMPLETADA EXITOSAMENTE' as resultado;
```

---

## 🔧 SCRIPTS DE MANTENIMIENTO

### **Script de Optimización Continua**

```sql
-- maintenance_optimization.sql
-- Ejecutar semanalmente para mantener performance óptimo

-- 1. Limpiar cache expirado
SELECT cleanup_expired_cache();

-- 2. Analizar tablas críticas
ANALYZE public.solicitudes;
ANALYZE public.documentos;
ANALYZE public.audit_logs;
ANALYZE public.accounts;

-- 3. Reindexar si es necesario (solo si dead_tuple_ratio > 20%)
-- REINDEX INDEX CONCURRENTLY idx_solicitudes_org_estado;

-- 4. Crear nuevas particiones para audit_logs (próximo mes)
-- Esta función debe ejecutarse mensualmente
CREATE OR REPLACE FUNCTION create_next_audit_partition()
RETURNS TEXT AS $$
DECLARE
    next_month DATE;
    partition_name TEXT;
    start_date TEXT;
    end_date TEXT;
BEGIN
    next_month := date_trunc('month', NOW() + INTERVAL '2 months');
    partition_name := 'audit_logs_' || to_char(next_month, 'YYYY_MM');
    start_date := to_char(next_month, 'YYYY-MM-DD');
    end_date := to_char(next_month + INTERVAL '1 month', 'YYYY-MM-DD');

    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF public.audit_logs FOR VALUES FROM (%L) TO (%L)',
                   partition_name, start_date, end_date);

    RETURN 'Partition ' || partition_name || ' created successfully';
END;
$$ LANGUAGE plpgsql;

SELECT create_next_audit_partition();
```

### **Script de Monitoreo de Performance**

```sql
-- performance_monitoring.sql
-- Ejecutar diariamente para verificar performance

-- Verificar performance de queries críticas
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE query LIKE '%solicitudes%'
   OR query LIKE '%organization_id%'
ORDER BY total_time DESC
LIMIT 10;

-- Verificar uso de índices
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
AND tablename IN ('solicitudes', 'accounts', 'documentos')
AND attname IN ('organization_id', 'estado', 'fecha_solicitud');

-- Verificar tamaños de tablas
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### **Pre-Migración**
- [ ] Backup completo de la base de datos actual
- [ ] Verificar que no hay transacciones activas críticas
- [ ] Confirmar versión de PostgreSQL (15+)
- [ ] Verificar espacio disponible en disco
- [ ] Notificar a usuarios de mantenimiento programado

### **Durante la Migración**
- [ ] Ejecutar script principal en transacción
- [ ] Verificar que todos los índices se crearon correctamente
- [ ] Confirmar que las particiones están funcionando
- [ ] Validar que RLS policies están activas
- [ ] Probar funciones principales (get_solicitudes_stats, search_solicitudes)

### **Post-Migración**
- [ ] Verificar performance de queries críticas
- [ ] Confirmar que frontend sigue funcionando
- [ ] Validar que auditoría está capturando cambios
- [ ] Probar búsqueda full-text
- [ ] Configurar monitoreo automático
- [ ] Documentar cambios para el equipo

### **Optimización Continua**
- [ ] Configurar jobs automáticos para mantenimiento
- [ ] Establecer alertas de performance
- [ ] Programar revisiones mensuales de particiones
- [ ] Monitorear crecimiento de datos
- [ ] Optimizar queries según métricas reales

---

**IMPORTANTE**: Este script está diseñado para ser ejecutado en un entorno de desarrollo primero, luego en staging, y finalmente en producción después de validación completa.