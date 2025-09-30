# 🎨 GUÍA DE IMPLEMENTACIÓN FRONTEND - MULTI-TENANT

## 📋 Información General
Esta guía detalla cómo implementar la **arquitectura SaaS multi-tenancy** en el frontend de PODENZA, optimizada para **+1000 transacciones por hora** con performance crítico entre **Vercel + Next.js + Supabase**.

---

## 🏗️ ARQUITECTURA FRONTEND MULTI-TENANT

### **🔧 Context y State Management**

#### **Organization Context (Obligatorio)**
```typescript
// contexts/OrganizationContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan_type: 'basic' | 'premium' | 'enterprise';
  max_users: number;
  max_solicitudes: number;
  settings: Record<string, any>;
  is_active: boolean;
}

interface OrganizationContextType {
  organization: Organization | null;
  isLoading: boolean;
  switchOrganization: (orgId: string) => Promise<void>;
  refetchOrganization: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserOrganization = async () => {
    try {
      setIsLoading(true);

      // Obtener la organización del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select(`
          organization_id,
          organizations (
            id,
            name,
            slug,
            plan_type,
            max_users,
            max_solicitudes,
            settings,
            is_active
          )
        `)
        .eq('id', user.id)
        .eq('is_active', true)
        .single();

      if (accountError) throw accountError;
      if (!account?.organizations) throw new Error('No organization found');

      setOrganization(account.organizations as Organization);
    } catch (error) {
      console.error('Error fetching organization:', error);
      setOrganization(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchOrganization = async (orgId: string) => {
    // Implementar cambio de organización si el usuario pertenece a múltiples
    // Por ahora, PODENZA maneja una organización por usuario
    await fetchUserOrganization();
  };

  const refetchOrganization = async () => {
    await fetchUserOrganization();
  };

  useEffect(() => {
    fetchUserOrganization();
  }, []);

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        isLoading,
        switchOrganization,
        refetchOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
```

### **🔒 Tenant-Aware Supabase Client**

#### **Enhanced Supabase Client**
```typescript
// lib/supabase-tenant.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

class TenantAwareSupabaseClient {
  private client = createClientComponentClient<Database>();
  private organizationId: string | null = null;

  setOrganization(orgId: string) {
    this.organizationId = orgId;
  }

  // Wrapper para queries que SIEMPRE incluye organization_id
  async tenantQuery<T>(
    table: keyof Database['public']['Tables'],
    query: any,
    additionalFilters?: Record<string, any>
  ) {
    if (!this.organizationId) {
      throw new Error('Organization not set - call setOrganization() first');
    }

    let queryBuilder = this.client
      .from(table)
      .select(query)
      .eq('organization_id', this.organizationId);

    // Aplicar filtros adicionales
    if (additionalFilters) {
      Object.entries(additionalFilters).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
    }

    return queryBuilder;
  }

  // Insert que SIEMPRE incluye organization_id
  async tenantInsert<T>(
    table: keyof Database['public']['Tables'],
    data: any
  ) {
    if (!this.organizationId) {
      throw new Error('Organization not set - call setOrganization() first');
    }

    return this.client
      .from(table)
      .insert({
        ...data,
        organization_id: this.organizationId,
      });
  }

  // Update que verifica tenant ownership
  async tenantUpdate<T>(
    table: keyof Database['public']['Tables'],
    id: string,
    data: any
  ) {
    if (!this.organizationId) {
      throw new Error('Organization not set - call setOrganization() first');
    }

    return this.client
      .from(table)
      .update(data)
      .eq('id', id)
      .eq('organization_id', this.organizationId);
  }

  // Delete que verifica tenant ownership
  async tenantDelete(
    table: keyof Database['public']['Tables'],
    id: string
  ) {
    if (!this.organizationId) {
      throw new Error('Organization not set - call setOrganization() first');
    }

    return this.client
      .from(table)
      .delete()
      .eq('id', id)
      .eq('organization_id', this.organizationId);
  }

  // Función optimizada para estadísticas con cache
  async getOrganizationStats() {
    if (!this.organizationId) {
      throw new Error('Organization not set');
    }

    return this.client
      .rpc('get_solicitudes_stats', {
        org_id: this.organizationId
      });
  }

  // Búsqueda optimizada con full-text
  async searchSolicitudes(params: {
    search_term?: string;
    estado_filter?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    asesor_filter?: string;
    limit?: number;
    offset?: number;
  }) {
    if (!this.organizationId) {
      throw new Error('Organization not set');
    }

    return this.client
      .rpc('search_solicitudes', {
        org_id: this.organizationId,
        search_term: params.search_term || '',
        estado_filter: params.estado_filter || '',
        fecha_desde: params.fecha_desde,
        fecha_hasta: params.fecha_hasta,
        asesor_filter: params.asesor_filter,
        limit_results: params.limit || 50,
        offset_results: params.offset || 0
      });
  }

  // Acceso directo al cliente original para casos especiales
  get raw() {
    return this.client;
  }
}

export const tenantSupabase = new TenantAwareSupabaseClient();
```

### **📊 React Query Optimizado para Multi-Tenant**

#### **Custom Hooks para Solicitudes**
```typescript
// hooks/useSolicitudes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/contexts/OrganizationContext';
import { tenantSupabase } from '@/lib/supabase-tenant';

// Query key factory para tenant isolation
const solicitudesQueryKeys = {
  all: (orgId: string) => ['solicitudes', orgId] as const,
  lists: (orgId: string) => [...solicitudesQueryKeys.all(orgId), 'list'] as const,
  list: (orgId: string, filters: any) => [...solicitudesQueryKeys.lists(orgId), filters] as const,
  details: (orgId: string) => [...solicitudesQueryKeys.all(orgId), 'detail'] as const,
  detail: (orgId: string, id: string) => [...solicitudesQueryKeys.details(orgId), id] as const,
  stats: (orgId: string) => [...solicitudesQueryKeys.all(orgId), 'stats'] as const,
  search: (orgId: string, params: any) => [...solicitudesQueryKeys.all(orgId), 'search', params] as const,
};

export const useSolicitudes = (filters?: {
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  asesor_id?: string;
}) => {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: solicitudesQueryKeys.list(organization?.id || '', filters || {}),
    queryFn: async () => {
      if (!organization?.id) throw new Error('No organization');

      tenantSupabase.setOrganization(organization.id);

      const { data, error } = await tenantSupabase.tenantQuery(
        'solicitudes',
        `
          id,
          numero_solicitud,
          cedula,
          cliente,
          asesor_name,
          afiliado,
          vitrina,
          banco,
          monto,
          producto,
          estado,
          fecha_solicitud,
          created_at
        `,
        filters
      );

      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
    staleTime: 1000 * 60 * 2, // 2 minutos cache
    refetchOnWindowFocus: false,
  });
};

export const useSolicitudesStats = () => {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: solicitudesQueryKeys.stats(organization?.id || ''),
    queryFn: async () => {
      if (!organization?.id) throw new Error('No organization');

      tenantSupabase.setOrganization(organization.id);
      const { data, error } = await tenantSupabase.getOrganizationStats();

      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos cache para stats
    refetchInterval: 1000 * 60 * 5, // Auto-refresh cada 5 minutos
  });
};

export const useSolicitudesSearch = (searchParams: {
  search_term?: string;
  estado_filter?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  limit?: number;
  offset?: number;
}) => {
  const { organization } = useOrganization();

  return useQuery({
    queryKey: solicitudesQueryKeys.search(organization?.id || '', searchParams),
    queryFn: async () => {
      if (!organization?.id) throw new Error('No organization');

      tenantSupabase.setOrganization(organization.id);
      const { data, error } = await tenantSupabase.searchSolicitudes(searchParams);

      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id && (!!searchParams.search_term || !!searchParams.estado_filter),
    staleTime: 1000 * 30, // 30 segundos para búsquedas
  });
};

export const useCreateSolicitud = () => {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSolicitud: any) => {
      if (!organization?.id) throw new Error('No organization');

      tenantSupabase.setOrganization(organization.id);

      const { data, error } = await tenantSupabase.tenantInsert('solicitudes', {
        ...newSolicitud,
        // organization_id se agrega automáticamente en tenantInsert
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar cache relacionado
      queryClient.invalidateQueries({
        queryKey: solicitudesQueryKeys.all(organization?.id || '')
      });
    },
  });
};

export const useUpdateSolicitud = () => {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; [key: string]: any }) => {
      if (!organization?.id) throw new Error('No organization');

      tenantSupabase.setOrganization(organization.id);

      const { data, error } = await tenantSupabase.tenantUpdate('solicitudes', id, updateData);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidar cache específico y general
      queryClient.invalidateQueries({
        queryKey: solicitudesQueryKeys.detail(organization?.id || '', variables.id)
      });
      queryClient.invalidateQueries({
        queryKey: solicitudesQueryKeys.lists(organization?.id || '')
      });
      queryClient.invalidateQueries({
        queryKey: solicitudesQueryKeys.stats(organization?.id || '')
      });
    },
  });
};
```

### **🖥️ Componentes Optimizados**

#### **Dashboard con Performance Crítico**
```typescript
// components/solicitudes/SolicitudesDashboardOptimized.tsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useSolicitudes, useSolicitudesStats, useSolicitudesSearch } from '@/hooks/useSolicitudes';
import { useDebounce } from '@/hooks/useDebounce';

export function SolicitudesDashboardOptimized() {
  const { organization, isLoading: orgLoading } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
    asesor_id: '',
  });

  // Debounce search para reducir llamadas a API
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Stats con cache optimizado
  const { data: stats, isLoading: statsLoading } = useSolicitudesStats();

  // Búsqueda optimizada con full-text
  const { data: searchResults, isLoading: searchLoading } = useSolicitudesSearch({
    search_term: debouncedSearchTerm,
    estado_filter: filters.estado,
    fecha_desde: filters.fecha_desde,
    fecha_hasta: filters.fecha_hasta,
    limit: 50,
    offset: 0
  });

  // Lista principal con filtros
  const { data: solicitudes, isLoading: solicitudesLoading } = useSolicitudes(
    // Solo usar filtros si no hay búsqueda activa
    !debouncedSearchTerm ? filters : undefined
  );

  // Determinar qué datos mostrar
  const displayData = useMemo(() => {
    if (debouncedSearchTerm && searchResults) {
      return searchResults;
    }
    return solicitudes || [];
  }, [debouncedSearchTerm, searchResults, solicitudes]);

  // Callbacks optimizados
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Loading states
  if (orgLoading) {
    return <div className="flex items-center justify-center p-8">Cargando organización...</div>;
  }

  if (!organization) {
    return <div className="flex items-center justify-center p-8">No se encontró organización</div>;
  }

  const isLoading = statsLoading || solicitudesLoading || searchLoading;

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header con información de organización */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {organization.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Plan: {organization.plan_type} | Máx. solicitudes: {organization.max_solicitudes}
        </p>
      </div>

      {/* Búsqueda optimizada */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar solicitudes..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats && (
          <>
            <div className="bg-card rounded-xl p-6 border border-border">
              <p className="text-sm text-muted-foreground font-medium">Total</p>
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
              <p className="text-sm text-muted-foreground font-medium">En Viabilidad</p>
              <p className="text-3xl font-bold text-foreground">{stats.viabilidad}</p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
              <p className="text-sm text-muted-foreground font-medium">Pre-Aprobado</p>
              <p className="text-3xl font-bold text-foreground">{stats.pre_aprobado}</p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border">
              <p className="text-sm text-muted-foreground font-medium">Aprobado</p>
              <p className="text-3xl font-bold text-foreground">{stats.aprobado}</p>
            </div>
          </>
        )}
      </div>

      {/* Tabla optimizada con virtualización para grandes datasets */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Cargando...</div>
        ) : (
          <SolicitudesTableVirtualized
            data={displayData}
            organization={organization}
          />
        )}
      </div>
    </div>
  );
}
```

### **🔐 Middleware de Tenant Validation**

#### **Next.js Middleware Optimizado**
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Verificar autenticación
  const { data: { session } } = await supabase.auth.getSession();

  // Rutas que requieren autenticación
  const protectedPaths = ['/home', '/solicitudes', '/settings'];
  const isProtectedPath = protectedPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }

  // Para rutas protegidas, verificar tenant
  if (session && isProtectedPath) {
    try {
      // Verificar que el usuario tiene organización activa
      const { data: account, error } = await supabase
        .from('accounts')
        .select('organization_id, is_active')
        .eq('id', session.user.id)
        .eq('is_active', true)
        .single();

      if (error || !account?.organization_id) {
        // Redirigir a setup de organización
        return NextResponse.redirect(new URL('/setup/organization', req.url));
      }

      // Agregar organization_id como header para uso en componentes
      const response = NextResponse.next();
      response.headers.set('x-organization-id', account.organization_id);
      return response;

    } catch (error) {
      console.error('Middleware tenant validation error:', error);
      return NextResponse.redirect(new URL('/auth/sign-in', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
```

### **📱 Responsive Performance Optimization**

#### **Virtual List para Grandes Datasets**
```typescript
// components/solicitudes/SolicitudesTableVirtualized.tsx
import { FixedSizeList as List } from 'react-window';
import { useMemo } from 'react';

interface SolicitudesTableVirtualizedProps {
  data: any[];
  organization: any;
}

export function SolicitudesTableVirtualized({ data, organization }: SolicitudesTableVirtualizedProps) {
  const itemSize = 60; // Altura de cada fila
  const containerHeight = 600; // Altura del contenedor

  const Row = ({ index, style }: { index: number; style: any }) => {
    const solicitud = data[index];

    return (
      <div style={style} className="flex items-center px-6 py-3 border-b border-border hover:bg-muted/30">
        <div className="w-32 text-sm font-medium">{solicitud.numero_solicitud}</div>
        <div className="w-40 text-sm">{solicitud.cliente}</div>
        <div className="w-32 text-sm">{solicitud.asesor_name}</div>
        <div className="w-24 text-sm font-semibold">{solicitud.monto}</div>
        <div className="w-32">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoStyles(solicitud.estado)}`}>
            {solicitud.estado}
          </span>
        </div>
        <div className="flex-1 text-sm text-muted-foreground">{solicitud.fecha_solicitud}</div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center px-6 py-4 bg-muted/30 border-b border-border">
        <div className="w-32 text-xs font-semibold text-muted-foreground uppercase">ID</div>
        <div className="w-40 text-xs font-semibold text-muted-foreground uppercase">Cliente</div>
        <div className="w-32 text-xs font-semibold text-muted-foreground uppercase">Asesor</div>
        <div className="w-24 text-xs font-semibold text-muted-foreground uppercase">Monto</div>
        <div className="w-32 text-xs font-semibold text-muted-foreground uppercase">Estado</div>
        <div className="flex-1 text-xs font-semibold text-muted-foreground uppercase">Fecha</div>
      </div>

      {/* Virtual List */}
      <List
        height={containerHeight}
        itemCount={data.length}
        itemSize={itemSize}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}

function getEstadoStyles(estado: string) {
  const styles = {
    'viabilidad': 'bg-yellow-100 text-yellow-800',
    'viable': 'bg-green-100 text-green-800',
    'pre_aprobado': 'bg-blue-100 text-blue-800',
    'aprobado': 'bg-green-100 text-green-800',
    'negado': 'bg-red-100 text-red-800',
  };
  return styles[estado as keyof typeof styles] || 'bg-gray-100 text-gray-800';
}
```

---

## 🚀 OPTIMIZACIONES DE PERFORMANCE

### **⚡ Memoization y Caching**

```typescript
// utils/cache.ts
import { LRUCache } from 'lru-cache';

// Cache LRU para datos frequentes
const dataCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutos
});

export const getCachedData = (key: string) => dataCache.get(key);
export const setCachedData = (key: string, data: any) => dataCache.set(key, data);

// Debounce hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### **🔧 Setup Inicial**
- [ ] Implementar OrganizationContext
- [ ] Configurar TenantAwareSupabaseClient
- [ ] Actualizar todas las queries para incluir organization_id
- [ ] Implementar middleware de tenant validation
- [ ] Configurar React Query con keys multi-tenant

### **🎨 Componentes**
- [ ] Actualizar SolicitudesDashboard para multi-tenancy
- [ ] Implementar virtual scrolling para tablas grandes
- [ ] Optimizar formularios con debounce
- [ ] Agregar loading states optimizados
- [ ] Implementar error boundaries por tenant

### **⚡ Performance**
- [ ] Configurar cache de React Query (5 min para stats, 2 min para listas)
- [ ] Implementar debounce en búsquedas (300ms)
- [ ] Usar memoization en componentes pesados
- [ ] Optimizar re-renders con useCallback
- [ ] Configurar lazy loading para módulos

### **🔒 Seguridad**
- [ ] Validar tenant en cada operación crítica
- [ ] Implementar rate limiting en cliente
- [ ] Sanitizar inputs antes de enviar
- [ ] Logs de auditoría para acciones sensibles
- [ ] Validation cross-tenant en formularios

---

**CRÍTICO**: Todas las operaciones DEBEN incluir `organization_id` y usar los hooks optimizados para garantizar performance de +1000 TPS y complete tenant isolation.