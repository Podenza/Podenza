<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PODENZA Workbench - Opción 1: Layout Horizontal</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Sofia Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #FAFAFA;
            color: #2C3E2B;
            line-height: 1.5;
        }
        
        /* Header Global */
        .global-header {
            background: #FFFFFF;
            border-bottom: 1px solid #E5E5E5;
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .logo-icon {
            width: 36px;
            height: 36px;
            background: #E7FF8C;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Circular Std', sans-serif;
            font-weight: bold;
            font-size: 18px;
            color: #2C3E2B;
        }
        
        .logo-text {
            font-family: 'Circular Std', sans-serif;
            font-weight: bold;
            font-size: 18px;
            letter-spacing: -0.02em;
        }
        
        .breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #6B7280;
            font-size: 14px;
        }
        
        .header-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .notification-badge {
            position: relative;
            padding: 8px;
            cursor: pointer;
        }
        
        .notification-badge::after {
            content: '3';
            position: absolute;
            top: 4px;
            right: 4px;
            background: #FF931E;
            color: white;
            font-size: 10px;
            font-weight: 600;
            padding: 2px 5px;
            border-radius: 10px;
        }
        
        .user-profile {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .user-profile:hover {
            background: #F3F4F6;
        }
        
        .avatar {
            width: 32px;
            height: 32px;
            background: #E7FF8C;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
        }
        
        /* Workbench Container */
        .workbench {
            max-width: 1600px;
            margin: 0 auto;
            padding: 24px;
        }
        
        /* Case Header Card */
        .case-header {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .case-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .info-label {
            font-size: 12px;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #2C3E2B;
        }
        
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
        }
        
        .status-badge.en-curso {
            background: #FFF4ED;
            color: #FF931E;
        }
        
        .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
        }
        
        .sla-warning {
            color: #FF931E;
            font-weight: 600;
        }
        
        /* Progress Bar Horizontal */
        .progress-section {
            background: #F9FAFB;
            border-radius: 10px;
            padding: 16px;
        }
        
        .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .progress-title {
            font-size: 14px;
            font-weight: 600;
            color: #2C3E2B;
        }
        
        .progress-stats {
            font-size: 13px;
            color: #6B7280;
        }
        
        .progress-bar {
            height: 8px;
            background: #E5E5E5;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 16px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #E7FF8C 0%, #AFDB12 100%);
            transition: width 0.3s ease;
        }
        
        /* Steps Horizontal */
        .steps-horizontal {
            display: flex;
            justify-content: space-between;
            position: relative;
        }
        
        .step-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            position: relative;
            flex: 1;
            cursor: pointer;
        }
        
        .step-item::before {
            content: '';
            position: absolute;
            top: 16px;
            left: 50%;
            right: -50%;
            height: 2px;
            background: #E5E5E5;
            z-index: 0;
        }
        
        .step-item:last-child::before {
            display: none;
        }
        
        .step-item.completed::before {
            background: #E7FF8C;
        }
        
        .step-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 13px;
            background: white;
            border: 2px solid #E5E5E5;
            position: relative;
            z-index: 1;
        }
        
        .step-item.completed .step-circle {
            background: #E7FF8C;
            border-color: #E7FF8C;
            color: #2C3E2B;
        }
        
        .step-item.active .step-circle {
            background: #FF931E;
            border-color: #FF931E;
            color: white;
        }
        
        .step-label {
            font-size: 12px;
            text-align: center;
            color: #6B7280;
            max-width: 100px;
        }
        
        .step-item.active .step-label {
            color: #2C3E2B;
            font-weight: 600;
        }
        
        /* Main Content Area */
        .content-grid {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: 20px;
        }
        
        /* Form Card */
        .form-card {
            background: white;
            border-radius: 12px;
            padding: 28px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .form-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
            font-family: 'Circular Std', sans-serif;
            letter-spacing: -0.02em;
        }
        
        .form-description {
            color: #6B7280;
            margin-bottom: 24px;
            font-size: 14px;
        }
        
        .banner-alert {
            background: #FFF4ED;
            border: 1px solid #FF931E;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 24px;
            display: flex;
            gap: 12px;
            font-size: 13px;
            color: #2C3E2B;
        }
        
        .form-section {
            margin-bottom: 28px;
        }
        
        .section-title {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #2C3E2B;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 16px;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        
        .form-group.full-width {
            grid-column: 1 / -1;
        }
        
        .form-label {
            font-size: 14px;
            font-weight: 500;
            color: #2C3E2B;
        }
        
        .required {
            color: #FF931E;
        }
        
        .form-input {
            padding: 12px 14px;
            border: 1px solid #E5E5E5;
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            transition: all 0.2s;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #E7FF8C;
            box-shadow: 0 0 0 3px rgba(231, 255, 140, 0.2);
        }
        
        .form-input.success {
            border-color: #10B981;
        }
        
        .form-input.error {
            border-color: #DC2626;
        }
        
        .form-hint {
            font-size: 12px;
            color: #6B7280;
        }
        
        .form-error {
            font-size: 12px;
            color: #DC2626;
        }
        
        .form-success {
            font-size: 12px;
            color: #10B981;
        }
        
        .radio-group {
            display: flex;
            gap: 20px;
        }
        
        .radio-item {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }
        
        .radio-item input {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        
        .upload-zone {
            border: 2px dashed #E5E5E5;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .upload-zone:hover {
            border-color: #E7FF8C;
            background: #FAFAFA;
        }
        
        .upload-icon {
            font-size: 32px;
            margin-bottom: 8px;
        }
        
        .upload-text {
            font-size: 14px;
            color: #2C3E2B;
            margin-bottom: 4px;
        }
        
        .upload-hint {
            font-size: 12px;
            color: #6B7280;
        }
        
        /* Action Buttons */
        .form-actions {
            display: flex;
            gap: 12px;
            padding-top: 24px;
            border-top: 1px solid #F3F4F6;
            margin-top: 28px;
        }
        
        .btn {
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            font-family: inherit;
        }
        
        .btn-primary {
            background: #FF931E;
            color: white;
            flex: 1;
        }
        
        .btn-primary:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        
        .btn-secondary {
            background: white;
            color: #6B7280;
            border: 1px solid #E5E5E5;
        }
        
        .btn-secondary:hover {
            background: #F9FAFB;
        }
        
        /* Sidebar */
        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        
        .sidebar-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .sidebar-title {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #2C3E2B;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 13px;
        }
        
        .summary-label {
            color: #6B7280;
        }
        
        .summary-value {
            font-weight: 600;
            color: #2C3E2B;
        }
        
        .timeline-item {
            display: flex;
            gap: 12px;
            margin-bottom: 14px;
            font-size: 13px;
        }
        
        .timeline-time {
            color: #6B7280;
            min-width: 40px;
        }
        
        .timeline-content {
            flex: 1;
            color: #2C3E2B;
        }
        
        .bank-status {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px;
            background: #F9FAFB;
            border-radius: 6px;
            margin-bottom: 8px;
        }
        
        .bank-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        
        .bank-status-dot.success {
            background: #10B981;
        }
        
        .bank-status-dot.warning {
            background: #FF931E;
        }
        
        .bank-status-dot.error {
            background: #DC2626;
        }
        
        .quick-action {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            background: #F9FAFB;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 8px;
        }
        
        .quick-action:hover {
            background: #F3F4F6;
        }
        
        .document-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px;
            border: 1px solid #E5E5E5;
            border-radius: 6px;
            margin-bottom: 8px;
            font-size: 13px;
        }
        
        .doc-icon {
            width: 32px;
            height: 32px;
            background: #E7FF8C;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Responsive */
        @media (max-width: 1024px) {
            .content-grid {
                grid-template-columns: 1fr;
            }
            
            .form-row {
                grid-template-columns: 1fr;
            }
            
            .steps-horizontal {
                overflow-x: auto;
                padding-bottom: 16px;
            }
        }
    </style>
</head>
<body>
    <!-- Global Header -->
    <header class="global-header">
        <div class="logo-section">
            <div class="logo">
                <div class="logo-icon">P</div>
                <div class="logo-text">PODENZA</div>
            </div>
            <div class="breadcrumb">
                <span>Solicitudes</span>
                <span>→</span>
                <span style="color: #2C3E2B; font-weight: 600;">Freddy Rincones</span>
            </div>
        </div>
        <div class="header-actions">
            <div class="notification-badge">🔔</div>
            <div class="user-profile">
                <div class="avatar">VR</div>
                <span style="font-weight: 500;">Valentina</span>
            </div>
        </div>
    </header>

    <!-- Workbench -->
    <div class="workbench">
        <!-- Case Header -->
        <div class="case-header">
            <div class="case-info-grid">
                <div class="info-item">
                    <div class="info-label">Cliente</div>
                    <div class="info-value">Freddy Rincones</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Cédula</div>
                    <div class="info-value">12.345.678</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Valor Crédito</div>
                    <div class="info-value">$280.000.000</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Estado</div>
                    <div>
                        <span class="status-badge en-curso">
                            <span class="status-indicator"></span>
                            En Gestión Bancaria
                        </span>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Bancos</div>
                    <div class="info-value">Davivienda, Occidente</div>
                </div>
                <div class="info-item">
                    <div class="info-label">SLA Restante</div>
                    <div class="info-value sla-warning">⏱ 22h 15m</div>
                </div>
            </div>
            
            <!-- Progress Section -->
            <div class="progress-section">
                <div class="progress-header">
                    <div class="progress-title">Progreso del Proceso</div>
                    <div class="progress-stats">Paso 5 de 8 • 62% completado</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 62%;"></div>
                </div>
                
                <!-- Horizontal Steps -->
                <div class="steps-horizontal">
                    <div class="step-item completed">
                        <div class="step-circle">✓</div>
                        <div class="step-label">Lead</div>
                    </div>
                    <div class="step-item completed">
                        <div class="step-circle">✓</div>
                        <div class="step-label">Registro</div>
                    </div>
                    <div class="step-item completed">
                        <div class="step-circle">✓</div>
                        <div class="step-label">Perfilamiento</div>
                    </div>
                    <div class="step-item completed">
                        <div class="step-circle">✓</div>
                        <div class="step-label">Firma AUCO</div>
                    </div>
                    <div class="step-item active">
                        <div class="step-circle">5</div>
                        <div class="step-label">Gestión Bancaria</div>
                    </div>
                    <div class="step-item">
                        <div class="step-circle">6</div>
                        <div class="step-label">Peritaje</div>
                    </div>
                    <div class="step-item">
                        <div class="step-circle">7</div>
                        <div class="step-label">Documentos</div>
                    </div>
                    <div class="step-item">
                        <div class="step-circle">8</div>
                        <div class="step-label">Desembolso</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="content-grid">
            <!-- Form Area -->
            <div class="form-card">
                <h2 class="form-title">Envío a Bancos</h2>
                <p class="form-description">Selecciona los bancos y adjunta la documentación requerida para continuar con el proceso de aprobación.</p>
                
                <div class="banner-alert">
                    <span>⚠️</span>
                    <div>
                        <strong>Banco Occidente</strong> devolvió la solicitud: "Extracto bancario ilegible". Revisa y reenvía el documento.
                    </div>
                </div>
                
                <div class="form-section">
                    <div class="section-title">Tipo de Envío</div>
                    <div class="radio-group">
                        <label class="radio-item">
                            <input type="radio" name="envio" checked>
                            <span>Automática por política</span>
                        </label>
                        <label class="radio-item">
                            <input type="radio" name="envio">
                            <span>Selección manual</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-section">
                    <div class="section-title">Bancos Seleccionados</div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>
                                <input type="checkbox" checked> Davivienda
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" checked> Occidente
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox"> Bancolombia
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox"> BBVA
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <div class="section-title">Documentos Requeridos</div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>
                                <input type="checkbox" checked> Formulario firmado
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" checked> Extracto bancario 1
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox"> Extracto bancario 2
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" checked> Certificación laboral
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <div class="section-title">Subir Extracto Bancario 2</div>
                    <div class="upload-zone">
                        <div class="upload-icon">📎</div>
                        <div class="upload-text">Arrastra el archivo aquí o haz clic para seleccionar</div>
                        <div class="upload-hint">PDF, JPG o PNG • Máx. 10MB</div>
                    </div>
                </div>
                
                <div class="form-section">
                    <div class="section-title">Elegibilidad Estimada</div>
                    <div style="background: #F9FAFB; padding: 16px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Davivienda</span>
                            <span style="color: #10B981; font-weight: 600;">95% score • Cobertura 80%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Occidente</span>
                            <span style="color: #FF931E; font-weight: 600;">70% score • Cobertura 75%</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button class="btn btn-secondary">← Volver</button>
                    <button class="btn btn-secondary">Guardar Borrador</button>
                    <button class="btn btn-primary">Enviar a 2 Bancos →</button>
                </div>
            </div>
            
            <!-- Sidebar -->
            <div class="sidebar">
                <!-- Resumen -->
                <div class="sidebar-card">
                    <div class="sidebar-title">Resumen del Caso</div>
                    <div class="summary-item">
                        <span class="summary-label">Valor inmueble:</span>
                        <span class="summary-value">$350.000.000</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Valor crédito:</span>
                        <span class="summary-value">$280.000.000</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">% Financiación:</span>
                        <span class="summary-value">80%</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Plazo:</span>
                        <span class="summary-value">15 años</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Teléfono:</span>
                        <span class="summary-value">+57 315 123 4567</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Email:</span>
                        <span class="summary-value">freddy@email.com</span>
                    </div>
                </div>
                
                <!-- Estado Bancos -->
                <div class="sidebar-card">
                    <div class="sidebar-title">Estado por Banco</div>
                    <div class="bank-status">
                        <div class="bank-status-dot success"></div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">Davivienda</div>
                            <div style="font-size: 12px; color: #6B7280;">En estudio • Enviado 10:24</div>
                        </div>
                    </div>
                    <div class="bank-status">
                        <div class="bank-status-dot error"></div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">Occidente</div>
                            <div style="font-size: 12px; color: #6B7280;">Devuelto • Doc faltante</div>
                        </div>
                    </div>
                </div>
                
                <!-- Timeline -->
                <div class="sidebar-card">
                    <div class="sidebar-title">Actividad Reciente</div>
                    <div class="timeline-item">
                        <div class="timeline-time">12:05</div>
                        <div class="timeline-content">Banco Occidente devolvió solicitud</div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-time">10:24</div>
                        <div class="timeline-content">Enviado a Davivienda</div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-time">09:15</div>
                        <div class="timeline-content">Firma AUCO completada</div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-time">Ayer</div>
                        <div class="timeline-content">Perfilamiento completado</div>
                    </div>
                </div>
                
                <!-- Acciones Rápidas -->
                <div class="sidebar-card">
                    <div class="sidebar-title">Acciones Rápidas</div>
                    <div class="quick-action">
                        <span>💬</span>
                        <span>Abrir chat WhatsApp</span>
                    </div>
                    <div class="quick-action">
                        <span>📞</span>
                        <span>Llamar cliente</span>
                    </div>
                    <div class="quick-action">
                        <span>📧</span>
                        <span>Enviar email</span>
                    </div>
                    <div class="quick-action">
                        <span>📝</span>
                        <span>Agregar nota</span>
                    </div>
                </div>
                
                <!-- Documentos -->
                <div class="sidebar-card">
                    <div class="sidebar-title">Documentos Adjuntos</div>
                    <div class="document-item">
                        <div class="doc-icon">📄</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 500;">Cédula Frente</div>
                            <div style="font-size: 11px; color: #6B7280;">2.3 MB • PDF</div>
                        </div>
                    </div>
                    <div class="document-item">
                        <div class="doc-icon">📄</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 500;">Extracto Bancario 1</div>
                            <div style="font-size: 11px; color: #6B7280;">1.8 MB • PDF</div>
                        </div>
                    </div>
                    <div class="document-item">
                        <div class="doc-icon">📄</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 500;">Cert. Laboral</div>
                            <div style="font-size: 11px; color: #6B7280;">890 KB • PDF</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>