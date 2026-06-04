import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-info-brand">
          <Link href="/" className="logo">
            Auto<span className="logo-accent">motora</span>
          </Link>
          <p className="footer-desc">
            Líderes en la Décima Región en venta de camionetas 4x4, SUVs y vehículos familiares. Comprometidos con una compra transparente y nuestra exclusiva Garantía Ética de 7 días.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-icon" aria-label="Facebook">FB</a>
            <a href="#" className="social-icon" aria-label="Instagram">IG</a>
            <a href="#" className="social-icon" aria-label="Twitter">TW</a>
            <a href="#" className="social-icon" aria-label="YouTube">YT</a>
          </div>
        </div>

        {/* Links Column */}
        <div>
          <h3 className="footer-heading">Navegación</h3>
          <ul className="footer-links">
            <li><Link href="/">Inicio</Link></li>
            <li><Link href="/catalog">Catálogo</Link></li>
            <li><Link href="/contacto">Contacto</Link></li>
          </ul>
        </div>

        {/* Categories Column */}
        <div>
          <h3 className="footer-heading">Categorías</h3>
          <ul className="footer-links">
            <li><Link href="/catalog?type=camioneta">Camionetas 4x4</Link></li>
            <li><Link href="/catalog?type=suv">SUVs Familiares</Link></li>
            <li><Link href="/catalog?type=sedan">Sedanes</Link></li>
            <li><Link href="/catalog?type=electrico">Eléctricos</Link></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div>
          <h3 className="footer-heading">Contacto</h3>
          <ul className="footer-contacts">
            <li>
              <span>📍</span> 
              <div>Av. Presidente Ibáñez 450, Puerto Montt, Décima Región, Chile</div>
            </li>
            <li>
              <span>📞</span> 
              <div>+56 65 2234 5678</div>
            </li>
            <li>
              <span>✉️</span> 
              <div>contacto@automotora.cl</div>
            </li>
            <li>
              <span>🕒</span> 
              <div>Lun - Vie: 9:00 - 19:00<br />Sáb: 10:00 - 14:00</div>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Automotora. Todos los derechos reservados.</p>
        <p>
          Diseño Web Profesional para Portafolio •{' '}
          <Link href="/dashboard" className="footer-admin-link">
            Acceso Admin
          </Link>
        </p>
      </div>
    </footer>
  );
}
