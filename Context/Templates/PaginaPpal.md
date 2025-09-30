import React, { useState } from 'react';
import { Search, Eye, Edit, Trash2, Copy, X, ChevronRight, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, FileText, Calendar, Filter } from 'lucide-react';

// Estados de las solicitudes con colores del branding
const ESTADOS = [
  { id: 'viabilidad', label: 'En viabilidad', color: '#FF931E', icon: Clock },
  { id: 'viable', label: 'Viable', color: '#AFDB12', icon: CheckCircle },
  { id: 'no_viable', label: 'No viable', color: '#DC2626', icon: XCircle },
  { id: 'pre_aprobado', label: 'Pre-Aprobado', color: '#E7FF8C', icon: CheckCircle },
  { id: 'en_estudio', label: 'En estudio', color: '#FF931E', icon: FileText },
  { id: 'devuelto', label: 'Devuelto', color: '#FF931E', icon: AlertCircle },
  { id: 'negado', label: 'Negado', color: '#DC2626', icon: XCircle },
  { id: 'aprobado', label: 'Aprobado', color: '#AFDB12', icon: CheckCircle },
  { id: 'desistido', label: 'Desistido', color: '#6B7280', icon: XCircle },
  { id: 'aplazado', label: 'Aplazado', color: '#6B7280', icon: Clock }
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
const calcularEstadisticas = (solicitudes) => {
  const porEstado = ESTADOS.reduce((acc, estado) => {
    acc[estado.id] = solicitudes.filter(s => s.estado === estado.id).length;
    return acc;
  }, {});

  return {
    total: solicitudes.length,
    viabilidad: porEstado.viabilidad || 0,
    pre_aprobado: porEstado.pre_aprobado || 0,
    aprobado: porEstado.aprobado || 0,
    porEstado
  };
};

export default function PodenzaDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
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

  const getEstadoInfo = (estadoId) => {
    return ESTADOS.find(e => e.id === estadoId) || ESTADOS[0];
  };

  const handleCambioEstado = (nuevoEstado) => {
    console.log(`Cambiando estado de ${solicitudSeleccionada.id} a ${nuevoEstado}`);
    setSolicitudSeleccionada(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2C3E2B]" style={{ fontFamily: "'Circular Std', sans-serif" }}>
              Mis Solicitudes
            </h1>
            <p className="text-sm text-[#6B7280] mt-1" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
              Gestiona y monitorea todas tus solicitudes de crédito
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por ID, cédula, cliente, asesor, afiliado, vitrina, banco, monto o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#E7FF8C] focus:border-transparent text-[#2C3E2B] bg-white"
                style={{ fontFamily: "'Sofia Pro', sans-serif" }}
              />
            </div>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="px-4 py-3 rounded-xl border border-[#E5E5E5] bg-white hover:bg-[#FAFAFA] transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5 text-[#6B7280]" />
              <span className="text-sm font-medium text-[#2C3E2B]" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                Filtros
              </span>
            </button>
          </div>

          {mostrarFiltros && (
            <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-[#6B7280]" />
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#6B7280] mb-1.5" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                      Desde
                    </label>
                    <input
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#E7FF8C] focus:border-transparent text-sm text-[#2C3E2B]"
                      style={{ fontFamily: "'Sofia Pro', sans-serif" }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#6B7280] mb-1.5" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                      Hasta
                    </label>
                    <input
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#E7FF8C] focus:border-transparent text-sm text-[#2C3E2B]"
                      style={{ fontFamily: "'Sofia Pro', sans-serif" }}
                    />
                  </div>
                  {(fechaDesde || fechaHasta) && (
                    <button
                      onClick={() => {
                        setFechaDesde('');
                        setFechaHasta('');
                      }}
                      className="mt-6 px-4 py-2 rounded-lg text-sm font-medium text-[#FF931E] hover:bg-[#FFF4ED] transition-colors"
                      style={{ fontFamily: "'Sofia Pro', sans-serif" }}
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
          <div className="bg-white rounded-xl p-5 border border-[#E5E5E5]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6B7280] text-sm" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>Total</span>
              <FileText className="w-4 h-4 text-[#6B7280]" />
            </div>
            <p className="text-3xl font-bold text-[#2C3E2B]" style={{ fontFamily: "'Circular Std', sans-serif" }}>
              {estadisticas.total}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#E5E5E5]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6B7280] text-sm" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>En Viabilidad</span>
              <div className="w-8 h-8 rounded-lg bg-[#E7FF8C]/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#2C3E2B]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#2C3E2B]" style={{ fontFamily: "'Circular Std', sans-serif" }}>
              {estadisticas.viabilidad}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#E5E5E5]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6B7280] text-sm" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>Pre-Aprobado</span>
              <div className="w-8 h-8 rounded-lg bg-[#E7FF8C]/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#2C3E2B]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#2C3E2B]" style={{ fontFamily: "'Circular Std', sans-serif" }}>
              {estadisticas.pre_aprobado}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#E5E5E5]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#6B7280] text-sm" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>Aprobado</span>
              <div className="w-8 h-8 rounded-lg bg-[#FF931E]/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-[#FF931E]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#2C3E2B]" style={{ fontFamily: "'Circular Std', sans-serif" }}>
              {estadisticas.aprobado}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Cédula
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Asesor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Afiliado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Vitrina
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Banco
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Monto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {solicitudesFiltradas.map((solicitud) => {
                  const estadoInfo = getEstadoInfo(solicitud.estado);
                  const IconoEstado = estadoInfo.icon;

                  return (
                    <tr key={solicitud.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-[#2C3E2B]" style={{ fontFamily: "'Circular Std', sans-serif" }}>
                          {solicitud.cedula}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-[#2C3E2B]" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                          {solicitud.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#2C3E2B]" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                          {solicitud.cliente}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#6B7280]" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                          {solicitud.asesor}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${solicitud.afiliado === 'Sí' ? 'text-[#AFDB12]' : 'text-[#6B7280]'}`} style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                          {solicitud.afiliado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#6B7280]" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                          {solicitud.vitrina}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#6B7280]" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                          {solicitud.banco}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-[#2C3E2B]" style={{ fontFamily: "'Circular Std', sans-serif" }}>
                          {solicitud.monto}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${estadoInfo.color}15`,
                            color: estadoInfo.color,
                            fontFamily: "'Sofia Pro', sans-serif"
                          }}
                        >
                          <IconoEstado className="w-3.5 h-3.5" />
                          {estadoInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#6B7280]" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                          {solicitud.fecha}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSolicitudSeleccionada(solicitud)}
                            className="p-2 rounded-lg hover:bg-[#E7FF8C]/20 transition-colors group"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4 text-[#6B7280] group-hover:text-[#2C3E2B]" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-[#FFF4ED] transition-colors group"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-[#6B7280] group-hover:text-[#FF931E]" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-[#E7FF8C]/20 transition-colors group"
                            title="Clonar"
                          >
                            <Copy className="w-4 h-4 text-[#6B7280] group-hover:text-[#2C3E2B]" />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-[#6B7280] group-hover:text-red-500" />
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
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-[#2C3E2B]" style={{ fontFamily: "'Circular Std', sans-serif" }}>
                  {solicitudSeleccionada.id}
                </h2>
                <p className="text-sm text-[#6B7280] mt-1" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                  {solicitudSeleccionada.cliente}
                </p>
              </div>
              <button
                onClick={() => setSolicitudSeleccionada(null)}
                className="p-2 rounded-lg hover:bg-[#FAFAFA] transition-colors"
              >
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Cédula
                  </label>
                  <p className="text-base text-[#2C3E2B] mt-1 font-bold" style={{ fontFamily: "'Circular Std', sans-serif" }}>
                    {solicitudSeleccionada.cedula}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Producto
                  </label>
                  <p className="text-base text-[#2C3E2B] mt-1 font-medium" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    {solicitudSeleccionada.producto}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Asesor
                  </label>
                  <p className="text-base text-[#2C3E2B] mt-1 font-medium" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    {solicitudSeleccionada.asesor}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Banco
                  </label>
                  <p className="text-base text-[#2C3E2B] mt-1 font-medium" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    {solicitudSeleccionada.banco}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Vitrina
                  </label>
                  <p className="text-base text-[#2C3E2B] mt-1 font-medium" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    {solicitudSeleccionada.vitrina}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Afiliado
                  </label>
                  <p className="text-base text-[#2C3E2B] mt-1 font-medium" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    {solicitudSeleccionada.afiliado}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Monto Solicitado
                  </label>
                  <p className="text-base text-[#2C3E2B] mt-1 font-bold" style={{ fontFamily: "'Circular Std', sans-serif" }}>
                    {solicitudSeleccionada.monto}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    Fecha
                  </label>
                  <p className="text-base text-[#2C3E2B] mt-1 font-medium" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                    {solicitudSeleccionada.fecha}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#E5E5E5] pt-6">
                <h3 className="text-sm font-semibold text-[#2C3E2B] mb-4 uppercase tracking-wider" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
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
                            ? 'border-[#E7FF8C] bg-[#E7FF8C]/10 cursor-default' 
                            : 'border-[#E5E5E5] hover:border-[#E7FF8C] hover:bg-[#FAFAFA] cursor-pointer'
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
                          <p className="text-sm font-medium text-[#2C3E2B]" style={{ fontFamily: "'Sofia Pro', sans-serif" }}>
                            {estado.label}
                          </p>
                        </div>
                        {!esEstadoActual && (
                          <ChevronRight className="w-4 h-4 text-[#6B7280]" />
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