'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { INITIAL_CARS, Car, formatCLP } from '@/data/cars';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CarDetailPage({ params }: PageProps) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  const [car, setCar] = useState<Car | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  
  // Calculator State
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30); // 30% default
  const [installments, setInstallments] = useState<number>(36); // 36 months default
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);

  // Load car details
  useEffect(() => {
    const saved = localStorage.getItem('automotora_cars');
    let carList = INITIAL_CARS;
    if (saved) {
      try {
        carList = JSON.parse(saved);
      } catch (e) {
        carList = INITIAL_CARS;
      }
    }
    
    const foundCar = carList.find(c => c.id === id);
    if (foundCar) {
      setCar(foundCar);
      setActiveImage(foundCar.image);
    } else {
      router.push('/catalog');
    }
  }, [id, router]);

  // Calculate financing in real time
  useEffect(() => {
    if (!car) return;

    const downPaymentAmount = car.price * (downPaymentPercent / 100);
    const loanAmount = car.price - downPaymentAmount;
    
    // 1.2% monthly interest rate (approx 14.4% annual)
    const monthlyRate = 0.012; 
    
    // EMI Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, installments)) / 
                (Math.pow(1 + monthlyRate, installments) - 1);
                
    setMonthlyPayment(Math.round(emi));
  }, [car, downPaymentPercent, installments]);

  if (!car) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '15px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,240,255,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'float 2s infinite' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Buscando detalles del vehículo...</p>
      </div>
    );
  }

  const downPaymentValue = car.price * (downPaymentPercent / 100);
  const loanValue = car.price - downPaymentValue;

  // WhatsApp contact message with dynamic financing simulation
  let whatsappMsg = `Hola, estoy interesado en el ${car.brand} ${car.model} del año ${car.year} (Precio: ${formatCLP(car.price)}). Me gustaría financiarlo con un pie de ${downPaymentPercent}% (${formatCLP(downPaymentValue)}) y el saldo en ${installments} cuotas de ${formatCLP(monthlyPayment)} mensuales. ¿Está disponible?`;
  
  if (car.status === 'Vendido') {
    whatsappMsg = `Hola, vi el ${car.brand} ${car.model} del año ${car.year} en su web y noté que está Vendido. ¿Tienen alguna unidad similar disponible en Puerto Montt?`;
  } else if (car.status === 'Reservado') {
    whatsappMsg = `Hola, vi el ${car.brand} ${car.model} del año ${car.year} en su web y figura como Reservado. Me interesa saber si hay posibilidad de que se libere la reserva, o si tienen otro similar. ¡Muchas gracias!`;
  }

  const encodedWhatsappMsg = encodeURIComponent(whatsappMsg);
  const whatsappUrl = `https://wa.me/56976543210?text=${encodedWhatsappMsg}`;

  return (
    <div className="animate-fade-in" style={{ paddingTop: '40px' }}>
      {/* Detail Grid */}
      <main className="detail-grid">
        {/* Gallery Side */}
        <section className="detail-gallery">
          <div className="main-image-wrapper">
            <Image
              src={activeImage}
              alt={`${car.brand} ${car.model}`}
              fill
              className="main-gallery-img"
              priority
            />
          </div>

          <div className="gallery-thumbs">
            {car.gallery.map((img, idx) => (
              <div 
                key={idx}
                className={`thumb-wrapper ${activeImage === img ? 'active' : ''}`}
                onClick={() => setActiveImage(img)}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="thumb-img"
                />
              </div>
            ))}
          </div>

          {/* Detailed Description */}
          <div className="glass-card" style={{ padding: '30px', marginTop: '10px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px' }}>Descripción</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px' }}>
              {car.description}
            </p>
          </div>
        </section>

        {/* Info & Calculator Side */}
        <section className="detail-info">
          {/* Status Notices */}
          {car.status === 'Vendido' && (
            <div className="availability-notice notice-sold">
              <strong>🚫 Vehículo Vendido:</strong> Esta unidad ya fue adquirida. No está disponible para visitas o crédito, pero puedes contactarnos para consultar por ingresos similares.
            </div>
          )}
          {car.status === 'Reservado' && (
            <div className="availability-notice notice-reserved">
              <strong>⚠️ Unidad Reservada:</strong> Este vehículo se encuentra reservado temporalmente. Puedes consultar su estado por si se libera la operación.
            </div>
          )}

          {/* Header Card */}
          <div className="glass-card detail-header-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
              <span className="car-brand">{car.brand}</span>
              {car.status && (
                <span className={`status-badge status-${car.status === 'Disponible' ? 'available' : car.status === 'Reservado' ? 'reserved' : 'sold'}`} style={{ position: 'static', margin: 0 }}>
                  {car.status}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '5px 0 15px' }}>
              {car.model} <span className="car-year" style={{ fontSize: '20px' }}>({car.year})</span>
            </h1>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Precio de Venta</span>
              <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent)' }}>{formatCLP(car.price)}</span>
            </div>

            {/* Technical Specs */}
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>Especificaciones Técnicas</h2>
            <table className="detail-specs-table">
              <tbody>
                <tr>
                  <td className="spec-name">Transmisión</td>
                  <td className="spec-val">{car.transmission}</td>
                </tr>
                <tr>
                  <td className="spec-name">Kilometraje</td>
                  <td className="spec-val">{car.mileage.toLocaleString()} km</td>
                </tr>
                <tr>
                  <td className="spec-name">Combustible</td>
                  <td className="spec-val">{car.fuel}</td>
                </tr>
                <tr>
                  <td className="spec-name">Motorización</td>
                  <td className="spec-val">{car.engine}</td>
                </tr>
                <tr>
                  <td className="spec-name">Potencia</td>
                  <td className="spec-val">{car.hp} HP</td>
                </tr>
                <tr>
                  <td className="spec-name">Color Exterior</td>
                  <td className="spec-val">{car.color}</td>
                </tr>
                {Object.entries(car.specifications).map(([key, val]) => (
                  <tr key={key}>
                    <td className="spec-name">{key}</td>
                    <td className="spec-val">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculator Card */}
          <div className="glass-card calculator-card">
            <h3 className="calc-title">
              <span>📊</span> Simulador de Financiamiento
            </h3>
            
            <div className="calc-grid">
              {/* Downpayment Range */}
              <div className="calc-field">
                <div className="calc-row-values">
                  <label>Pie / Enganche ({downPaymentPercent}%)</label>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    {formatCLP(downPaymentValue)}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="50"
                  step="5"
                  className="calc-range"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(parseInt(e.target.value, 10))}
                  disabled={car.status === 'Vendido'}
                />
                <div className="calc-row-values" style={{ fontSize: '11px', marginTop: '2px' }}>
                  <span>20% (Mínimo)</span>
                  <span>50% (Máximo)</span>
                </div>
              </div>

              {/* Installments Range */}
              <div className="calc-field">
                <div className="calc-row-values">
                  <label>Plazo en Meses ({installments} cuotas)</label>
                  <span style={{ color: '#fff', fontWeight: 600 }}>
                    Monto a Financiar: {formatCLP(loanValue)}
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="48"
                  step="12"
                  className="calc-range"
                  value={installments}
                  onChange={(e) => setInstallments(parseInt(e.target.value, 10))}
                  disabled={car.status === 'Vendido'}
                />
                <div className="calc-row-values" style={{ fontSize: '11px', marginTop: '2px' }}>
                  <span>12 Meses</span>
                  <span>24 Meses</span>
                  <span>36 Meses</span>
                  <span>48 Meses</span>
                </div>
              </div>
            </div>

            {/* Monthly payment display */}
            <div className="calc-result-box" style={{ marginBottom: '20px' }}>
              <span className="calc-result-lbl">Cuota Mensual Estimada</span>
              <div className="calc-result-val">{formatCLP(monthlyPayment)}</div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '8px' }}>
                * Tasa referencial del 1.2% mensual. Sujeto a evaluación comercial.
              </span>
            </div>

            {/* Call to action buttons */}
            <div className="contact-action-box">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="whatsapp-btn"
              >
                💬 Consultar por WhatsApp
              </a>

              {car.status === 'Vendido' ? (
                <button 
                  type="button" 
                  disabled 
                  className="gradient-btn" 
                  style={{ padding: '14px', borderRadius: '10px', textAlign: 'center', fontSize: '15px', opacity: 0.5, cursor: 'not-allowed', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
                >
                  Vehículo Vendido
                </button>
              ) : car.status === 'Reservado' ? (
                <button 
                  type="button" 
                  disabled 
                  className="gradient-btn" 
                  style={{ padding: '14px', borderRadius: '10px', textAlign: 'center', fontSize: '15px', opacity: 0.5, cursor: 'not-allowed', background: 'rgba(255,204,0,0.05)', color: 'var(--text-secondary)' }}
                >
                  ⚠️ Unidad Reservada
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link 
                    href={`/checkout/${car.id}?mode=contado&downpayment=${downPaymentPercent}&months=${installments}&quota=${monthlyPayment}`}
                    className="gradient-btn"
                    style={{ padding: '14px', borderRadius: '10px', textAlign: 'center', fontSize: '15px', display: 'block' }}
                  >
                    💳 Comprar al Contado — {formatCLP(car.price)}
                  </Link>
                  <Link 
                    href={`/checkout/${car.id}?mode=reserva&downpayment=${downPaymentPercent}&months=${installments}&quota=${monthlyPayment}`}
                    style={{ 
                      display: 'block',
                      padding: '13px', 
                      borderRadius: '10px', 
                      textAlign: 'center', 
                      fontSize: '14px',
                      border: '1.5px solid rgba(255,204,0,0.35)',
                      color: 'var(--accent)',
                      background: 'rgba(255,204,0,0.05)',
                      fontWeight: 600,
                      transition: 'var(--transition)'
                    }}
                  >
                    🔖 Reservar con Pie — desde {formatCLP(Math.round(car.price * 0.20))}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
