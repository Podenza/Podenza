'use client';

import React, { useState } from 'react';
import { Search, Eye, Edit, Trash2, Copy, X, ChevronRight, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, FileText, Calendar, Filter } from 'lucide-react';

// Estados de las solicitudes con colores del branding existente
const ESTADOS = [
  { id: 'viabilidad', label: 'En viabilidad', color: 'hsl(var(--accent))', icon: Clock },
  { id: 'viable', label: 'Viable', color: 'hsl(var(--chart-3))', icon: CheckCircle },
  { id: 'no_viable', label: 'No viable', color: 'hsl(var(--destructive))', icon: XCircle },
  { id: 'pre_aprobado', label: 'Pre-Aprobado', color: 'hsl(var(--primary))', icon: CheckCircle },
  { id: 'en_estudio', label: 'En estudio', color: 'hsl(var(--accent))', icon: FileText },
  { id: 'devuelto', label: 'Devuelto', color: 'hsl(var(--accent))', icon: AlertCircle },
  { id: 'negado', label: 'Negado', color: 'hsl(var(--destructive))', icon: XCircle },
  { id: 'aprobado', label: 'Aprobado', color: 'hsl(var(--chart-3))', icon: CheckCircle },
  { id: 'desistido', label: 'Desistido', color: 'hsl(var(--muted-foreground))', icon: XCircle },
  { id: 'aplazado', label: 'Aplazado', color: 'hsl(var(--muted-foreground))', icon: Clock }
];

// Datos de ejemplo con campos adicionales
const solicitudesEjemplo = [
  { id: 'SOL-2024-001', cedula: '1234567890', cliente: 'Empresa ABC SAS', asesor: 'Carlos Gómez', afiliado: 'Sí', vitrina: 'Vitrina Norte', banco: 'Bancolombia', monto: '$50,000,000', estado: 'viabilidad', fecha: '2024-01-15', producto: 'Crédito Empresarial' },
  { id: 'SOL-2024-002', cedula: '9876543210', cliente: 'Juan Pérez', asesor: 'Ana Rodríguez', afiliado: 'No', vitrina: 'Vitrina Sur', banco: 'Davivienda', monto: '$15,000,000', estado: 'pre_aprobado', fecha: '2024-01-14', producto: 'Crédito Personal' },
  { id: 'SOL-2024-003', cedula: '5551234567', cliente: 'María González', asesor: 'Luis Martínez', afiliado: 'Sí', vitrina: 'Vitrina Centro', banco: 'BBVA', monto: '$25,000,000', estado: 'en_estudio', fecha: '2024-01-13', producto: 'Crédito Vehículo' },
  { id: 'SOL-2024-004', cedula: '7778889990', cliente: 'Tech Solutions Ltd', asesor: 'Carlos Gómez', afiliado: 'Sí', vitrina: 'Vitrina Este', banco: 'Banco de Bogotá', monto: '$100,000,000', estado: 'viable', fecha: '2024-01-12', producto: 'Crédito Empresarial' },
  { id: 'SOL-2024-005', cedula: '3334445556', cliente: 'Carlos Ramírez', asesor: 'Ana Rodríguez', afiliado: 'No', vitrina: 'Vitrina Oeste', banco: 'Bancolombia', monto: '$8,000,000', estado: 'aprobado', fecha: '2024-01-11', producto: 'Crédito Personal' },
  { id: 'SOL-2024-006', cedula: '6667778889', cliente: 'Constructora XYZ', asesor: 'Luis Martínez', afiliado: 'Sí', vitrina: 'Vitrina Norte', banco: 'Davivienda', monto: '$75,000,000', estado: 'devuelto', fecha: '2024-01-10', producto: 'Crédito Construcción' },
  { id: 'SOL-2024-007', cedula: '2223334445', cliente: 'Ana Martínez', asesor: 'Carlos Gómez', afiliado: 'No', vitrina: 'Vitrina Sur', banco: 'BBVA', monto: '$12,000,000', estado: 'viabilidad', fecha: '2024-01-09', producto: 'Crédito Personal' },
  { id: 'SOL-2024-008', cedula: '8889990001', cliente: 'Inversiones ABC', asesor: 'Ana Rodríguez', afiliado: 'Sí', vitrina: 'Vitrina Centro', banco: 'Banco de Bogotá', monto: '$200,000,000', estado: 'no_viable', fecha: '2024-01-08', producto: 'Crédito Empresarial' }
];

// Calcular estadísticas
const calcularEstadisticas = (solicitudes: typeof solicitudesEjemplo) => {
  const porEstado = ESTADOS.reduce((acc, estado) => {
    acc[estado.id] = solicitudes.filter(s => s.estado === estado.id).length;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: solicitudes.length,
    viabilidad: porEstado.viabilidad || 0,
    pre_aprobado: porEstado.pre_aprobado || 0,
    aprobado: porEstado.aprobado || 0,
    porEstado
  };
};

export function SolicitudesDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<typeof solicitudesEjemplo[0] | null>(null);
  const [solicitudes] = useState(solicitudesEjemplo);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const estadisticas = calcularEstadisticas(solicitudes);

  // Filtrar solicitudes por búsqueda y fechas
  const solicitudesFiltradas = solicitudes.filter(sol => {
    const cumpleBusqueda = !searchTerm ||
      sol.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.cedula.includes(searchTerm) ||
      sol.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.asesor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.afiliado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.vitrina.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.banco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.monto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sol.producto.toLowerCase().includes(searchTerm.toLowerCase());

    const fechaSolicitud = new Date(sol.fecha);
    const cumpleFechaDesde = !fechaDesde || fechaSolicitud >= new Date(fechaDesde);
    const cumpleFechaHasta = !fechaHasta || fechaSolicitud <= new Date(fechaHasta);

    return cumpleBusqueda && cumpleFechaDesde && cumpleFechaHasta;
  });

  const getEstadoInfo = (estadoId: string) => {
    return ESTADOS.find(e => e.id === estadoId) || ESTADOS[0];
  };

  const handleCambioEstado = (nuevoEstado: string) => {
    console.log(`Cambiando estado de ${solicitudSeleccionada?.id} a ${nuevoEstado}`);
    setSolicitudSeleccionada(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por ID, cédula, cliente, asesor, afiliado, vitrina, banco, monto o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-card"
              />
            </div>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent/5 transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Filtros
              </span>
            </button>
          </div>

          {mostrarFiltros && (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Desde
                    </label>
                    <input
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm text-foreground bg-background"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Hasta
                    </label>
                    <input
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm text-foreground bg-background"
                    />
                  </div>
                  {(fechaDesde || fechaHasta) && (
                    <button
                      onClick={() => {
                        setFechaDesde('');
                        setFechaHasta('');
                      }}
                      className="mt-6 px-4 py-2 rounded-lg text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Total</span>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {estadisticas.total}
            </p>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">En Viabilidad</span>
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {estadisticas.viabilidad}
            </p>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Pre-Aprobado</span>
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {estadisticas.pre_aprobado}
            </p>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Aprobado</span>
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-accent" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {estadisticas.aprobado}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cédula
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Asesor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Afiliado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Vitrina
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Banco
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {solicitudesFiltradas.map((solicitud) => {
                  const estadoInfo = getEstadoInfo(solicitud.estado);
                  const IconoEstado = estadoInfo.icon;

                  return (
                    <tr key={solicitud.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-foreground">
                          {solicitud.cedula}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-foreground">
                          {solicitud.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-foreground">
                          {solicitud.cliente}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-muted-foreground">
                          {solicitud.asesor}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${solicitud.afiliado === 'Sí' ? 'text-chart-3' : 'text-muted-foreground'}`}>
                          {solicitud.afiliado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-muted-foreground">
                          {solicitud.vitrina}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-muted-foreground">
                          {solicitud.banco}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-foreground">
                          {solicitud.monto}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${estadoInfo.color}15`,
                            color: estadoInfo.color,
                          }}
                        >
                          <IconoEstado className="w-3.5 h-3.5" />
                          {estadoInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-muted-foreground">
                          {solicitud.fecha}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSolicitudSeleccionada(solicitud)}
                            className="p-2 rounded-lg hover:bg-primary/10 transition-colors group"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-accent/10 transition-colors group"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-primary/10 transition-colors group"
                            title="Clonar"
                          >
                            <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors group"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {solicitudSeleccionada.id}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {solicitudSeleccionada.cliente}
                </p>
              </div>
              <button
                onClick={() => setSolicitudSeleccionada(null)}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cédula
                  </label>
                  <p className="text-base text-foreground mt-1 font-bold">
                    {solicitudSeleccionada.cedula}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Producto
                  </label>
                  <p className="text-base text-foreground mt-1 font-medium">
                    {solicitudSeleccionada.producto}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Asesor
                  </label>
                  <p className="text-base text-foreground mt-1 font-medium">
                    {solicitudSeleccionada.asesor}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Banco
                  </label>
                  <p className="text-base text-foreground mt-1 font-medium">
                    {solicitudSeleccionada.banco}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Vitrina
                  </label>
                  <p className="text-base text-foreground mt-1 font-medium">
                    {solicitudSeleccionada.vitrina}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Afiliado
                  </label>
                  <p className="text-base text-foreground mt-1 font-medium">
                    {solicitudSeleccionada.afiliado}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Monto Solicitado
                  </label>
                  <p className="text-base text-foreground mt-1 font-bold">
                    {solicitudSeleccionada.monto}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Fecha
                  </label>
                  <p className="text-base text-foreground mt-1 font-medium">
                    {solicitudSeleccionada.fecha}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                  Acciones Rápidas
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {ESTADOS.map((estado) => {
                    const IconoEstado = estado.icon;
                    const esEstadoActual = estado.id === solicitudSeleccionada.estado;

                    return (
                      <button
                        key={estado.id}
                        onClick={() => !esEstadoActual && handleCambioEstado(estado.id)}
                        disabled={esEstadoActual}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                          ${esEstadoActual
                            ? 'border-primary bg-primary/10 cursor-default'
                            : 'border-border hover:border-primary hover:bg-muted/50 cursor-pointer'
                          }
                        `}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${estado.color}15` }}
                        >
                          <IconoEstado className="w-5 h-5" style={{ color: estado.color }} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-foreground">
                            {estado.label}
                          </p>
                        </div>
                        {!esEstadoActual && (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}