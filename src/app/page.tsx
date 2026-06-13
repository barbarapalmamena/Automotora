'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { INITIAL_CARS, Car, formatCLP } from '@/data/cars';

export default function Home() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [searchBrand, setSearchBrand] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchPrice, setSearchPrice] = useState('');

  // Load cars from localStorage if available
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
      localStorage.setItem('automotora_cars', JSON.stringify(INITIAL_CARS));
    }
  }, []);

  const featuredCars = cars.filter(car => car.featured).slice(0, 3);

  // Extract unique brands
  const uniqueBrands = Array.from(new Set(cars.map(car => car.brand)));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let query = '?';
    if (searchBrand) query += `brand=${searchBrand}&`;
    if (searchType) query += `type=${searchType}&`;
    if (searchPrice) query += `maxPrice=${searchPrice}&`;
    
    query = query.replace(/[&?]$/, '');
    router.push(`/catalog${query}`);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <div className="hero-text">
            <span className="badge">Líderes en la X Región • Puerto Montt</span>
            <h1 className="hero-title">
              Consigue tu Próximo <span className="gradient-text">Vehículo 4x4</span>
            </h1>
            <p className="hero-desc">
              Expertos en pickups, camionetas de trabajo y SUVs familiares en el sur de Chile. Todos nuestros autos cuentan con revisión técnica exhaustiva y nuestra exclusiva <strong>Garantía Ética de 7 días</strong>.
            </p>
            <div className="hero-actions">
              <Link href="/catalog" className="gradient-btn hero-btn">
                Ver Catálogo
              </Link>
              <Link href="/contacto" className="secondary-btn hero-btn">
                Hablar con Asesor
              </Link>
            </div>
          </div>
          <div className="hero-image-container">
            <div className="hero-glow"></div>
            <Image 
              src="/pickup-hilux.png" 
              alt="Toyota Hilux 4x4 en el sur de Chile" 
              width={650}
              height={380}
              className="hero-img"
              priority
            />
          </div>
        </div>
      </section>

      {/* Quick Search Bar */}
      <section className="search-container">
        <form onSubmit={handleSearchSubmit} className="glass-card search-bar">
          <div className="search-group">
            <label htmlFor="search-brand">Marca</label>
            <select 
              id="search-brand"
              className="search-input"
              value={searchBrand}
              onChange={(e) => setSearchBrand(e.target.value)}
            >
              <option value="">Todas las marcas</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div className="search-group">
            <label htmlFor="search-type">Categoría</label>
            <select 
              id="search-type"
              className="search-input"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              <option value="camioneta">Camionetas 4x4</option>
              <option value="suv">SUVs</option>
              <option value="sedan">Sedanes</option>
              <option value="electrico">Eléctricos</option>
            </select>
          </div>

          <div className="search-group">
            <label htmlFor="search-price">Presupuesto Máximo</label>
            <select 
              id="search-price"
              className="search-input"
              value={searchPrice}
              onChange={(e) => setSearchPrice(e.target.value)}
            >
              <option value="">Sin límite</option>
              <option value="20000000">Hasta $20.000.000</option>
              <option value="30000000">Hasta $30.000.000</option>
              <option value="40000000">Hasta $40.000.000</option>
              <option value="50000000">Hasta $50.000.000</option>
            </select>
          </div>

          <button type="submit" className="gradient-btn search-btn">
            <span>🔍</span> Buscar Auto
          </button>
        </form>
      </section>

      {/* Categories Grid */}
      <section className="section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <span className="section-subtitle">Filtro Rápido</span>
            <h2 className="section-title">Encuentra tu Estilo de Conducción</h2>
          </div>
          <Link href="/catalog" className="view-all-link">
            Ver todo el inventario <span>&rarr;</span>
          </Link>
        </div>

        <div className="categories-grid">
          <div className="glass-card category-card" onClick={() => router.push('/catalog?type=camioneta')}>
            <div className="category-icon">🛻</div>
            <h3 className="category-name">Camionetas 4x4</h3>
            <span className="category-count">Trabajo y Aventura</span>
          </div>

          <div className="glass-card category-card" onClick={() => router.push('/catalog?type=suv')}>
            <div className="category-icon">🚙</div>
            <h3 className="category-name">SUVs Familiares</h3>
            <span className="category-count">Confort en Ruta</span>
          </div>

          <div className="glass-card category-card" onClick={() => router.push('/catalog?type=sedan')}>
            <div className="category-icon">🚗</div>
            <h3 className="category-name">Sedanes</h3>
            <span className="category-count">Eficiencia Urbana</span>
          </div>

          <div className="glass-card category-card" onClick={() => router.push('/catalog?type=electrico')}>
            <div className="category-icon">⚡</div>
            <h3 className="category-name">Eléctricos</h3>
            <span className="category-count">Tecnología Sustentable</span>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <span className="section-subtitle">Calidad Garantizada</span>
            <h2 className="section-title">Vehículos Destacados</h2>
          </div>
          <Link href="/catalog" className="view-all-link">
            Ver catálogo completo <span>&rarr;</span>
          </Link>
        </div>

        <div className="cars-grid">
          {featuredCars.map((car) => (
            <article key={car.id} className={`car-card ${car.status === 'Vendido' ? 'sold-car' : ''}`}>
              <div className="car-img-wrapper">
                <span className="car-tag">{car.fuel}</span>
                {car.status && (
                  <span className={`status-badge status-${car.status === 'Disponible' ? 'available' : car.status === 'Reservado' ? 'reserved' : 'sold'}`}>
                    {car.status}
                  </span>
                )}
                <Image 
                  src={car.image} 
                  alt={`${car.brand} ${car.model}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="car-card-img"
                />
              </div>
              
              <div className="car-content">
                <div className="car-header">
                  <div className="car-title-group">
                    <span className="car-brand">{car.brand}</span>
                    <h3 className="car-model-name">{car.model}</h3>
                  </div>
                  <span className="car-year">{car.year}</span>
                </div>

                <div className="car-specs-grid">
                  <div className="car-spec-item">
                    <span className="car-spec-val">{car.transmission}</span>
                    <span className="car-spec-lbl">Transmisión</span>
                  </div>
                  <div className="car-spec-item">
                    <span className="car-spec-val">{car.mileage.toLocaleString()} km</span>
                    <span className="car-spec-lbl">Kilometraje</span>
                  </div>
                  <div className="car-spec-item">
                    <span className="car-spec-val">{car.hp} HP</span>
                    <span className="car-spec-lbl">Potencia</span>
                  </div>
                </div>

                <div className="car-header" style={{ alignItems: 'center', marginBottom: '20px' }}>
                  <span className="car-price">{formatCLP(car.price)}</span>
                </div>

                <div className="car-card-actions">
                  <Link href={`/catalog/${car.id}`} className="gradient-btn car-card-btn">
                    Ver Detalles
                  </Link>
                  {car.status === 'Vendido' ? (
                    <button type="button" disabled className="secondary-btn car-card-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                      Vendido
                    </button>
                  ) : (
                    <Link href={`/contacto?car=${car.brand}-${car.model}`} className="secondary-btn car-card-btn">
                      Cotizar
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Brand Values / Why Choose Us */}
      <section className="section" style={{ marginBottom: '120px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className="section-subtitle">Nuestra Garantía</span>
          <h2 className="section-title">Haz que tu decisión sea más sencilla</h2>
        </div>

        <div className="values-grid">
          <div className="glass-card" style={{ padding: '40px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ fontSize: '40px' }}>🛡️</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Garantía Ética de 7 Días</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
              Si tu vehículo presenta algún problema técnico o detalle preexistente en la primera semana, lo reparamos sin costo alguno para ti. Compra con total seguridad.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '40px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ fontSize: '40px' }}>🔧</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Inspección Rigurosa</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
              Todos nuestros autos son revisados exhaustivamente por mecánicos calificados. Verificamos historial legal, motor y sistemas de seguridad al 100%.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '40px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ fontSize: '40px' }}>💳</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Opciones a Tu Medida</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
              Te ofrecemos múltiples opciones de pago, recibimos tu auto en parte de pago y gestionamos tu crédito automotriz con tasas preferenciales en minutos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
