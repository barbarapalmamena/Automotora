'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { INITIAL_CARS, Car, formatCLP } from '@/data/cars';

function ContactoContent() {
  const searchParams = useSearchParams();

  // Cars stock list loaded from localStorage
  const [cars, setCars] = useState<Car[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Dynamic selector & calculator states
  const [selectedCarId, setSelectedCarId] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [downPaymentPercent, setDownPaymentPercent] = useState(30);
  const [installments, setInstallments] = useState(36);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [isMessageManuallyEdited, setIsMessageManuallyEdited] = useState(false);

  // Load cars list from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('automotora_cars');
    if (saved) {
      try {
        setCars(JSON.parse(saved));
      } catch (e) {
        setCars(INITIAL_CARS);
      }
    } else {
      setCars(INITIAL_CARS);
    }
  }, []);

  // Initialize from search query parameters (if coming from a detail page)
  useEffect(() => {
    if (cars.length === 0) return;

    const carParam = searchParams.get('car');
    if (carParam) {
      const decodedCarName = decodeURIComponent(carParam).replace('-', ' ').toLowerCase();
      const found = cars.find(
        c => 
          `${c.brand} ${c.model}`.toLowerCase() === decodedCarName || 
          `${c.brand}-${c.model}`.toLowerCase() === decodedCarName
      );

      if (found) {
        setSelectedCarId(found.id);
        
        const downpayment = searchParams.get('downpayment');
        const months = searchParams.get('months');
        
        if (downpayment && months) {
          setShowCalculator(true);
          setDownPaymentPercent(Number(downpayment));
          setInstallments(Number(months));
        } else {
          setShowCalculator(false);
        }
      }
    }
  }, [searchParams, cars]);

  // Calculate monthly payment in real-time
  useEffect(() => {
    if (!selectedCarId) {
      setMonthlyPayment(0);
      return;
    }

    const selectedCar = cars.find(c => c.id === selectedCarId);
    if (!selectedCar) return;

    const downPaymentAmount = selectedCar.price * (downPaymentPercent / 100);
    const loanAmount = selectedCar.price - downPaymentAmount;
    
    // 1.2% monthly interest rate
    const monthlyRate = 0.012; 
    
    // EMI Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, installments)) / 
                (Math.pow(1 + monthlyRate, installments) - 1);
                
    setMonthlyPayment(Math.round(emi));
  }, [selectedCarId, downPaymentPercent, installments, cars]);

  // Automatically update the subject and message based on selections
  useEffect(() => {
    if (isMessageManuallyEdited) return;

    if (selectedCarId) {
      const selectedCar = cars.find(c => c.id === selectedCarId);
      if (selectedCar) {
        setSubject(`Cotización: ${selectedCar.brand} ${selectedCar.model}`);
        if (showCalculator && monthlyPayment) {
          const formattedQuota = formatCLP(monthlyPayment);
          const formattedPie = formatCLP(selectedCar.price * (downPaymentPercent / 100));
          setMessage(`Hola, me interesa el modelo ${selectedCar.brand} ${selectedCar.model}. Solicito pre-evaluación para un crédito automotriz con un pie de ${downPaymentPercent}% (${formattedPie}) y el saldo restante financiado a ${installments} meses, con una cuota mensual estimada de ${formattedQuota}.`);
        } else {
          setMessage(`Hola, me interesa recibir más información sobre el modelo ${selectedCar.brand} ${selectedCar.model}, así como opciones de financiamiento y disponibilidad.`);
        }
      }
    } else {
      setSubject('');
      setMessage('');
    }
  }, [selectedCarId, showCalculator, downPaymentPercent, installments, monthlyPayment, cars, isMessageManuallyEdited]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    const selectedCar = cars.find(c => c.id === selectedCarId);

    // Create a new lead object
    const newLead = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      subject: subject || 'Consulta General',
      message,
      car: selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : '',
      financing: (selectedCar && showCalculator) ? {
        downpayment: Number(downPaymentPercent),
        months: Number(installments),
        quota: Number(monthlyPayment)
      } : null,
      read: false, // Stored as unread initially
      date: new Date().toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Save lead to localStorage
    try {
      const savedLeads = localStorage.getItem('automotora_leads');
      const currentLeads = savedLeads ? JSON.parse(savedLeads) : [];
      localStorage.setItem('automotora_leads', JSON.stringify([newLead, ...currentLeads]));
    } catch (err) {
      console.error('Error saving lead:', err);
    }

    setSubmitted(true);
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-bg"></div>
        <div className="page-header-content">
          <span className="section-subtitle">Atención Personalizada</span>
          <h1 className="page-header-title">Contacto</h1>
          <p className="page-header-subtitle">
            Ponte en contacto con nuestros asesores en Puerto Montt para programar una visita, tasar tu auto en parte de pago o solicitar financiamiento.
          </p>
        </div>
      </section>

      {/* Main Contact Layout */}
      <section className="contact-container">
        {/* Info & Map Column */}
        <div className="contact-info-panel">
          <div className="glass-card contact-card">
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '25px' }}>Información de la Sucursal</h2>
            
            <div className="contact-item">
              <span className="contact-item-icon">📍</span>
              <div>
                <h3 className="contact-item-title">Dirección</h3>
                <p className="contact-item-desc">Av. Presidente Ibáñez 450, Puerto Montt, Región de Los Lagos, Chile</p>
              </div>
            </div>

            <div className="contact-item">
              <span className="contact-item-icon">📞</span>
              <div>
                <h3 className="contact-item-title">Teléfonos</h3>
                <p className="contact-item-desc">+56 65 2234 5678<br />+56 9 7654 3210</p>
              </div>
            </div>

            <div className="contact-item">
              <span className="contact-item-icon">✉️</span>
              <div>
                <h3 className="contact-item-title">Correos Electrónicos</h3>
                <p className="contact-item-desc">ventas@automotora.cl<br />contacto@automotora.cl</p>
              </div>
            </div>

            <div className="contact-item">
              <span className="contact-item-icon">🕒</span>
              <div>
                <h3 className="contact-item-title">Horarios de Atención</h3>
                <p className="contact-item-desc">Lunes a Viernes: 09:00 - 19:00 hrs<br />Sábado: 10:00 - 14:00 hrs</p>
              </div>
            </div>
          </div>

          {/* Simulated Dark Map */}
          <div className="contact-map-simulated">
            <div className="map-grid-pattern"></div>
            <div className="map-pulse"></div>
            <div className="map-pin"></div>
            <span className="map-text">Sucursal Puerto Montt, X Región</span>
          </div>
        </div>

        {/* Form Column */}
        <div className="glass-card contact-form-panel">
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <h2 className="form-title">Envíanos un Mensaje</h2>
              
              <div className="form-grid">
                {/* Name */}
                <div className="form-group">
                  <label htmlFor="form-name">Nombre Completo *</label>
                  <input
                    id="form-name"
                    type="text"
                    required
                    placeholder="Ej. Carlos Muñoz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="form-email">Correo Electrónico *</label>
                  <input
                    id="form-email"
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label htmlFor="form-phone">Teléfono de Contacto *</label>
                  <input
                    id="form-phone"
                    type="tel"
                    required
                    placeholder="Ej. +56 9 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* Vehículo de Interés */}
                <div className="form-group">
                  <label htmlFor="form-car">Vehículo de Interés (Opcional)</label>
                  <select
                    id="form-car"
                    value={selectedCarId}
                    onChange={(e) => {
                      setSelectedCarId(e.target.value);
                      setIsMessageManuallyEdited(false);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      padding: '12px',
                      borderRadius: '6px',
                      outline: 'none',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="" style={{ background: '#111420' }}>Ninguno / Consulta General</option>
                    {cars.map(c => (
                      <option key={c.id} value={c.id} style={{ background: '#111420' }}>
                        {c.brand} {c.model} ({c.year}) - {formatCLP(c.price)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div className="form-group form-field-full">
                  <label htmlFor="form-subject">Asunto</label>
                  <input
                    id="form-subject"
                    type="text"
                    placeholder="Ej. Consulta de Financiamiento"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                {/* Checkbox for simulator */}
                {selectedCarId && (
                  <div className="form-field-full">
                    <label className="calc-checkbox-container">
                      <input
                        type="checkbox"
                        checked={showCalculator}
                        onChange={(e) => {
                          setShowCalculator(e.target.checked);
                          setIsMessageManuallyEdited(false);
                        }}
                      />
                      <span style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 500 }}>
                        Deseo simular financiamiento para este vehículo
                      </span>
                    </label>
                  </div>
                )}

                {/* Financing simulator section */}
                {selectedCarId && showCalculator && (
                  <div className="form-field-full contact-calculator-box glass-card" style={{ padding: '20px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent)', marginBottom: '15px' }}>
                      Simulador de Financiamiento Integrado
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                      {/* Pie slider */}
                      <div className="search-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <label style={{ margin: 0, fontSize: '12px' }}>Pie: {downPaymentPercent}%</label>
                          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                            {formatCLP((cars.find(c => c.id === selectedCarId)?.price || 0) * (downPaymentPercent / 100))}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="50"
                          step="5"
                          className="calc-range"
                          value={downPaymentPercent}
                          onChange={(e) => {
                            setDownPaymentPercent(parseInt(e.target.value, 10));
                            setIsMessageManuallyEdited(false);
                          }}
                        />
                      </div>

                      {/* Plazo slider */}
                      <div className="search-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <label style={{ margin: 0, fontSize: '12px' }}>Plazo: {installments} cuotas</label>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            Financiar: {formatCLP((cars.find(c => c.id === selectedCarId)?.price || 0) * (1 - downPaymentPercent / 100))}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="12"
                          max="48"
                          step="12"
                          className="calc-range"
                          value={installments}
                          onChange={(e) => {
                            setInstallments(parseInt(e.target.value, 10));
                            setIsMessageManuallyEdited(false);
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255, 204, 0, 0.03)', border: '1px solid rgba(255, 204, 0, 0.1)', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                        Cuota Mensual Estimada
                      </span>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)' }}>
                        {formatCLP(monthlyPayment)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className="form-group form-field-full">
                  <label htmlFor="form-message">Mensaje / Consulta</label>
                  <textarea
                    id="form-message"
                    rows={6}
                    placeholder="Escribe tu consulta aquí..."
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setIsMessageManuallyEdited(true); // Stop auto-generation on manual edit
                    }}
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="gradient-btn submit-btn">
                Enviar Mensaje
              </button>
            </form>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyItems: 'center', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '20px', padding: '40px 0' }}>
              <div style={{ fontSize: '60px', animation: 'float 3s infinite' }}>✉️</div>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--accent)' }}>¡Mensaje Enviado!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', maxWidth: '380px' }}>
                Gracias por contactarte con la automotora, <strong>{name}</strong>. Tu consulta ha quedado registrada en nuestro CRM. Un asesor comercial se comunicará contigo dentro de las próximas 2 horas.
              </p>
              <button 
                type="button"
                className="secondary-btn"
                style={{ padding: '10px 24px', borderRadius: '6px', marginTop: '10px' }}
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setPhone('');
                  setSubject('');
                  setMessage('');
                  setSelectedCarId('');
                  setShowCalculator(false);
                  setIsMessageManuallyEdited(false);
                }}
              >
                Enviar Otro Mensaje
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ContactoPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '15px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,240,255,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'float 2s infinite' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Cargando formulario de contacto...</p>
      </div>
    }>
      <ContactoContent />
    </Suspense>
  );
}
