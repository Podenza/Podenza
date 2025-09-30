'use client';

import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  Clock,
  CheckCircle,
  Bell,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Upload,
  Calendar,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@kit/ui/shadcn/dialog';
import { Button } from '@kit/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/shadcn/card';
import { Badge } from '@kit/ui/shadcn/badge';
import { Progress } from '@kit/ui/shadcn/progress';
import { Input } from '@kit/ui/shadcn/input';
import { Label } from '@kit/ui/shadcn/label';
import { Textarea } from '@kit/ui/shadcn/textarea';
import { RadioGroup, RadioGroupItem } from '@kit/ui/shadcn/radio-group';
import { Checkbox } from '@kit/ui/shadcn/checkbox';
import { Separator } from '@kit/ui/shadcn/separator';

interface SolicitudWorkbenchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solicitud: {
    id: string;
    cedula: string;
    cliente: string;
    asesor: string;
    banco: string;
    monto: string;
    estado: string;
    fecha: string;
    producto: string;
  } | null;
}

const PASOS_PROCESO = [
  { id: 1, label: 'Lead', completado: true },
  { id: 2, label: 'Registro', completado: true },
  { id: 3, label: 'Perfilamiento', completado: true },
  { id: 4, label: 'Firma AUCO', completado: true },
  { id: 5, label: 'Gestión Bancaria', completado: false, activo: true },
  { id: 6, label: 'Peritaje', completado: false },
  { id: 7, label: 'Documentos', completado: false },
  { id: 8, label: 'Desembolso', completado: false },
];

const DOCUMENTOS = [
  { nombre: 'Cédula Frente', tamaño: '2.3 MB', tipo: 'PDF', subido: true },
  { nombre: 'Extracto Bancario 1', tamaño: '1.8 MB', tipo: 'PDF', subido: true },
  { nombre: 'Cert. Laboral', tamaño: '890 KB', tipo: 'PDF', subido: true },
  { nombre: 'Extracto Bancario 2', tamaño: '0 MB', tipo: '', subido: false },
];

const BANCOS_ESTADO = [
  { nombre: 'Davivienda', estado: 'success', descripcion: 'En estudio', hora: '10:24' },
  { nombre: 'Occidente', estado: 'error', descripcion: 'Devuelto', detalle: 'Doc faltante' },
];

const ACTIVIDAD_RECIENTE = [
  { hora: '12:05', actividad: 'Banco Occidente devolvió solicitud' },
  { hora: '10:24', actividad: 'Enviado a Davivienda' },
  { hora: '09:15', actividad: 'Firma AUCO completada' },
  { hora: 'Ayer', actividad: 'Perfilamiento completado' },
];

export function SolicitudWorkbenchModal({ open, onOpenChange, solicitud }: SolicitudWorkbenchModalProps) {
  const [envioTipo, setEnvioTipo] = useState('automatica');
  const [bancosSeleccionados, setBancosSeleccionados] = useState(['davivienda', 'occidente']);
  const [documentosRequeridos, setDocumentosRequeridos] = useState(['formulario', 'extracto1', 'certificacion']);

  if (!solicitud) return null;

  const progresoActual = 62;
  const pasoActual = 5;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header Global */}
          <div className="bg-card border-b border-border p-4 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="font-bold text-sm text-primary-foreground">P</span>
                </div>
                <span className="font-bold text-lg">PODENZA</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Solicitudes</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground font-semibold">{solicitud.cliente}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative p-2 cursor-pointer">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-semibold rounded-full flex items-center justify-center">
                  3
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted cursor-pointer hover:bg-muted/80">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-semibold">
                  VR
                </div>
                <span className="text-sm font-medium">Valentina</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-6">
              {/* Case Header */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Cliente</div>
                      <div className="font-semibold text-foreground">{solicitud.cliente}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Cédula</div>
                      <div className="font-semibold text-foreground">{solicitud.cedula}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Valor Crédito</div>
                      <div className="font-semibold text-foreground">{solicitud.monto}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Estado</div>
                      <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                        <div className="w-2 h-2 rounded-full bg-accent mr-2" />
                        En Gestión Bancaria
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Bancos</div>
                      <div className="font-semibold text-foreground">Davivienda, Occidente</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">SLA Restante</div>
                      <div className="font-semibold text-accent flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        22h 15m
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="bg-muted rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-foreground">Progreso del Proceso</h3>
                      <span className="text-sm text-muted-foreground">
                        Paso {pasoActual} de {PASOS_PROCESO.length} • {progresoActual}% completado
                      </span>
                    </div>
                    <Progress value={progresoActual} className="mb-4 h-2" />

                    {/* Steps Horizontales */}
                    <div className="flex justify-between items-center relative">
                      {PASOS_PROCESO.map((paso, index) => (
                        <div key={paso.id} className="flex flex-col items-center relative flex-1">
                          {index < PASOS_PROCESO.length - 1 && (
                            <div className={`absolute top-4 left-1/2 right-0 h-0.5 ${
                              paso.completado ? 'bg-primary' : 'bg-border'
                            } transform translate-x-1/2`} />
                          )}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold relative z-10 ${
                            paso.completado
                              ? 'bg-primary text-primary-foreground'
                              : paso.activo
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-card border-2 border-border text-muted-foreground'
                          }`}>
                            {paso.completado ? <CheckCircle className="w-4 h-4" /> : paso.id}
                          </div>
                          <span className={`text-xs mt-2 text-center max-w-20 ${
                            paso.activo ? 'text-foreground font-semibold' : 'text-muted-foreground'
                          }`}>
                            {paso.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Area */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Envío a Bancos</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Selecciona los bancos y adjunta la documentación requerida para continuar con el proceso de aprobación.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Alert Banner */}
                      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <span className="font-semibold">Banco Occidente</span> devolvió la solicitud: "Extracto bancario ilegible". Revisa y reenvía el documento.
                        </div>
                      </div>

                      {/* Tipo de Envío */}
                      <div>
                        <h3 className="font-semibold mb-3">Tipo de Envío</h3>
                        <RadioGroup value={envioTipo} onValueChange={setEnvioTipo} className="flex gap-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="automatica" id="automatica" />
                            <Label htmlFor="automatica">Automática por política</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="manual" id="manual" />
                            <Label htmlFor="manual">Selección manual</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Bancos Seleccionados */}
                      <div>
                        <h3 className="font-semibold mb-3">Bancos Seleccionados</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {['Davivienda', 'Occidente', 'Bancolombia', 'BBVA'].map((banco) => (
                            <div key={banco} className="flex items-center space-x-2">
                              <Checkbox
                                id={banco.toLowerCase()}
                                checked={bancosSeleccionados.includes(banco.toLowerCase())}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setBancosSeleccionados([...bancosSeleccionados, banco.toLowerCase()]);
                                  } else {
                                    setBancosSeleccionados(bancosSeleccionados.filter(b => b !== banco.toLowerCase()));
                                  }
                                }}
                              />
                              <Label htmlFor={banco.toLowerCase()}>{banco}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Documentos Requeridos */}
                      <div>
                        <h3 className="font-semibold mb-3">Documentos Requeridos</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'formulario', label: 'Formulario firmado' },
                            { id: 'extracto1', label: 'Extracto bancario 1' },
                            { id: 'extracto2', label: 'Extracto bancario 2' },
                            { id: 'certificacion', label: 'Certificación laboral' }
                          ].map((doc) => (
                            <div key={doc.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={doc.id}
                                checked={documentosRequeridos.includes(doc.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setDocumentosRequeridos([...documentosRequeridos, doc.id]);
                                  } else {
                                    setDocumentosRequeridos(documentosRequeridos.filter(d => d !== doc.id));
                                  }
                                }}
                              />
                              <Label htmlFor={doc.id}>{doc.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Upload Zone */}
                      <div>
                        <h3 className="font-semibold mb-3">Subir Extracto Bancario 2</h3>
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-medium text-foreground mb-1">Arrastra el archivo aquí o haz clic para seleccionar</p>
                          <p className="text-xs text-muted-foreground">PDF, JPG o PNG • Máx. 10MB</p>
                        </div>
                      </div>

                      {/* Elegibilidad */}
                      <div>
                        <h3 className="font-semibold mb-3">Elegibilidad Estimada</h3>
                        <div className="bg-muted rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Davivienda</span>
                            <span className="text-sm font-semibold text-green-600">95% score • Cobertura 80%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Occidente</span>
                            <span className="text-sm font-semibold text-accent">70% score • Cobertura 75%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button variant="outline" className="gap-2">
                      ← Volver
                    </Button>
                    <Button variant="outline">
                      Guardar Borrador
                    </Button>
                    <Button className="btn-podenza-primary gap-2 flex-1">
                      Enviar a 2 Bancos →
                    </Button>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Resumen del Caso */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Resumen del Caso</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {[
                        { label: 'Valor inmueble:', value: '$350.000.000' },
                        { label: 'Valor crédito:', value: solicitud.monto },
                        { label: '% Financiación:', value: '80%' },
                        { label: 'Plazo:', value: '15 años' },
                        { label: 'Teléfono:', value: '+57 315 123 4567' },
                        { label: 'Email:', value: 'freddy@email.com' },
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Estado por Banco */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Estado por Banco</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {BANCOS_ESTADO.map((banco, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <div className={`w-2 h-2 rounded-full ${
                            banco.estado === 'success' ? 'bg-green-500' :
                            banco.estado === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{banco.nombre}</div>
                            <div className="text-xs text-muted-foreground">
                              {banco.descripcion} {banco.hora && `• Enviado ${banco.hora}`}
                              {banco.detalle && `• ${banco.detalle}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Actividad Reciente */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {ACTIVIDAD_RECIENTE.map((actividad, index) => (
                        <div key={index} className="flex gap-3 text-sm">
                          <span className="text-muted-foreground min-w-12 text-xs">{actividad.hora}</span>
                          <span className="text-foreground">{actividad.actividad}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Acciones Rápidas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Acciones Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { icon: MessageSquare, label: 'Abrir chat WhatsApp' },
                        { icon: Phone, label: 'Llamar cliente' },
                        { icon: Mail, label: 'Enviar email' },
                        { icon: FileText, label: 'Agregar nota' },
                      ].map((accion, index) => (
                        <Button key={index} variant="ghost" className="w-full justify-start gap-2 h-auto p-3 text-sm">
                          <accion.icon className="w-4 h-4" />
                          {accion.label}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Documentos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Documentos Adjuntos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {DOCUMENTOS.map((doc, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 border border-border rounded-lg">
                          <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{doc.nombre}</div>
                            <div className="text-xs text-muted-foreground">
                              {doc.subido ? `${doc.tamaño} • ${doc.tipo}` : 'No subido'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}