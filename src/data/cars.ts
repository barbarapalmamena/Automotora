export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number; // in CLP (Chilean Pesos)
  mileage: number; // in km
  transmission: 'Automática' | 'Manual';
  fuel: 'Bencina' | 'Diésel' | 'Híbrido' | 'Eléctrico';
  engine: string;
  hp: number;
  color: string;
  type: 'suv' | 'sedan' | 'deportivo' | 'electrico' | 'camioneta';
  image: string;
  gallery: string[];
  description: string;
  featured: boolean;
  specifications: {
    [key: string]: string;
  };
  status?: 'Disponible' | 'Reservado' | 'Vendido';
}

export const INITIAL_CARS: Car[] = [
  {
    id: '1',
    brand: 'Toyota',
    model: 'Hilux SRX 4x4',
    year: 2024,
    price: 34990000,
    mileage: 15200,
    transmission: 'Automática',
    fuel: 'Diésel',
    engine: '2.8L Turbodiésel 1GD-FTV',
    hp: 204,
    color: 'Blanco Glaciar',
    type: 'camioneta',
    image: '/pickup-hilux.png',
    gallery: ['/pickup-hilux.png', '/pickup-ranger.png', '/pickup-l200.png'],
    description: 'La Toyota Hilux SRX 4x4 es la camioneta de referencia en Chile por su legendaria fiabilidad, resistencia y alto valor de reventa. Equipada con el potente motor 2.8L Turbodiésel de 204 HP, tracción 4x4 reducible (High/Low), caja automática de 6 marchas, interior de cuero premium, climatizador bizona, sistema de audio JBL de alta fidelidad, y el paquete de seguridad activa Toyota Safety Sense.',
    featured: true,
    specifications: {
      'Tracción': '4x4 Part-Time con reductora y bloqueo diferencial trasero',
      'Consumo Mixto': '11.8 km/L',
      'Capacidad de Carga': '1.010 kg',
      'Seguridad': '7 Airbags, Control de Estabilidad, Toyota Safety Sense',
      'Equipamiento Destacado': 'Asientos con ventilación, pantalla táctil 9" con CarPlay/Android Auto',
      'Garantía': 'Revisión técnica certificada en 150 puntos'
    },
    status: 'Disponible'
  },
  {
    id: '2',
    brand: 'Ford',
    model: 'Ranger Limited V6 4x4',
    year: 2024,
    price: 41990000,
    mileage: 8500,
    transmission: 'Automática',
    fuel: 'Diésel',
    engine: '3.0L V6 Turbodiésel Panther',
    hp: 250,
    color: 'Gris Grafito',
    type: 'camioneta',
    image: '/pickup-ranger.png',
    gallery: ['/pickup-ranger.png', '/pickup-hilux.png', '/pickup-l200.png'],
    description: 'La Ford Ranger Limited V6 representa la nueva generación de camionetas medianas premium. Su motor V6 Turbodiésel de 3.0L entrega una potencia colosal de 250 HP y 600 Nm de torque, gestionado por una caja automática de 10 velocidades. Incorpora tracción 4WD inteligente, una pantalla vertical gigante de 12 pulgadas con SYNC 4, panel de instrumentos digital, llantas aro 20 y un equipamiento de seguridad autónoma de nivel 2.',
    featured: true,
    specifications: {
      'Torque Máximo': '600 Nm @ 1750 rpm',
      'Transmisión': 'Automática de 10 velocidades con E-Shifter',
      'Tracción': '4WD Inteligente con gestión de terrenos',
      'Panel de Instrumentos': 'Digital de 8" + Pantalla Central Vertical de 12"',
      'Capacidad de Remolque': '3.500 kg',
      'Seguridad Activa': 'Frenado autónomo de emergencia, control crucero adaptativo Stop&Go'
    },
    status: 'Disponible'
  },
  {
    id: '3',
    brand: 'Mercedes-Benz',
    model: 'GLA 200 DCT Premium',
    year: 2023,
    price: 28990000,
    mileage: 22000,
    transmission: 'Automática',
    fuel: 'Bencina',
    engine: '1.3L Turbo 4 Cilindros',
    hp: 163,
    color: 'Negro Cosmos Metálico',
    type: 'suv',
    image: '/suv-luxury.png',
    gallery: ['/suv-luxury.png', '/pickup-hilux.png', '/pickup-ranger.png'],
    description: 'El Mercedes-Benz GLA 200 es un SUV compacto premium que destaca por su diseño vanguardista, habitabilidad superior y deportividad. Su motor turbo eficiente entrega 163 HP con un excelente rendimiento de combustible. El interior cuenta con el sistema de doble pantalla digital MBUX con inteligencia artificial "Hey Mercedes", techo solar panorámico doble, portón trasero eléctrico, iluminación ambiental personalizable de 64 colores y tapicería en cuero Ártico.',
    featured: true,
    specifications: {
      'Consumo Mixto': '15.4 km/L',
      'Caja de Cambios': 'Automática de doble embrague 7G-DCT',
      'Maletero': '435 Litros regulable',
      'Faros': 'Tecnología LED High Performance',
      'Sistema Multimedia': 'MBUX de 10.25" con control por voz natural',
      'Seguridad': 'Frenado activo de emergencia, detector de fatiga, 7 Airbags'
    },
    status: 'Reservado'
  },
  {
    id: '4',
    brand: 'Mitsubishi',
    model: 'L200 Katana CRT 4x4',
    year: 2023,
    price: 24990000,
    mileage: 32000,
    transmission: 'Manual',
    fuel: 'Diésel',
    engine: '2.4L High Power MIVEC Turbodiésel',
    hp: 178,
    color: 'Gris Metálico',
    type: 'camioneta',
    image: '/pickup-l200.png',
    gallery: ['/pickup-l200.png', '/pickup-hilux.png', '/pickup-ranger.png'],
    description: 'La Mitsubishi L200 Katana CRT es la reina indiscutida del trabajo y la minería en Chile debido a su chasis reforzado y su óptima economía. Cuenta con el motor 2.4L MIVEC de aluminio de alta potencia con 178 HP, transmisión manual de 6 velocidades muy robusta, y el sistema de tracción Easy Select 4WD para sortear cualquier terreno en las complejas rutas del sur de Chile.',
    featured: false,
    specifications: {
      'Tracción': 'Easy Select 4WD con selector rápido',
      'Consumo Mixto': '12.9 km/L',
      'Suspensión Trasera': 'Eje rígido con ballestas reforzadas',
      'Capacidad de Carga': '1.050 kg',
      'Equipamiento': 'Aire acondicionado, alzavidrios eléctricos, cierre centralizado',
      'Origen': 'Fabricada en Tailandia con calidad de exportación global'
    },
    status: 'Disponible'
  },
  {
    id: '5',
    brand: 'Tesla',
    model: 'Model 3 Highland RWD',
    year: 2024,
    price: 31990000,
    mileage: 12000,
    transmission: 'Automática',
    fuel: 'Eléctrico',
    engine: 'Motor Eléctrico Síncrono',
    hp: 283,
    color: 'Azul Ultra Metálico',
    type: 'electrico',
    image: '/electric-sedan.png',
    gallery: ['/electric-sedan.png', '/suv-luxury.png'],
    description: 'El Tesla Model 3 Highland representa la vanguardia de la movilidad eléctrica. Con un coeficiente aerodinámico optimizado, ofrece una insonorización de cabina de nivel superior, pantalla central de 15.4 pulgadas con control total de funciones, pantalla trasera para pasajeros, autonomía estimada de hasta 513 km (WLTP) y el sistema de piloto automático Autopilot de Tesla. Carga rápida compatible con la red nacional.',
    featured: false,
    specifications: {
      'Autonomía WLTP': 'Hasta 513 km',
      'Aceleración 0-100 km/h': '6.1 segundos',
      'Seguridad': '5 Estrellas Euro NCAP, Autopilot, 8 airbags',
      'Carga Rápida': 'Hasta 170 kW en corriente continua',
      'Pantallas': 'Principal de 15.4" + Trasera de 8"'
    },
    status: 'Disponible'
  },
  {
    id: '6',
    brand: 'Mazda',
    model: 'MX-5 RF Coupe Premium',
    year: 2023,
    price: 27990000,
    mileage: 14000,
    transmission: 'Manual',
    fuel: 'Bencina',
    engine: '2.0L SkyActiv-G 4 Cilindros',
    hp: 181,
    color: 'Rojo Alma Cristal',
    type: 'deportivo',
    image: '/sports-red.png',
    gallery: ['/sports-red.png', '/hero-sports.png'],
    description: 'El Mazda MX-5 RF Coupe (Retractable Fastback) es la expresión pura del Jinba-Ittai: la unión del conductor con el auto. Equipado con el aclamado motor 2.0L atmosférico de giro rápido, transmisión manual corta de 6 marchas, tracción trasera con diferencial de deslizamiento limitado (LSD), y un techo rígido retráctil eléctrico que se pliega en solo 13 segundos. Ideal para puristas.',
    featured: false,
    specifications: {
      'Transmisión': 'Manual de 6 velocidades de tiro corto',
      'Tracción': 'Trasera (RWD) con Diferencial Autoblocante (LSD)',
      'Distribución de Peso': '50:50 perfecta entre ambos ejes',
      'Equipamiento': 'Sistema de sonido Bose con parlantes en apoyacabezas, Apple CarPlay inalámbrico',
      'Techo': 'Rígido retráctil eléctrico'
    },
    status: 'Vendido'
  }
];

// Helper to format currency
export function formatCLP(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(value);
}
