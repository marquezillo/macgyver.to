# Investigación: Plataforma de Generación de Aplicaciones Web

## Tipos de SaaS Identificados

### 1. CRM (Customer Relationship Management)
- Gestión de contactos y clientes
- Pipeline de ventas
- Historial de interacciones
- Automatización de emails
- Reportes de ventas

### 2. ERP (Enterprise Resource Planning)
- Gestión de inventario
- Contabilidad integrada
- Gestión de proyectos
- Recursos humanos
- Cadena de suministro

### 3. Contabilidad/Finanzas
- Facturación
- Control de gastos
- Reportes financieros
- Integración bancaria
- Gestión de impuestos

### 4. Gestión de Proyectos
- Tableros Kanban
- Listas de tareas
- Seguimiento de tiempo
- Colaboración en equipo
- Calendarios y deadlines

### 5. E-commerce
- Catálogo de productos
- Carrito de compras
- Procesamiento de pagos
- Gestión de pedidos
- Inventario

### 6. CMS (Content Management)
- Editor de contenido
- Gestión de medios
- Blog/Artículos
- Páginas estáticas
- SEO

### 7. Comunicación/Colaboración
- Chat en tiempo real
- Videollamadas
- Compartir archivos
- Canales/Grupos
- Notificaciones

### 8. RRHH/HRM
- Gestión de empleados
- Reclutamiento
- Evaluaciones de desempeño
- Control de asistencia
- Nóminas

### 9. Reservas/Citas
- Calendario de disponibilidad
- Reservas online
- Recordatorios automáticos
- Gestión de clientes
- Pagos anticipados

### 10. Helpdesk/Soporte
- Sistema de tickets
- Base de conocimiento
- Chat en vivo
- SLA tracking
- Reportes de satisfacción

## Componentes Esenciales de Admin Panel

### 1. Autenticación y Usuarios
- Login/Registro
- Roles y permisos (RBAC)
- Gestión de usuarios
- Perfil de usuario
- Recuperación de contraseña

### 2. Dashboard Principal
- KPIs y métricas clave
- Gráficos y visualizaciones
- Actividad reciente
- Alertas y notificaciones
- Accesos rápidos

### 3. Tablas CRUD
- Listado con paginación
- Búsqueda y filtros
- Ordenamiento
- Edición inline
- Acciones en lote
- Exportación (CSV, Excel)

### 4. Formularios
- Validación en tiempo real
- Campos dinámicos
- Subida de archivos
- Autoguardado
- Formularios multi-paso

### 5. Visualización de Datos
- Gráficos de líneas/barras
- Gráficos circulares
- Tablas de datos
- Mapas
- Calendarios

### 6. Notificaciones
- Push notifications
- Email automáticos
- Alertas en app
- Centro de notificaciones

### 7. Configuración
- Ajustes generales
- Personalización de marca
- Integraciones
- Webhooks
- API keys

### 8. Auditoría
- Logs de actividad
- Historial de cambios
- Tracking de usuarios
- Reportes de seguridad

## Arquitectura Técnica Propuesta

### Sistema de Subdominios
- Cada usuario tiene un subdominio: `{user_id}.macgyver.to`
- Cada proyecto tiene una ruta: `{user_id}.macgyver.to/{project_slug}`
- Wildcard DNS: `*.macgyver.to` → servidor principal
- Nginx con proxy dinámico basado en subdominio

### Base de Datos por Proyecto
- Opción A: Base de datos separada por proyecto (más aislamiento)
- Opción B: Schema separado por proyecto en misma DB (más eficiente)
- Opción C: Tenant ID en todas las tablas (más simple)

Recomendación: Opción C (Tenant ID) para simplicidad inicial

### Estructura de Proyecto Generado
```
proyecto/
├── pages/
│   ├── index.tsx (landing)
│   ├── terms.tsx
│   ├── privacy.tsx
│   ├── about.tsx
│   └── dashboard/
│       ├── index.tsx
│       ├── users.tsx
│       ├── settings.tsx
│       └── [resource].tsx
├── components/
├── api/
│   ├── auth/
│   └── [resource]/
├── db/
│   └── schema.ts
└── config/
    └── app.json
```

## Secciones por Tipo de Aplicación

### Landing Page (Existente + Mejoras)
- Header/Navegación
- Hero
- Features
- Pricing
- Testimonials
- FAQ
- CTA
- Footer
- **NUEVO**: Páginas internas (términos, privacidad, about)

### Dashboard/Admin Panel
- Sidebar con navegación
- Header con usuario
- Dashboard principal con KPIs
- Tablas CRUD por recurso
- Formularios de creación/edición
- Configuración
- Perfil de usuario

### Secciones Específicas por Tipo de SaaS

#### CRM
- Pipeline de ventas (Kanban)
- Lista de contactos
- Detalle de contacto
- Historial de actividades
- Dashboard de ventas

#### E-commerce Admin
- Lista de productos
- Editor de producto
- Pedidos
- Clientes
- Inventario
- Reportes de ventas

#### Reservas
- Calendario de disponibilidad
- Lista de reservas
- Configuración de servicios
- Clientes
- Pagos

#### Helpdesk
- Lista de tickets
- Detalle de ticket
- Base de conocimiento
- Chat
- Reportes

## Roadmap de Implementación

### Fase 1: Páginas Internas en Landings (1-2 semanas)
- [ ] Sistema de rutas múltiples
- [ ] Páginas predefinidas (términos, privacidad, about)
- [ ] Navegación entre páginas
- [ ] Generación por prompt

### Fase 2: Sistema de Subdominios (1 semana)
- [ ] Configuración DNS wildcard
- [ ] Proxy Nginx dinámico
- [ ] Routing por subdominio
- [ ] URLs persistentes por usuario

### Fase 3: Base de Datos por Proyecto (1-2 semanas)
- [ ] Sistema de tenant_id
- [ ] Migración automática de schemas
- [ ] Aislamiento de datos
- [ ] Panel de gestión de DB

### Fase 4: Generación de Admin Panels (2-3 semanas)
- [ ] Templates de dashboard
- [ ] Componentes CRUD
- [ ] Sistema de autenticación
- [ ] Roles y permisos
- [ ] Generación por prompt

### Fase 5: Tipos de SaaS Específicos (Ongoing)
- [ ] Templates por tipo de negocio
- [ ] Componentes especializados
- [ ] Integraciones comunes
- [ ] Documentación
