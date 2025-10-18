import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>IvanovHotels</h4>
            <p>Луксозни хотели за незабравима почивка</p>
          </div>
          <div className="footer-section">
            <h4>Контакти</h4>
            <p>Телефон: +359 888 123 456</p>
            <p>Email: info@ivanovhotels.bg</p>
          </div>
          <div className="footer-section">
            <h4>Нашите хотели</h4>
            <p>Хотел Сони</p>
            <p>Хотел Ивон</p>
            <p>Хотел Крис</p>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-links">
            <Link to="/terms">Общи условия</Link>
            <span className="separator">•</span>
            <Link to="/privacy">Политика за поверителност</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} IvanovHotels. Всички права запазени.</p>
        </div>
      </div>
    </footer>
  )
}
