'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { INITIAL_CARS, Car, formatCLP } from '@/data/cars';

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [maxPrice, setMaxPrice] = useState(100000000); // 100M CLP default max

  // Load cars from localStorage or fallback
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

  // Initialize filters from search query parameters
  useEffect(() => {
    if (cars.length === 0) return;

    const brandParam = searchParams.get('brand') || '';
    const typeParam = searchParams.get('type') || '';
    const maxPriceParam = searchParams.get('maxPrice') || '';

    setSelectedBrand(brandParam);
    setSelectedType(typeParam);
    if (maxPriceParam) {
      setMaxPrice(parseInt(maxPriceParam, 10));
    }
  }, [searchParams, cars]);

  // Apply filters
  useEffect(() => {
    let result = cars;

    // Search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        car => car.brand.toLowerCase().includes(search) || 
               car.model.toLowerCase().includes(search)
      );
    }

    // Brand filter
    if (selectedBrand) {
      result = result.filter(car => car.brand === selectedBrand);
    }

    // Type filter
    if (selectedType) {
      result = result.filter(car => car.type === selectedType);
    }

    // Fuel filter
    if (selectedFuel) {
      result = result.filter(car => car.fuel === selectedFuel);
    }

    // Status filter
    if (selectedStatus) {
      result = result.filter(car => (car.status || 'Disponible') === selectedStatus);
    }

    // Max Price filter
    result = result.filter(car => car.price <= maxPrice);

    setFilteredCars(result);
  }, [searchTerm, selectedBrand, selectedType, selectedFuel, selectedStatus, maxPrice, cars]);

  const uniqueBrands = Array.from(new Set(cars.map(car => car.brand)));

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('');
    setSelectedType('');
    setSelectedFuel('');
    setSelectedStatus('');
    setMaxPrice(100000000);
    router.replace('/catalog');
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-bg"></div>
        <div className="page-header-content">
          <span className="section-subtitle">Puerto Montt • X Región</span>
          <h1 className="page-header-title">Catálogo de Vehículos</h1>
          <p className="page-header-subtitle">
            Explora nuestra selección exclusiva de camionetas 4x4 y vehículos revisados con garantía de calidad y transparencia absoluta.
          </p>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="catalog-container">
        {/* Sidebar Filters */}
        <aside className="glass-card catalog-sidebar">
          <h2 className="sidebar-title">Filtros</h2>

          {/* Search Term */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="search-input">Buscar</label>
            <input
              id="search-input"
              type="text"
              placeholder="Ej. Hilux, Ranger..."
              className="filter-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Brand Filter */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="brand-select">Marca</label>
            <select
              id="brand-select"
              className="filter-select"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">Todas</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="type-select">Categoría</label>
            <select
              id="type-select"
              className="filter-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="camioneta">Camionetas 4x4</option>
              <option value="suv">SUVs</option>
              <option value="sedan">Sedanes</option>
              <option value="electrico">Eléctricos</option>
            </select>
          </div>

          {/* Fuel Filter */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="fuel-select">Combustible</label>
            <select
              id="fuel-select"
              className="filter-select"
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Bencina">Bencina</option>
              <option value="Diésel">Diésel</option>
              <option value="Híbrido">Híbrido</option>
              <option value="Eléctrico">Eléctrico</option>
            </select>
          </div>

          {/* Availability Status Filter */}
          <div className="filter-group">
            <label className="filter-label" htmlFor="status-select">Disponibilidad</label>
            <select
              id="status-select"
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Disponible">Disponible</option>
              <option value="Reservado">Reservado</option>
              <option value="Vendido">Vendido</option>
            </select>
          </div>

          {/* Max Price Range Slider */}
          <div className="filter-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="filter-label" style={{ margin: 0 }}>Precio Máximo</label>
            </div>
            <input
              type="range"
              min="15000000"
              max="100000000"
              step="5000000"
              className="calc-range"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px', color: 'var(--text-secondary)' }}>
              <span>$15M</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{formatCLP(maxPrice)}</span>
              <span>$100M</span>
            </div>
          </div>

          {/* Clear Filters Button */}
          <button 
            type="button" 
            className="clear-filters-btn" 
            onClick={handleClearFilters}
          >
            Limpiar Filtros
          </button>
        </aside>

        {/* Cars List Grid */}
        <main>
          {filteredCars.length > 0 ? (
            <div className="cars-grid">
              {filteredCars.map((car) => (
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
          ) : (
            <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              <div style={{ fontSize: '50px' }}>🔍</div>
              <h3 style={{ fontSize: '22px', fontWeight: '700' }}>Sin resultados</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '15px', lineHeight: '1.6' }}>
                No encontramos ningún vehículo que coincida con tus criterios de búsqueda. Intenta limpiando los filtros o ajustando los rangos de precio.
              </p>
              <button 
                type="button" 
                className="gradient-btn" 
                style={{ padding: '10px 24px', borderRadius: '6px' }}
                onClick={handleClearFilters}
              >
                Restablecer Búsqueda
              </button>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '15px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,240,255,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'float 2s infinite' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Cargando catálogo de vehículos...</p>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
