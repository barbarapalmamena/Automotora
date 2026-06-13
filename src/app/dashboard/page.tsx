'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { INITIAL_CARS, Car, formatCLP } from '@/data/cars';

export default function DashboardPage() {
  const [cars, setCars] = useState<Car[]>([]);
  
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Demo password
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  // Leads & Tab State
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'stock' | 'leads' | 'payments'>('analytics');
  const [payments, setPayments] = useState<any[]>([]);

  const loadPayments = () => {
    try {
      setPayments(JSON.parse(localStorage.getItem('automotora_payments') || '[]'));
    } catch { setPayments([]); }
  };

  // Load leads from localStorage
  const loadLeads = () => {
    const savedLeads = localStorage.getItem('automotora_leads');
    if (savedLeads) {
      try {
        setLeads(JSON.parse(savedLeads));
      } catch (e) {
        setLeads([]);
      }
    }
  };

  useEffect(() => {
    loadLeads();
    loadPayments();
  }, [activeTab]);

  const handleDeleteLead = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Está seguro de que desea eliminar este mensaje de cliente?')) {
      const filtered = leads.filter(l => l.id !== leadId);
      setLeads(filtered);
      localStorage.setItem('automotora_leads', JSON.stringify(filtered));
    }
  };

  const toggleLeadReadStatus = (leadId: string) => {
    const updated = leads.map(l => {
      if (l.id === leadId) {
        return { ...l, read: !l.read };
      }
      return l;
    });
    setLeads(updated);
    localStorage.setItem('automotora_leads', JSON.stringify(updated));
  };

  const markAllLeadsAsRead = () => {
    const updated = leads.map(l => ({ ...l, read: true }));
    setLeads(updated);
    localStorage.setItem('automotora_leads', JSON.stringify(updated));
  };

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2024);
  const [price, setPrice] = useState(25000000);
  const [mileage, setMileage] = useState(10000);
  const [transmission, setTransmission] = useState<'Automática' | 'Manual'>('Automática');
  const [fuel, setFuel] = useState<'Bencina' | 'Diésel' | 'Híbrido' | 'Eléctrico'>('Diésel');
  const [type, setType] = useState<'suv' | 'sedan' | 'deportivo' | 'electrico' | 'camioneta'>('camioneta');
  const [color, setColor] = useState('');
  const [hp, setHp] = useState(170);
  const [engine, setEngine] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState('/pickup-hilux.png');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'Disponible' | 'Reservado' | 'Vendido'>('Disponible');

  // Available image presets (specific to active stock)
  const imagePresets = [
    { name: 'Toyota Hilux Blanca', path: '/pickup-hilux.png' },
    { name: 'Ford Ranger Gris', path: '/pickup-ranger.png' },
    { name: 'Mitsubishi L200 Gris', path: '/pickup-l200.png' },
    { name: 'Mercedes GLA Negra', path: '/suv-luxury.png' },
    { name: 'Tesla Model 3 Azul', path: '/electric-sedan.png' },
    { name: 'Mazda MX-5 RF Roja', path: '/sports-red.png' },
    { name: 'Deportivo Negro Hero', path: '/hero-sports.png' }
  ];

  // Load cars from localStorage
  const loadCars = () => {
    const saved = localStorage.getItem('automotora_cars');
    if (saved) {
      try {
        setCars(JSON.parse(saved));
      } catch (e) {
        setCars(INITIAL_CARS);
      }
    } else {
      setCars(INITIAL_CARS);
      localStorage.setItem('automotora_cars', JSON.stringify(INITIAL_CARS));
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const saveToLocalStorage = (updatedCars: Car[]) => {
    setCars(updatedCars);
    localStorage.setItem('automotora_cars', JSON.stringify(updatedCars));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!brand || !model || !color || !engine) {
      alert('Por favor complete los campos obligatorios (*).');
      return;
    }

    if (editingId) {
      // Edit mode
      const updated = cars.map(car => {
        if (car.id === editingId) {
          return {
            ...car,
            brand,
            model,
            year: Number(year),
            price: Number(price),
            mileage: Number(mileage),
            transmission,
            fuel,
            type,
            color,
            hp: Number(hp),
            engine,
            description,
            image: selectedImage,
            gallery: [selectedImage, ...car.gallery.filter(img => img !== selectedImage)],
            featured,
            status
          };
        }
        return car;
      });

      saveToLocalStorage(updated);
      setEditingId(null);
    } else {
      // Add mode
      const newCar: Car = {
        id: Date.now().toString(),
        brand,
        model,
        year: Number(year),
        price: Number(price),
        mileage: Number(mileage),
        transmission,
        fuel,
        type,
        color,
        hp: Number(hp),
        engine,
        description: description || `Excelente ${brand} ${model} del año ${year} disponible en nuestra sucursal de Puerto Montt.`,
        image: selectedImage,
        gallery: [selectedImage],
        featured,
        specifications: {
          'Tracción': type === 'camioneta' ? '4x4 reducible' : 'AWD / 2WD',
          'Sistemas de Seguridad': 'ABS, airbags frontales e inmovilizador de motor',
          'Garantía': 'Garantía ética certificada de 7 días'
        },
        status
      };

      saveToLocalStorage([newCar, ...cars]);
    }

    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setBrand('');
    setModel('');
    setYear(2024);
    setPrice(25000000);
    setMileage(10000);
    setTransmission('Automática');
    setFuel('Diésel');
    setType('camioneta');
    setColor('');
    setHp(170);
    setEngine('');
    setDescription('');
    setSelectedImage('/pickup-hilux.png');
    setFeatured(false);
    setStatus('Disponible');
  };

  const handleEdit = (car: Car) => {
    setEditingId(car.id);
    setBrand(car.brand);
    setModel(car.model);
    setYear(car.year);
    setPrice(car.price);
    setMileage(car.mileage);
    setTransmission(car.transmission);
    setFuel(car.fuel);
    setType(car.type as any);
    setColor(car.color);
    setHp(car.hp);
    setEngine(car.engine);
    setDescription(car.description);
    setSelectedImage(car.image);
    setFeatured(car.featured);
    setStatus(car.status || 'Disponible');
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este vehículo del inventario?')) {
      const filtered = cars.filter(car => car.id !== id);
      saveToLocalStorage(filtered);
      if (editingId === id) {
        resetForm();
      }
    }
  };

  const updateCarStatusDirectly = (carId: string, newStatus: 'Disponible' | 'Reservado' | 'Vendido') => {
    const updated = cars.map(car => {
      if (car.id === carId) {
        return { ...car, status: newStatus };
      }
      return car;
    });
    saveToLocalStorage(updated);
  };

  // Helper to pre-fill WhatsApp CRM responses
  const getWhatsAppCRMUrl = (lead: any) => {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('56') ? cleanPhone : `56${cleanPhone}`;
    
    let replyMsg = `Hola ${lead.name}, te contactamos de Automotora por tu consulta en nuestra web sobre "${lead.subject}". ¿Cómo te podemos ayudar?`;
    
    if (lead.financing) {
      const quotaFormatted = formatCLP(lead.financing.quota);
      replyMsg = `Hola ${lead.name}, te contactamos de Automotora por tu cotización para el ${lead.car}. Vemos que simulaste un pie de ${lead.financing.downpayment}% y ${lead.financing.months} cuotas de ${quotaFormatted} al mes. ¿Cuándo te gustaría coordinar un test drive en la sucursal de Puerto Montt?`;
    } else if (lead.car) {
      replyMsg = `Hola ${lead.name}, te escribimos de Automotora por tu interés en el modelo ${lead.car}. ¿Sigue disponible tu interés para agendar una visita y revisarlo?`;
    }

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(replyMsg)}`;
  };

  const unreadCount = leads.filter(l => !l.read).length;

  // ==========================================
  // Analytics Calculations
  // ==========================================
  const totalStockValue = cars
    .filter(c => (c.status || 'Disponible') !== 'Vendido')
    .reduce((sum, car) => sum + car.price, 0);

  const totalRevenue = cars
    .filter(c => c.status === 'Vendido')
    .reduce((sum, car) => sum + car.price, 0);

  const soldCount = cars.filter(c => c.status === 'Vendido').length;
  const activeCount = cars.filter(c => (c.status || 'Disponible') !== 'Vendido').length;
  const totalCars = cars.length;
  const totalLeads = leads.length;
  const unreadLeads = leads.filter(l => !l.read).length;

  // Category counts & percentages
  const categoryCounts: Record<string, number> = {
    camioneta: 0,
    suv: 0,
    sedan: 0,
    electrico: 0,
    deportivo: 0
  };

  cars.forEach(car => {
    if (categoryCounts[car.type] !== undefined) {
      categoryCounts[car.type]++;
    }
  });

  const categoryPercentages: Record<string, number> = {};
  Object.keys(categoryCounts).forEach(cat => {
    categoryPercentages[cat] = totalCars > 0 ? (categoryCounts[cat] / totalCars) * 100 : 0;
  });

  // Popular vehicles requested in leads
  const leadCountsByCar: Record<string, number> = {};
  leads.forEach(lead => {
    if (lead.car) {
      leadCountsByCar[lead.car] = (leadCountsByCar[lead.car] || 0) + 1;
    }
  });

  const popularVehicles = Object.entries(leadCountsByCar)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Timeline / Recent Commercial History Builder
  const activityLogs: { type: string; text: string; time: string }[] = [];
  
  // 1. Lead registrations
  leads.slice(0, 3).forEach((lead, idx) => {
    const timeLabel = idx === 0 ? 'Hoy' : idx === 1 ? 'Ayer' : 'Hace 2 días';
    activityLogs.push({
      type: 'lead',
      text: `Lead CRM: Consulta de ${lead.name} por ${lead.car || 'Consulta General'}`,
      time: timeLabel
    });
  });

  // 2. Sales records
  const soldCars = cars.filter(c => c.status === 'Vendido');
  soldCars.forEach((c, idx) => {
    if (idx < 2) {
      activityLogs.push({
        type: 'venta',
        text: `Vendido: ${c.brand} ${c.model} (${formatCLP(c.price)})`,
        time: idx === 0 ? 'Hoy' : 'Ayer'
      });
    }
  });

  // 3. Reservations records
  const reservedCars = cars.filter(c => c.status === 'Reservado');
  reservedCars.forEach((c, idx) => {
    if (idx < 2) {
      activityLogs.push({
        type: 'reserva',
        text: `Reservado: ${c.brand} ${c.model} en negociación`,
        time: idx === 0 ? 'Hoy' : 'Ayer'
      });
    }
  });

  // Fallbacks if timeline is empty
  if (activityLogs.length === 0) {
    activityLogs.push(
      { type: 'stock', text: 'Inventario inicial de stock cargado.', time: 'Hace 3 días' },
      { type: 'sistema', text: 'Consola de CRM y analítica inicializada en Puerto Montt.', time: 'Hace 3 días' }
    );
  } else {
    // Sort activity logs so they look chronological
    const timeOrders: Record<string, number> = { 'Hoy': 1, 'Ayer': 2, 'Hace 2 días': 3, 'Hace 3 días': 4 };
    activityLogs.sort((a, b) => (timeOrders[a.time] || 9) - (timeOrders[b.time] || 9));
  }

  if (!isAuthenticated) {
    return (
      <div className="animate-fade-in" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '40px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ fontSize: '40px' }}>🔒</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Acceso Restringido</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
            Este panel es de uso exclusivo para el administrador de la automotora.
          </p>
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="admin-pass" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Contraseña de Administrador
              </label>
              <input
                id="admin-pass"
                type="password"
                required
                placeholder="Ingrese contraseña..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: loginError ? '1px solid var(--danger)' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '6px',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
              {loginError && (
                <span style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Contraseña incorrecta. Intente nuevamente.
                </span>
              )}
            </div>
            <button type="submit" className="gradient-btn" style={{ padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>
              Iniciar Sesión
            </button>
          </form>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            * Contraseña de demostración: <strong style={{ color: 'var(--accent)' }}>admin123</strong>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-bg"></div>
        <div className="page-header-content">
          <span className="section-subtitle">Consola de Control • Puerto Montt</span>
          <h1 className="page-header-title">Panel de Administración</h1>
          <p className="page-header-subtitle">
            Administra el stock digital de la automotora. Publica nuevos ingresos de vehículos, edita precios, gestiona disponibilidades o revisa el CRM de clientes.
          </p>
        </div>
      </section>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={activeTab === 'analytics' ? 'gradient-btn' : 'secondary-btn'}
          style={{ padding: '12px 24px', borderRadius: '50px', fontSize: '14px', border: activeTab === 'analytics' ? 'none' : '1px solid rgba(255,255,255,0.2)' }}
        >
          📊 Analítica y KPIs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={activeTab === 'stock' ? 'gradient-btn' : 'secondary-btn'}
          style={{ padding: '12px 24px', borderRadius: '50px', fontSize: '14px', border: activeTab === 'stock' ? 'none' : '1px solid rgba(255,255,255,0.2)' }}
        >
          🛻 Gestionar Stock
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('leads')}
          className={activeTab === 'leads' ? 'gradient-btn' : 'secondary-btn'}
          style={{ padding: '12px 24px', borderRadius: '50px', fontSize: '14px', border: activeTab === 'leads' ? 'none' : '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center' }}
        >
          ✉️ Mensajes de Clientes
          {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={activeTab === 'payments' ? 'gradient-btn' : 'secondary-btn'}
          style={{ padding: '12px 24px', borderRadius: '50px', fontSize: '14px', border: activeTab === 'payments' ? 'none' : '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center' }}
        >
          💳 Pagos
          {payments.length > 0 && <span className="tab-badge" style={{ background: 'var(--success)', color: '#0a0a14' }}>{payments.length}</span>}
        </button>
      </div>

      {/* Main Dashboard Layout */}
      <section className="dashboard-container">
        
        {/* ========================================== */}
        {/* TAB 1: ANALYTICS & KPIS                    */}
        {/* ========================================== */}
        {activeTab === 'analytics' && (() => {
          // ── SVG Pie Chart helper ──────────────────────────────────
          const PIE_COLORS = ['#ffcc00', '#00c6a7', '#ff5a5a', '#00aaff', '#a855f7'];
          const catEntries = Object.entries(categoryCounts).filter(([, v]) => v > 0);
          const r = 80, cx = 100, cy = 100;
          let startAngle = -Math.PI / 2;
          const pieSlices = catEntries.map(([cat, count], i) => {
            const angle = (count / (totalCars || 1)) * 2 * Math.PI;
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(startAngle + angle);
            const y2 = cy + r * Math.sin(startAngle + angle);
            const large = angle > Math.PI ? 1 : 0;
            const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
            const midAngle = startAngle + angle / 2;
            const lx = cx + (r * 0.65) * Math.cos(midAngle);
            const ly = cy + (r * 0.65) * Math.sin(midAngle);
            startAngle += angle;
            return { cat, count, path, color: PIE_COLORS[i % PIE_COLORS.length], lx, ly, pct: Math.round((count / (totalCars || 1)) * 100) };
          });

          const catLabel = (c: string) => c === 'camioneta' ? 'Camionetas' : c === 'suv' ? 'SUV' : c === 'sedan' ? 'Sedan' : c === 'electrico' ? 'Eléctrico' : 'Deportivo';

          // ── Price tier bar chart (simulated monthly income buckets) ──
          const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
          const seedRevenue = (soldCount * 18000000) || 0;
          const monthBars = months.map((m, i) => {
            const factor = [0.6, 0.8, 1.0, 0.75, 0.9, 1.1][i];
            const base = (seedRevenue / 6) * factor;
            const jitter = Math.sin(i * 137.5) * base * 0.25;
            return { m, value: Math.max(base + jitter, 1000000) };
          });
          const maxBar = Math.max(...monthBars.map(b => b.value));

          // ── Donut chart for status ──
          const statuses = [
            { label: 'Disponible', count: cars.filter(c => (c.status || 'Disponible') === 'Disponible').length, color: '#00c6a7' },
            { label: 'Reservado', count: cars.filter(c => c.status === 'Reservado').length, color: '#ffcc00' },
            { label: 'Vendido', count: cars.filter(c => c.status === 'Vendido').length, color: '#ff5a5a' },
          ];
          const donutR = 55, donutCx = 80, donutCy = 80, donutHole = 30;
          let donutAngle = -Math.PI / 2;
          const donutSlices = statuses.map(s => {
            const angle = (s.count / (totalCars || 1)) * 2 * Math.PI;
            const outerX1 = donutCx + donutR * Math.cos(donutAngle);
            const outerY1 = donutCy + donutR * Math.sin(donutAngle);
            const outerX2 = donutCx + donutR * Math.cos(donutAngle + angle);
            const outerY2 = donutCy + donutR * Math.sin(donutAngle + angle);
            const innerX1 = donutCx + donutHole * Math.cos(donutAngle + angle);
            const innerY1 = donutCy + donutHole * Math.sin(donutAngle + angle);
            const innerX2 = donutCx + donutHole * Math.cos(donutAngle);
            const innerY2 = donutCy + donutHole * Math.sin(donutAngle);
            const large = angle > Math.PI ? 1 : 0;
            const path = `M ${outerX1} ${outerY1} A ${donutR} ${donutR} 0 ${large} 1 ${outerX2} ${outerY2} L ${innerX1} ${innerY1} A ${donutHole} ${donutHole} 0 ${large} 0 ${innerX2} ${innerY2} Z`;
            donutAngle += angle;
            return { ...s, path, pct: Math.round((s.count / (totalCars || 1)) * 100) };
          });

          const handlePDFExport = () => {
            window.print();
          };

          return (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

              {/* Print-only header */}
              <div className="print-header">
                <h1>📊 Reporte de Analítica — Automotora</h1>
                <p>Generado el {new Date().toLocaleDateString('es-CL', { dateStyle: 'long' })} • Puerto Montt</p>
              </div>

              {/* Header Row with PDF button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                    📊 Analítica y KPIs
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Datos en tiempo real del inventario y CRM
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePDFExport}
                  className="pdf-download-btn"
                >
                  📥 Descargar PDF
                </button>
              </div>

              {/* KPI Summary Grid */}
              <div className="analytics-grid">
                
                {/* Stat 1: Revenue */}
                <div className="glass-card stat-card-accent" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    💰 Ingresos Totales
                  </span>
                  <span style={{ fontSize: '26px', fontWeight: '800', color: 'var(--success)' }}>
                    {formatCLP(totalRevenue)}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {soldCount} vehículo{soldCount !== 1 ? 's' : ''} vendido{soldCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Stat 2: Stock Value */}
                <div className="glass-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    🛻 Valor de Stock Activo
                  </span>
                  <span style={{ fontSize: '26px', fontWeight: '800', color: '#fff' }}>
                    {formatCLP(totalStockValue)}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {activeCount} unidades disponibles
                  </span>
                </div>

                {/* Stat 3: Inventory */}
                <div className="glass-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    📦 Inventario Total
                  </span>
                  <span style={{ fontSize: '26px', fontWeight: '800', color: 'var(--accent)' }}>
                    {totalCars} <span style={{ fontSize: '14px', fontWeight: 500 }}>unidades</span>
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Reservados: {cars.filter(c => c.status === 'Reservado').length} · Vendidos: {soldCount}
                  </span>
                </div>

                {/* Stat 4: Leads */}
                <div className="glass-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    ✉️ Leads CRM
                  </span>
                  <span style={{ fontSize: '26px', fontWeight: '800', color: '#00f0ff' }}>
                    {totalLeads}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Pendientes: {unreadLeads} · Leídos: {totalLeads - unreadLeads}
                  </span>
                </div>

              </div>

              {/* Row 1: SVG Pie Chart + SVG Donut Status Chart */}
              <div className="chart-section-grid">

                {/* SVG Pie Chart — Category Distribution */}
                <div className="glass-card chart-card" style={{ padding: '24px' }}>
                  <h3 className="chart-title">Distribución por Categoría</h3>
                  {totalCars > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <div className="svg-chart-wrapper" style={{ width: '200px', height: '200px', flexShrink: 0 }}>
                        <svg viewBox="0 0 200 200" width="200" height="200">
                          {pieSlices.map((s, i) => (
                            <g key={i}>
                              <path d={s.path} fill={s.color} stroke="rgba(10,10,20,0.6)" strokeWidth="2" opacity="0.9">
                                <title>{catLabel(s.cat)}: {s.count} ({s.pct}%)</title>
                              </path>
                              {s.pct >= 10 && (
                                <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle"
                                  style={{ fontSize: '11px', fill: '#0a0a14', fontWeight: 700 }}>
                                  {s.pct}%
                                </text>
                              )}
                            </g>
                          ))}
                          <circle cx={cx} cy={cy} r={24} fill="rgba(10,10,20,0.85)" />
                          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                            style={{ fontSize: '13px', fill: '#fff', fontWeight: 700 }}>{totalCars}</text>
                          <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle"
                            style={{ fontSize: '8px', fill: 'rgba(255,255,255,0.5)' }}>autos</text>
                        </svg>
                      </div>
                      <div className="pie-legend">
                        {pieSlices.map((s, i) => (
                          <div key={i} className="pie-legend-item">
                            <div className="pie-legend-dot" style={{ background: s.color }} />
                            <span>{catLabel(s.cat)}</span>
                            <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#fff' }}>{s.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      Sin vehículos en inventario aún.
                    </div>
                  )}
                </div>

                {/* SVG Donut Chart — Status Distribution */}
                <div className="glass-card chart-card" style={{ padding: '24px' }}>
                  <h3 className="chart-title">Estado de Disponibilidad</h3>
                  {totalCars > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <div className="svg-chart-wrapper" style={{ width: '160px', height: '160px', flexShrink: 0 }}>
                        <svg viewBox="0 0 160 160" width="160" height="160">
                          {donutSlices.filter(s => s.count > 0).map((s, i) => (
                            <path key={i} d={s.path} fill={s.color} stroke="rgba(10,10,20,0.6)" strokeWidth="2">
                              <title>{s.label}: {s.count} ({s.pct}%)</title>
                            </path>
                          ))}
                          <circle cx={donutCx} cy={donutCy} r={donutHole - 2} fill="rgba(10,10,20,0.85)" />
                          <text x={donutCx} y={donutCy - 5} textAnchor="middle" dominantBaseline="middle"
                            style={{ fontSize: '18px', fill: '#fff', fontWeight: 800 }}>{activeCount}</text>
                          <text x={donutCx} y={donutCy + 12} textAnchor="middle" dominantBaseline="middle"
                            style={{ fontSize: '8px', fill: 'rgba(255,255,255,0.5)' }}>activos</text>
                        </svg>
                      </div>
                      <div className="pie-legend" style={{ flex: 1, minWidth: '120px' }}>
                        {donutSlices.map((s, i) => (
                          <div key={i} className="pie-legend-item">
                            <div className="pie-legend-dot" style={{ background: s.color, borderRadius: '50%' }} />
                            <span>{s.label}</span>
                            <span style={{ marginLeft: 'auto', fontWeight: 600, color: s.color }}>{s.count} ({s.pct}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      Sin vehículos en inventario aún.
                    </div>
                  )}
                </div>

              </div>

              {/* Row 2: SVG Bar Chart (monthly revenue simulation) + Demand ranking */}
              <div className="chart-section-grid">

                {/* SVG Bar Chart — Monthly Revenue Simulation */}
                <div className="glass-card chart-card" style={{ padding: '24px' }}>
                  <h3 className="chart-title">Ingresos Estimados — Últimos 6 Meses</h3>
                  <div style={{ position: 'relative' }}>
                    <svg viewBox="0 0 340 160" width="100%" style={{ overflow: 'visible' }}>
                      {/* Y-axis grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
                        <g key={i}>
                          <line
                            x1={30} y1={140 - frac * 120}
                            x2={340} y2={140 - frac * 120}
                            stroke="rgba(255,255,255,0.06)" strokeWidth="1"
                          />
                          <text x={26} y={140 - frac * 120 + 4} textAnchor="end"
                            style={{ fontSize: '7px', fill: 'rgba(255,255,255,0.35)' }}>
                            {frac > 0 ? `$${Math.round((maxBar * frac) / 1000000)}M` : '$0'}
                          </text>
                        </g>
                      ))}
                      {/* Bars */}
                      {monthBars.map((b, i) => {
                        const barW = 30;
                        const spacing = (340 - 30) / monthBars.length;
                        const x = 30 + spacing * i + (spacing - barW) / 2;
                        const barH = (b.value / maxBar) * 120;
                        const y = 140 - barH;
                        return (
                          <g key={i}>
                            <rect
                              x={x} y={y} width={barW} height={barH}
                              rx="4" ry="4"
                              fill={`url(#grad${i})`}
                              opacity="0.9"
                            />
                            <defs>
                              <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ffcc00" stopOpacity="1" />
                                <stop offset="100%" stopColor="#ff8c00" stopOpacity="0.7" />
                              </linearGradient>
                            </defs>
                            <text x={x + barW / 2} y={y - 5} textAnchor="middle"
                              style={{ fontSize: '7px', fill: '#ffcc00', fontWeight: 700 }}>
                              ${Math.round(b.value / 1000000)}M
                            </text>
                            <text x={x + barW / 2} y={154} textAnchor="middle"
                              style={{ fontSize: '8px', fill: 'rgba(255,255,255,0.5)' }}>
                              {b.m}
                            </text>
                          </g>
                        );
                      })}
                      {/* X axis line */}
                      <line x1={30} y1={140} x2={340} y2={140} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    </svg>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right', marginTop: '4px' }}>
                      * Proyección simulada basada en ventas registradas
                    </p>
                  </div>
                </div>

                {/* Demand + Activity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Vehicles most requested */}
                  <div className="glass-card chart-card" style={{ padding: '20px' }}>
                    <h3 className="chart-title">Vehículos más Cotizados</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {popularVehicles.length > 0 ? (
                        popularVehicles.map(([carName, count], idx) => {
                          const maxLeadCount = popularVehicles[0][1];
                          const pct = maxLeadCount > 0 ? (count / maxLeadCount) * 100 : 0;
                          return (
                            <div key={idx} className="chart-bar-row">
                              <span className="chart-bar-label" style={{ width: '130px' }}>{carName}</span>
                              <div className="chart-bar-wrapper" style={{ flex: 1 }}>
                                <div className="chart-bar-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #00f0ff, #0072ff)' }}></div>
                              </div>
                              <span className="chart-bar-value">{count}</span>
                            </div>
                          );
                        })
                      ) : (
                        <p style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          Sin cotizaciones en CRM aún.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Recent activity timeline */}
                  <div className="glass-card chart-card" style={{ padding: '20px' }}>
                    <h3 className="chart-title">Historial Reciente</h3>
                    <div className="activity-log">
                      {activityLogs.slice(0, 4).map((log, idx) => (
                        <div key={idx} className="activity-item">
                          <span className="activity-badge" style={{ 
                            background: log.type === 'venta' ? 'rgba(255,56,56,0.1)' : log.type === 'reserva' ? 'rgba(255,204,0,0.1)' : log.type === 'lead' ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.05)',
                            color: log.type === 'venta' ? 'var(--danger)' : log.type === 'reserva' ? 'var(--accent)' : log.type === 'lead' ? '#00f0ff' : '#fff',
                            border: `1px solid ${log.type === 'venta' ? 'rgba(255,56,56,0.3)' : log.type === 'reserva' ? 'rgba(255,204,0,0.3)' : log.type === 'lead' ? 'rgba(0,240,255,0.3)' : 'rgba(255,255,255,0.1)'}`
                          }}>
                            {log.type}
                          </span>
                          <span className="activity-text">{log.text}</span>
                          <span className="activity-time">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          );
        })()}


        {/* ========================================== */}
        {/* TAB 2: INVENTORY STOCK MANAGEMENT          */}
        {/* ========================================== */}

        {activeTab === 'stock' && (
          <div className="dashboard-grid animate-fade-in">
            
            {/* Admin Form Card */}
            <div className="glass-card admin-form-card">
              <h2 className="admin-form-title">
                {editingId ? '📝 Editar Vehículo' : '➕ Publicar Vehículo'}
              </h2>
              
              <form onSubmit={handleFormSubmit}>
                <div className="calc-grid" style={{ gap: '12px' }}>
                  
                  {/* Brand & Model */}
                  <div className="admin-grid-half">
                    <div className="form-group">
                      <label>Marca *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ej. Toyota, Mitsubishi" 
                        value={brand} 
                        onChange={e => setBrand(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Modelo *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ej. Hilux, L200" 
                        value={model} 
                        onChange={e => setModel(e.target.value)} 
                      />
                    </div>
                  </div>

                  {/* Price & Year */}
                  <div className="admin-grid-half">
                    <div className="form-group">
                      <label>Precio (CLP) *</label>
                      <input 
                        type="number" 
                        required 
                        min="5000000" 
                        value={price} 
                        onChange={e => setPrice(Number(e.target.value))} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Año *</label>
                      <input 
                        type="number" 
                        required 
                        min="2010" 
                        max="2027" 
                        value={year} 
                        onChange={e => setYear(Number(e.target.value))} 
                      />
                    </div>
                  </div>

                  {/* Mileage & HP */}
                  <div className="admin-grid-half">
                    <div className="form-group">
                      <label>Kilometraje (km) *</label>
                      <input 
                        type="number" 
                        required 
                        min="0" 
                        value={mileage} 
                        onChange={e => setMileage(Number(e.target.value))} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Potencia (HP) *</label>
                      <input 
                        type="number" 
                        required 
                        min="50" 
                        value={hp} 
                        onChange={e => setHp(Number(e.target.value))} 
                      />
                    </div>
                  </div>

                  {/* Color & Motor */}
                  <div className="admin-grid-half">
                    <div className="form-group">
                      <label>Color Exterior *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ej. Blanco Glaciar, Gris" 
                        value={color} 
                        onChange={e => setColor(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Motorización *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ej. 2.8L Turbodiesel, 3.0L V6" 
                        value={engine} 
                        onChange={e => setEngine(e.target.value)} 
                      />
                    </div>
                  </div>

                  {/* Transmission & Fuel */}
                  <div className="admin-grid-half">
                    <div className="form-group">
                      <label>Transmisión</label>
                      <select value={transmission} onChange={e => setTransmission(e.target.value as any)}>
                        <option value="Automática">Automática</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Combustible</label>
                      <select value={fuel} onChange={e => setFuel(e.target.value as any)}>
                        <option value="Diésel">Diésel</option>
                        <option value="Bencina">Bencina</option>
                        <option value="Híbrido">Híbrido</option>
                        <option value="Eléctrico">Eléctrico</option>
                      </select>
                    </div>
                  </div>

                  {/* Category Type & Availability */}
                  <div className="admin-grid-half">
                    <div className="form-group">
                      <label>Categoría</label>
                      <select value={type} onChange={e => setType(e.target.value as any)}>
                        <option value="camioneta">Camioneta 4x4</option>
                        <option value="suv">SUV</option>
                        <option value="sedan">Sedán</option>
                        <option value="electrico">Eléctrico</option>
                        <option value="deportivo">Deportivo</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Disponibilidad</label>
                      <select value={status} onChange={e => setStatus(e.target.value as any)}>
                        <option value="Disponible">Disponible</option>
                        <option value="Reservado">Reservado</option>
                        <option value="Vendido">Vendido</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', paddingTop: '10px' }}>
                    <input 
                      type="checkbox" 
                      id="form-featured" 
                      checked={featured} 
                      onChange={e => setFeatured(e.target.checked)} 
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="form-featured" style={{ cursor: 'pointer' }}>Modelo Destacado</label>
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea 
                      rows={3} 
                      placeholder="Detalles sobre equipamiento, historial de revisiones..." 
                      value={description} 
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Preset Image Selector */}
                  <div className="form-group">
                    <label>Imagen del Vehículo (Presets)</label>
                    <div className="preset-images-grid">
                      {imagePresets.map((preset) => (
                        <div 
                          key={preset.path}
                          onClick={() => setSelectedImage(preset.path)}
                          style={{
                            position: 'relative',
                            height: '50px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: selectedImage === preset.path ? '2px solid var(--accent)' : '2px solid transparent',
                            opacity: selectedImage === preset.path ? 1 : 0.6,
                            transition: 'var(--transition)'
                          }}
                        >
                          <Image 
                            src={preset.path} 
                            alt={preset.name}
                            fill
                            sizes="50px"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Image URL Selector */}
                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label>O pegue una URL de Imagen Personalizada (Opcional)</label>
                    <input
                      type="url"
                      placeholder="https://ejemplo.com/mi-auto.jpg"
                      className="filter-input"
                      value={selectedImage.startsWith('/') ? '' : selectedImage}
                      onChange={(e) => setSelectedImage(e.target.value || '/pickup-hilux.png')}
                    />
                  </div>

                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" className="gradient-btn" style={{ flex: 1, padding: '12px', borderRadius: '6px' }}>
                    {editingId ? 'Guardar Cambios' : 'Publicar Vehículo'}
                  </button>
                  {editingId && (
                    <button 
                      type="button" 
                      className="secondary-btn" 
                      style={{ padding: '12px', borderRadius: '6px' }}
                      onClick={resetForm}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Admin List Card */}
            <div className="glass-card admin-list-card">
              <div className="admin-list-title">
                <span>Inventario Activo</span>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                  Total: {cars.length} vehículos
                </span>
              </div>

              <div className="admin-car-list">
                {cars.map((car) => {
                  const carStatus = car.status || 'Disponible';
                  return (
                    <div key={car.id} className="admin-car-item">
                      <div className="admin-car-info">
                        <div style={{ position: 'relative', width: '50px', height: '35px' }}>
                          <Image 
                            src={car.image} 
                            alt={`${car.brand} ${car.model}`} 
                            fill
                            sizes="50px"
                            className="admin-car-thumb"
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </div>
                        <div className="admin-car-details">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="admin-car-name">{car.brand} {car.model}</span>
                            <span className={`status-badge status-${carStatus === 'Disponible' ? 'available' : carStatus === 'Reservado' ? 'reserved' : 'sold'}`} style={{ position: 'static', fontSize: '9px', padding: '1px 5px', borderRadius: '3px' }}>
                              {carStatus}
                            </span>
                          </div>
                          <span className="admin-car-price">
                            {formatCLP(car.price)} <span style={{ color: 'var(--text-secondary)' }}>• {car.year} • {car.mileage.toLocaleString()} km</span>
                          </span>
                        </div>
                      </div>

                      <div className="admin-car-actions" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            type="button" 
                            className="admin-btn admin-btn-edit"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => handleEdit(car)}
                          >
                            Editar
                          </button>
                          <button 
                            type="button" 
                            className="admin-btn admin-btn-delete"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => handleDelete(car.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                        
                        {/* Quick state change triggers */}
                        <div style={{ display: 'flex', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                          <button
                            type="button"
                            className="admin-btn"
                            style={{ fontSize: '9px', padding: '2px 4px', background: carStatus === 'Disponible' ? 'rgba(0,255,136,0.1)' : 'transparent', color: carStatus === 'Disponible' ? 'var(--success)' : '#8f9cae', borderColor: carStatus === 'Disponible' ? 'var(--success)' : 'rgba(255,255,255,0.1)' }}
                            onClick={() => updateCarStatusDirectly(car.id, 'Disponible')}
                          >
                            ✓ Disp
                          </button>
                          <button
                            type="button"
                            className="admin-btn"
                            style={{ fontSize: '9px', padding: '2px 4px', background: carStatus === 'Reservado' ? 'rgba(255,204,0,0.1)' : 'transparent', color: carStatus === 'Reservado' ? 'var(--accent)' : '#8f9cae', borderColor: carStatus === 'Reservado' ? 'var(--accent)' : 'rgba(255,255,255,0.1)' }}
                            onClick={() => updateCarStatusDirectly(car.id, 'Reservado')}
                          >
                            ⚡ Res
                          </button>
                          <button
                            type="button"
                            className="admin-btn"
                            style={{ fontSize: '9px', padding: '2px 4px', background: carStatus === 'Vendido' ? 'rgba(255,56,56,0.1)' : 'transparent', color: carStatus === 'Vendido' ? 'var(--danger)' : '#8f9cae', borderColor: carStatus === 'Vendido' ? 'var(--danger)' : 'rgba(255,255,255,0.1)' }}
                            onClick={() => updateCarStatusDirectly(car.id, 'Vendido')}
                          >
                            ✕ Vend
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: CLIENT INQUIRIES & LEADS CRM        */}
        {/* ========================================== */}
        {activeTab === 'leads' && (
          <div className="glass-card animate-fade-in" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
                Mensajes y Cotizaciones Recibidos
              </h2>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={markAllLeadsAsRead}
                  style={{ padding: '6px 14px', borderRadius: '4px', fontSize: '12px' }}
                >
                  Marcar todos como leídos
                </button>
              )}
            </div>
            
            {leads.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {leads.map((lead) => (
                  <div 
                    key={lead.id} 
                    className="glass-card" 
                    onClick={() => { if (!lead.read) toggleLeadReadStatus(lead.id); }}
                    style={{ 
                      padding: '20px', 
                      background: lead.read ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 204, 0, 0.02)', 
                      border: lead.read ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 204, 0, 0.2)',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '15px', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {!lead.read && <span className="lead-unread-indicator"></span>}
                          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>{lead.name}</h3>
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                          📞 {lead.phone} | ✉️ {lead.email}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lead.date}</span>
                        
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleLeadReadStatus(lead.id); }}
                          className="admin-btn"
                          style={{ padding: '4px 8px', fontSize: '11px', background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                          {lead.read ? 'No Leído' : 'Leído'}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteLead(lead.id, e)}
                          className="admin-btn admin-btn-delete"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '13px', color: 'var(--accent)' }}>Asunto: </strong>
                        <span style={{ fontSize: '14px' }}>{lead.subject}</span>
                      </div>
                      
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px', fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                        {lead.message}
                      </div>

                      {lead.financing && (
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', background: 'rgba(255, 204, 0, 0.03)', border: '1px solid rgba(255, 204, 0, 0.1)', padding: '12px', borderRadius: '6px', fontSize: '13px', alignItems: 'center' }}>
                          <div>
                            <strong>Pie Solicitado:</strong> {lead.financing.downpayment}%
                          </div>
                          <div>
                            <strong>Plazo:</strong> {lead.financing.months} Meses
                          </div>
                          <div>
                            <strong>Cuota Estimada:</strong>{' '}
                            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                              {formatCLP(lead.financing.quota)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* WhatsApp Response CTA */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
                        <a
                          href={getWhatsAppCRMUrl(lead)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="whatsapp-btn"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: '8px 16px',
                            fontSize: '13px',
                            borderRadius: '4px',
                            fontWeight: '600'
                          }}
                        >
                          💬 Responder por WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>✉️</div>
                <p>No se han recibido consultas ni cotizaciones de clientes aún.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: PAYMENTS                            */}
        {/* ========================================== */}
        {activeTab === 'payments' && (() => {
          const totalPaymentsRevenue = payments
            .filter(p => p.status === 'completado')
            .reduce((sum: number, p: any) => sum + p.amount, 0);
          const pendingPayments = payments.filter(p => p.status === 'pendiente').length;
          const completedPayments = payments.filter(p => p.status === 'completado').length;

          return (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {/* KPIs */}
              <div className="analytics-grid">
                <div className="glass-card stat-card-accent" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>💰 Ingresos Confirmados</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--success)' }}>{formatCLP(totalPaymentsRevenue)}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{completedPayments} pago{completedPayments !== 1 ? 's' : ''} completado{completedPayments !== 1 ? 's' : ''}</span>
                </div>
                <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>📋 Total Transacciones</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)' }}>{payments.length}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>WebPay: {payments.filter(p => p.method === 'webpay').length} · Transferencia: {payments.filter(p => p.method === 'transferencia').length} · Financ.: {payments.filter(p => p.method === 'financiamiento').length}</span>
                </div>
                <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>⏳ Pendientes Verificación</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: pendingPayments > 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>{pendingPayments}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Transferencias por confirmar</span>
                </div>
                <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>📅 Último Pago</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>
                    {payments.length > 0
                      ? new Date(payments[0].date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{payments.length > 0 ? payments[0].carName : 'Sin pagos aún'}</span>
                </div>
              </div>

              {/* Payments Table */}
              <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>📋 Registro de Transacciones</h3>
                  {payments.length > 0 && (
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{payments.length} transacción{payments.length !== 1 ? 'es' : ''}</span>
                  )}
                </div>

                {payments.length > 0 ? (
                  <div className="payments-table-wrapper">
                    <table className="payments-table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Vehículo</th>
                          <th>Comprador</th>
                          <th>Método</th>
                          <th>Monto</th>
                          <th>Operación</th>
                          <th>Estado</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p: any) => (
                          <tr key={p.id}>
                            <td>
                              <span style={{ fontFamily: 'Courier New, monospace', fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>{p.id}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontWeight: 600, fontSize: '13px' }}>{p.carName}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontWeight: 600 }}>{p.buyerName}</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.buyerRut}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`method-badge method-${p.method}`}>
                                {p.method === 'webpay' ? '💳 WebPay' : p.method === 'transferencia' ? '🏦 Transferencia' : '📋 Financiamiento'}
                              </span>
                            </td>
                            <td>
                              <span style={{ color: p.status === 'completado' ? 'var(--success)' : 'var(--accent)', fontWeight: 700 }}>
                                {formatCLP(p.amount)}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '20px', background: p.mode === 'contado' ? 'rgba(0,198,167,0.1)' : 'rgba(255,204,0,0.1)', color: p.mode === 'contado' ? 'var(--success)' : 'var(--accent)' }}>
                                {p.mode === 'contado' ? 'Contado' : 'Reserva'}
                              </span>
                            </td>
                            <td>
                              <span className={p.status === 'completado' ? 'payment-status-completado' : 'payment-status-pendiente'}>
                                {p.status === 'completado' ? '✅ Completado' : '⏳ Pendiente'}
                              </span>
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                              {new Date(p.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
                    <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#fff' }}>Sin pagos registrados aún</p>
                    <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
                      Cuando los clientes realicen pagos a través del checkout, aparecerán aquí con todos sus detalles.
                    </p>
                  </div>
                )}
              </div>

            </div>
          );
        })()}

      </section>
    </div>
  );
}
