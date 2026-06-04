'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { INITIAL_CARS, Car, formatCLP } from '@/data/cars';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Payment {
  id: string;
  carId: string;
  carName: string;
  amount: number;
  method: 'webpay' | 'transferencia' | 'financiamiento';
  mode: 'contado' | 'reserva';
  status: 'completado' | 'pendiente';
  buyerName: string;
  buyerRut: string;
  buyerEmail: string;
  buyerPhone: string;
  date: string;
  downpayment?: number;
  months?: number;
}

type PaymentMethod = 'webpay' | 'transferencia' | 'financiamiento';
type Step = 1 | 2 | 3 | 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateTxnCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TXN-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function formatRut(value: string): string {
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}

// ─── Card visual component ────────────────────────────────────────────────────
function CreditCardUI({ number, name, expiry }: { number: string; name: string; expiry: string }) {
  const displayNumber = number.replace(/\D/g, '').padEnd(16, '·').replace(/(.{4})/g, '$1 ').trim();
  return (
    <div className="credit-card-ui">
      <div className="credit-card-top">
        <div className="credit-card-chip">
          <div className="chip-line" /><div className="chip-line" /><div className="chip-line" />
        </div>
        <svg className="credit-card-wifi" viewBox="0 0 24 24" width="22" height="22" fill="rgba(255,255,255,0.6)">
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
        </svg>
      </div>
      <div className="credit-card-number">{displayNumber}</div>
      <div className="credit-card-bottom">
        <div>
          <span className="credit-card-label">TITULAR</span>
          <span className="credit-card-value">{name || 'NOMBRE APELLIDO'}</span>
        </div>
        <div>
          <span className="credit-card-label">VENCE</span>
          <span className="credit-card-value">{expiry || 'MM/AA'}</span>
        </div>
        <div className="credit-card-brand">
          <div className="brand-circle brand-left" />
          <div className="brand-circle brand-right" />
        </div>
      </div>
    </div>
  );
}

// ─── Inner page using useSearchParams ─────────────────────────────────────────
interface PageProps {
  params: Promise<{ id: string }>;
}

function CheckoutInner({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') || 'contado') as 'contado' | 'reserva';
  const initDownpayment = Number(searchParams.get('downpayment') || 30);
  const initMonths = Number(searchParams.get('months') || 36);

  const [car, setCar] = useState<Car | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  // Buyer info
  const [buyerName, setBuyerName] = useState('');
  const [buyerRut, setBuyerRut] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  // Card info
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardFlipped, setCardFlipped] = useState(false);

  // Transfer info
  const [transferRef, setTransferRef] = useState('');

  // Financing
  const [downpaymentPct, setDownpaymentPct] = useState(initDownpayment);
  const [months, setMonths] = useState(initMonths);

  // Result
  const [txnCode, setTxnCode] = useState('');
  const [processingDots, setProcessingDots] = useState('.');

  useEffect(() => {
    const saved = localStorage.getItem('automotora_cars');
    let carList = INITIAL_CARS;
    if (saved) {
      try { carList = JSON.parse(saved); } catch { carList = INITIAL_CARS; }
    }
    const found = carList.find(c => c.id === id);
    if (found) {
      setCar(found);
    } else {
      router.push('/catalog');
    }
  }, [id, router]);

  // Animate processing dots
  useEffect(() => {
    if (step !== 3) return;
    const interval = setInterval(() => {
      setProcessingDots(d => d.length >= 3 ? '.' : d + '.');
    }, 400);
    const timer = setTimeout(() => {
      clearInterval(interval);
      const code = generateTxnCode();
      setTxnCode(code);
      // Save payment
      if (car) {
        const payment: Payment = {
          id: code,
          carId: car.id,
          carName: `${car.brand} ${car.model} ${car.year}`,
          amount: selectedMethod === 'financiamiento'
            ? Math.round(car.price * (downpaymentPct / 100))
            : car.price,
          method: selectedMethod!,
          mode,
          status: selectedMethod === 'transferencia' ? 'pendiente' : 'completado',
          buyerName,
          buyerRut,
          buyerEmail,
          buyerPhone,
          date: new Date().toISOString(),
          downpayment: selectedMethod === 'financiamiento' ? downpaymentPct : undefined,
          months: selectedMethod === 'financiamiento' ? months : undefined,
        };
        const existing = JSON.parse(localStorage.getItem('automotora_payments') || '[]');
        localStorage.setItem('automotora_payments', JSON.stringify([payment, ...existing]));

        // Update car status
        const carsSaved = JSON.parse(localStorage.getItem('automotora_cars') || '[]');
        const newStatus = mode === 'contado' && selectedMethod !== 'financiamiento' ? 'Vendido' : 'Reservado';
        const updatedCars = carsSaved.map((c: Car) =>
          c.id === car.id ? { ...c, status: newStatus } : c
        );
        localStorage.setItem('automotora_cars', JSON.stringify(updatedCars));
      }
      setStep(4);
    }, 2800);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [step]);

  if (!car) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '15px' }}>
        <div className="checkout-spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>Cargando información del vehículo...</p>
      </div>
    );
  }

  const isAvailable = !car.status || car.status === 'Disponible';
  if (!isAvailable) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '40px', maxWidth: '420px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '48px' }}>{car.status === 'Vendido' ? '🚫' : '⚠️'}</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Vehículo no disponible</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            El {car.brand} {car.model} está actualmente <strong style={{ color: car.status === 'Vendido' ? 'var(--danger)' : 'var(--accent)' }}>{car.status}</strong>.
            No es posible procesar un pago en este momento.
          </p>
          <Link href="/catalog" className="gradient-btn" style={{ padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
            Ver otros vehículos
          </Link>
        </div>
      </div>
    );
  }

  const downpaymentAmount = Math.round(car.price * (downpaymentPct / 100));
  const loanAmount = car.price - downpaymentAmount;
  const monthlyRate = 0.012;
  const emi = Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1));
  const payAmount = selectedMethod === 'financiamiento' ? downpaymentAmount : car.price;

  // ── Step 1: Choose method ──────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="checkout-step animate-fade-in">
      <h2 className="checkout-step-title">Selecciona el método de pago</h2>
      <p className="checkout-step-sub">Elige cómo quieres pagar tu {car.brand} {car.model}</p>

      <div className="payment-methods-grid">

        {/* WebPay Plus */}
        <button
          type="button"
          className={`payment-method-card ${selectedMethod === 'webpay' ? 'selected' : ''}`}
          onClick={() => setSelectedMethod('webpay')}
        >
          <div className="payment-method-icon">
            <svg viewBox="0 0 48 48" width="40" height="40">
              <rect width="48" height="48" rx="8" fill="#1a1a2e" />
              <rect x="4" y="14" width="40" height="8" rx="2" fill="#00aaff" />
              <rect x="4" y="26" width="14" height="8" rx="2" fill="rgba(255,255,255,0.3)" />
              <rect x="22" y="26" width="10" height="8" rx="2" fill="rgba(255,255,255,0.2)" />
            </svg>
          </div>
          <div className="payment-method-info">
            <span className="payment-method-name">WebPay Plus</span>
            <span className="payment-method-desc">Tarjeta débito o crédito · Transbank</span>
          </div>
          <div className="payment-method-badges">
            <span className="pay-badge">🔒 Seguro</span>
            <span className="pay-badge pay-badge-green">Inmediato</span>
          </div>
          {selectedMethod === 'webpay' && <div className="payment-selected-check">✓</div>}
        </button>

        {/* Transferencia Bancaria */}
        <button
          type="button"
          className={`payment-method-card ${selectedMethod === 'transferencia' ? 'selected' : ''}`}
          onClick={() => setSelectedMethod('transferencia')}
        >
          <div className="payment-method-icon">
            <svg viewBox="0 0 48 48" width="40" height="40">
              <rect width="48" height="48" rx="8" fill="#1a1a2e" />
              <path d="M24 8L40 18H8L24 8Z" fill="#ffcc00" />
              <rect x="10" y="20" width="6" height="14" rx="1" fill="rgba(255,255,255,0.5)" />
              <rect x="21" y="20" width="6" height="14" rx="1" fill="rgba(255,255,255,0.5)" />
              <rect x="32" y="20" width="6" height="14" rx="1" fill="rgba(255,255,255,0.5)" />
              <rect x="8" y="36" width="32" height="3" rx="1" fill="rgba(255,255,255,0.3)" />
            </svg>
          </div>
          <div className="payment-method-info">
            <span className="payment-method-name">Transferencia Bancaria</span>
            <span className="payment-method-desc">Banco Estado, BCI, Santander, Scotiabank</span>
          </div>
          <div className="payment-method-badges">
            <span className="pay-badge">Sin comisión</span>
            <span className="pay-badge pay-badge-yellow">1–2 días hábiles</span>
          </div>
          {selectedMethod === 'transferencia' && <div className="payment-selected-check">✓</div>}
        </button>

        {/* Pie + Financiamiento */}
        <button
          type="button"
          className={`payment-method-card ${selectedMethod === 'financiamiento' ? 'selected' : ''}`}
          onClick={() => setSelectedMethod('financiamiento')}
        >
          <div className="payment-method-icon">
            <svg viewBox="0 0 48 48" width="40" height="40">
              <rect width="48" height="48" rx="8" fill="#1a1a2e" />
              <path d="M8 36 L18 20 L28 28 L40 12" stroke="#00c6a7" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="18" cy="20" r="3" fill="#00c6a7" />
              <circle cx="28" cy="28" r="3" fill="#00c6a7" />
              <circle cx="40" cy="12" r="3" fill="#00c6a7" />
            </svg>
          </div>
          <div className="payment-method-info">
            <span className="payment-method-name">Pie + Financiamiento</span>
            <span className="payment-method-desc">Paga el pie ahora, financia el resto en cuotas</span>
          </div>
          <div className="payment-method-badges">
            <span className="pay-badge">Desde {formatCLP(Math.round(car.price * 0.20))}</span>
            <span className="pay-badge pay-badge-green">Flexible</span>
          </div>
          {selectedMethod === 'financiamiento' && <div className="payment-selected-check">✓</div>}
        </button>

      </div>

      <div className="checkout-summary-box">
        <div className="checkout-summary-row">
          <span>Vehículo</span>
          <span>{car.brand} {car.model} ({car.year})</span>
        </div>
        <div className="checkout-summary-row">
          <span>Tipo de operación</span>
          <span style={{ color: mode === 'contado' ? 'var(--success)' : 'var(--accent)' }}>
            {mode === 'contado' ? '💵 Compra al Contado' : '🔖 Reserva con Pie'}
          </span>
        </div>
        <div className="checkout-summary-row checkout-summary-total">
          <span>Precio de venta</span>
          <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{formatCLP(car.price)}</span>
        </div>
      </div>

      <button
        type="button"
        className="gradient-btn checkout-continue-btn"
        disabled={!selectedMethod}
        onClick={() => setStep(2)}
      >
        Continuar →
      </button>
    </div>
  );

  // ── Step 2: Fill form ──────────────────────────────────────────────────────
  const renderStep2 = () => {
    const isFormValid = buyerName && buyerRut.length >= 9 && buyerEmail.includes('@') && buyerPhone;

    return (
      <div className="checkout-step animate-fade-in">
        <h2 className="checkout-step-title">
          {selectedMethod === 'webpay' ? '💳 Pago con WebPay Plus' :
           selectedMethod === 'transferencia' ? '🏦 Transferencia Bancaria' :
           '📋 Solicitud de Financiamiento'}
        </h2>
        <p className="checkout-step-sub">Completa tus datos para procesar la operación</p>

        <div className="checkout-form-grid">

          {/* Left: Buyer info (always shown) */}
          <div className="checkout-form-section">
            <h3 className="form-section-title">Datos del Comprador</h3>

            <div className="form-group">
              <label>Nombre Completo *</label>
              <input type="text" placeholder="Ej: Juan Pérez González" value={buyerName}
                onChange={e => { setBuyerName(e.target.value); setCardName(e.target.value.toUpperCase()); }} />
            </div>
            <div className="form-group">
              <label>RUT *</label>
              <input type="text" placeholder="12.345.678-9" value={buyerRut}
                onChange={e => setBuyerRut(formatRut(e.target.value))} maxLength={12} />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" placeholder="correo@email.cl" value={buyerEmail}
                onChange={e => setBuyerEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Teléfono *</label>
              <input type="tel" placeholder="+56 9 1234 5678" value={buyerPhone}
                onChange={e => setBuyerPhone(e.target.value)} />
            </div>
          </div>

          {/* Right: Method-specific */}
          <div className="checkout-form-section">

            {/* WebPay: Card form */}
            {selectedMethod === 'webpay' && (
              <>
                <h3 className="form-section-title">Datos de Tarjeta</h3>
                <CreditCardUI number={cardNumber} name={cardName} expiry={cardExpiry} />
                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label>Número de Tarjeta</label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()}
                    onChange={e => setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))}
                    maxLength={19}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Vencimiento</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={cardExpiry}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, '');
                        if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                        setCardExpiry(v);
                      }}
                      maxLength={5}
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardCVV}
                      onChange={e => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      onFocus={() => setCardFlipped(true)}
                      onBlur={() => setCardFlipped(false)}
                    />
                  </div>
                </div>
                <div className="webpay-security-note">
                  🔒 Pago procesado de forma segura por <strong>Transbank WebPay Plus</strong>.
                  Tus datos no se almacenan en nuestros servidores.
                </div>
              </>
            )}

            {/* Transfer: Bank details */}
            {selectedMethod === 'transferencia' && (
              <>
                <h3 className="form-section-title">Datos para Transferencia</h3>
                <div className="bank-details-card">
                  <div className="bank-detail-row">
                    <span className="bank-detail-label">Banco</span>
                    <span className="bank-detail-value">Banco Estado</span>
                  </div>
                  <div className="bank-detail-row">
                    <span className="bank-detail-label">Tipo de Cuenta</span>
                    <span className="bank-detail-value">Cuenta Corriente</span>
                  </div>
                  <div className="bank-detail-row">
                    <span className="bank-detail-label">N° de Cuenta</span>
                    <span className="bank-detail-value copy-value">00-123456-78</span>
                  </div>
                  <div className="bank-detail-row">
                    <span className="bank-detail-label">RUT Empresa</span>
                    <span className="bank-detail-value copy-value">76.543.210-K</span>
                  </div>
                  <div className="bank-detail-row">
                    <span className="bank-detail-label">Razón Social</span>
                    <span className="bank-detail-value">Automotora SpA Puerto Montt</span>
                  </div>
                  <div className="bank-detail-row">
                    <span className="bank-detail-label">Email Confirmación</span>
                    <span className="bank-detail-value">pagos@automotora.cl</span>
                  </div>
                  <div className="bank-detail-row bank-total-row">
                    <span className="bank-detail-label">MONTO A TRANSFERIR</span>
                    <span className="bank-detail-value" style={{ color: 'var(--accent)', fontWeight: 800 }}>{formatCLP(car.price)}</span>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Código de Referencia (escribe el número del vehículo)</label>
                  <input type="text" placeholder={`REF-${car.brand.toUpperCase()}-${car.id}`}
                    value={transferRef} onChange={e => setTransferRef(e.target.value)} />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '8px' }}>
                  ⚠️ Tu reserva quedará <strong>pendiente de confirmación</strong> hasta verificar tu transferencia (1-2 días hábiles).
                  Recibirás un email de confirmación en {buyerEmail || 'tu correo'}.
                </p>
              </>
            )}

            {/* Financing: Pie form */}
            {selectedMethod === 'financiamiento' && (
              <>
                <h3 className="form-section-title">Configurar Financiamiento</h3>
                <div className="financing-slider-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label>Pie / Enganche ({downpaymentPct}%)</label>
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatCLP(downpaymentAmount)}</span>
                  </div>
                  <input type="range" className="calc-range" min={20} max={50} step={5}
                    value={downpaymentPct} onChange={e => setDownpaymentPct(Number(e.target.value))} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span>20%</span><span>50%</span>
                  </div>
                </div>
                <div className="financing-slider-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label>Plazo ({months} meses)</label>
                    <span style={{ fontWeight: 700 }}>Financiar: {formatCLP(loanAmount)}</span>
                  </div>
                  <input type="range" className="calc-range" min={12} max={48} step={12}
                    value={months} onChange={e => setMonths(Number(e.target.value))} />
                </div>
                <div className="financing-result-box">
                  <span>Cuota mensual estimada</span>
                  <strong style={{ color: 'var(--success)', fontSize: '22px' }}>{formatCLP(emi)}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tasa 1.2% mensual — sujeto a evaluación</span>
                </div>
                <div className="bank-detail-row bank-total-row" style={{ marginTop: '12px' }}>
                  <span>PAGO HOY (PIE)</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{formatCLP(downpaymentAmount)}</span>
                </div>
              </>
            )}

          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button type="button" className="secondary-btn" onClick={() => setStep(1)}
            style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)' }}>
            ← Volver
          </button>
          <button
            type="button"
            className="gradient-btn"
            disabled={!isFormValid}
            onClick={() => setStep(3)}
            style={{ flex: 2, padding: '14px', borderRadius: '10px' }}
          >
            {selectedMethod === 'webpay' ? '🔒 Pagar con WebPay' :
             selectedMethod === 'transferencia' ? '✅ Confirmar Datos' :
             '📋 Enviar Solicitud'}
          </button>
        </div>
      </div>
    );
  };

  // ── Step 3: Processing ─────────────────────────────────────────────────────
  const renderStep3 = () => (
    <div className="checkout-step animate-fade-in" style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div className="processing-ring">
        <div className="processing-ring-inner">
          {selectedMethod === 'webpay' ? '💳' : selectedMethod === 'transferencia' ? '🏦' : '📋'}
        </div>
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, marginTop: '32px', marginBottom: '12px' }}>
        Procesando pago{processingDots}
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '320px', margin: '0 auto' }}>
        {selectedMethod === 'webpay'
          ? 'Conectando con Transbank WebPay Plus. Por favor no cierres esta ventana.'
          : selectedMethod === 'transferencia'
          ? 'Registrando tu solicitud de transferencia bancaria.'
          : 'Enviando tu solicitud de financiamiento al banco asociado.'}
      </p>
      <div className="processing-steps">
        <div className="processing-step done">✓ Verificando datos del comprador</div>
        <div className="processing-step done">✓ Validando vehículo disponible</div>
        <div className={`processing-step ${processingDots.length >= 2 ? 'done' : 'active'}`}>
          {processingDots.length >= 2 ? '✓' : '⟳'} Procesando transacción segura
        </div>
        <div className={`processing-step ${processingDots.length >= 3 ? 'active' : 'pending'}`}>
          {processingDots.length >= 3 ? '⟳' : '○'} Confirmando operación
        </div>
      </div>
    </div>
  );

  // ── Step 4: Success ────────────────────────────────────────────────────────
  const renderStep4 = () => {
    const isTransfer = selectedMethod === 'transferencia';
    return (
      <div className="checkout-step animate-fade-in" style={{ textAlign: 'center' }}>
        <div className="success-icon-wrapper">
          <div className="success-icon">{isTransfer ? '⏳' : '✅'}</div>
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: 800, marginTop: '24px', marginBottom: '8px' }}>
          {isTransfer ? '¡Reserva Registrada!' : '¡Pago Exitoso!'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
          {isTransfer
            ? 'Tu reserva queda pendiente de confirmación hasta verificar la transferencia (1–2 días hábiles).'
            : `Tu ${selectedMethod === 'financiamiento' ? 'solicitud de financiamiento' : 'pago'} fue procesado correctamente. El vehículo ha sido reservado a tu nombre.`}
        </p>

        <div className="txn-card">
          <div className="txn-header">
            <span>CÓDIGO DE TRANSACCIÓN</span>
            <strong className="txn-code">{txnCode}</strong>
          </div>
          <div className="txn-detail-row">
            <span>Vehículo</span>
            <span>{car.brand} {car.model} {car.year}</span>
          </div>
          <div className="txn-detail-row">
            <span>Comprador</span>
            <span>{buyerName}</span>
          </div>
          <div className="txn-detail-row">
            <span>RUT</span>
            <span>{buyerRut}</span>
          </div>
          <div className="txn-detail-row">
            <span>Método de pago</span>
            <span>
              {selectedMethod === 'webpay' ? 'WebPay Plus (Transbank)' :
               selectedMethod === 'transferencia' ? 'Transferencia Bancaria' :
               'Pie + Financiamiento'}
            </span>
          </div>
          <div className="txn-detail-row">
            <span>Monto procesado</span>
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>{formatCLP(payAmount)}</span>
          </div>
          {selectedMethod === 'financiamiento' && (
            <>
              <div className="txn-detail-row">
                <span>Saldo a financiar</span>
                <span>{formatCLP(loanAmount)} en {months} cuotas</span>
              </div>
              <div className="txn-detail-row">
                <span>Cuota mensual</span>
                <span style={{ color: 'var(--accent)' }}>{formatCLP(emi)} / mes</span>
              </div>
            </>
          )}
          <div className="txn-detail-row">
            <span>Estado</span>
            <span className={`txn-status ${isTransfer ? 'txn-pending' : 'txn-done'}`}>
              {isTransfer ? '⏳ Pendiente verificación' : '✅ Completado'}
            </span>
          </div>
          <div className="txn-detail-row">
            <span>Email de confirmación</span>
            <span>{buyerEmail}</span>
          </div>
          <div className="txn-detail-row">
            <span>Fecha</span>
            <span>{new Date().toLocaleString('es-CL')}</span>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '16px' }}>
          📧 Se ha enviado un comprobante de tu operación a <strong>{buyerEmail}</strong>.
          Nuestro equipo de ventas en Puerto Montt se pondrá en contacto contigo a la brevedad.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap' }}>
          <Link href="/catalog" className="secondary-btn"
            style={{ flex: 1, padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)', minWidth: '140px' }}>
            Ver más vehículos
          </Link>
          <Link href="/" className="gradient-btn"
            style={{ flex: 1, padding: '14px', borderRadius: '10px', textAlign: 'center', minWidth: '140px' }}>
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="page-header" style={{ paddingBottom: '40px' }}>
        <div className="page-header-bg" />
        <div className="page-header-content">
          <span className="section-subtitle">
            {car.brand} {car.model} {car.year} • {mode === 'contado' ? 'Compra al Contado' : 'Reserva con Pie'}
          </span>
          <h1 className="page-header-title">Proceso de Pago Seguro</h1>
          <p className="page-header-subtitle">
            Tus datos están protegidos. Operación 100% segura y encriptada.
          </p>
        </div>
      </section>

      <div className="checkout-wrapper">
        {/* Step indicators */}
        <div className="step-indicator-bar">
          {(['1', '2', '3', '4'] as const).map((s, idx) => {
            const stepNum = idx + 1;
            const labels = ['Método', 'Datos', 'Procesando', 'Confirmación'];
            const isDone = step > stepNum;
            const isActive = step === stepNum;
            return (
              <React.Fragment key={s}>
                <div className={`step-dot ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}>
                  {isDone ? '✓' : stepNum}
                  <span className="step-dot-label">{labels[idx]}</span>
                </div>
                {idx < 3 && <div className={`step-connector ${isDone ? 'done' : ''}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Car mini-summary */}
        <div className="checkout-car-summary">
          <div className="checkout-car-image-wrap">
            <Image src={car.image} alt={car.model} fill style={{ objectFit: 'cover' }} />
          </div>
          <div className="checkout-car-info">
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{car.brand}</span>
            <strong style={{ fontSize: '18px' }}>{car.model} {car.year}</strong>
            <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '20px' }}>{formatCLP(car.price)}</span>
          </div>
        </div>

        {/* Step content */}
        <div className="checkout-content">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </div>
    </div>
  );
}

// ─── Exported page with Suspense ───────────────────────────────────────────────
export default function CheckoutPage({ params }: PageProps) {
  const [id, setId] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  if (!id) return null;

  return (
    <Suspense fallback={
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="checkout-spinner" />
      </div>
    }>
      <CheckoutInner id={id} />
    </Suspense>
  );
}
