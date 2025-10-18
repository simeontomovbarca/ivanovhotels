import { Link } from 'react-router-dom'
import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="logo">
            <span className="logo-text">IvanovHotels</span>
          </Link>
          <ul className="nav-links">
            <li><Link to="/hotels/soni">Хотел Сони</Link></li>
            <li><Link to="/hotels/ivon">Хотел Ивон</Link></li>
            <li><Link to="/hotels/chris">Хотел Крис</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
