import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Hotel } from '../types';
import './AdminHotelsPage.css';

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    address: string;
    image_url: string | null;
  }>({
    name: '',
    description: '',
    address: '',
    image_url: ''
  });

  useEffect(() => {
    loadHotels();
  }, []);

  async function loadHotels() {
    setLoading(true);
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .order('name');

    if (!error && data) {
      setHotels(data);
    }
    setLoading(false);
  }

  function startEdit(hotel: Hotel) {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      description: hotel.description,
      address: hotel.address,
      image_url: hotel.image_url || ''
    });
  }

  function cancelEdit() {
    setEditingHotel(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      image_url: ''
    });
  }

  async function saveHotel() {
    if (!editingHotel) return;

    const { error } = await (supabase as any)
      .from('hotels')
      .update({
        name: formData.name,
        description: formData.description,
        address: formData.address,
        image_url: formData.image_url || null
      })
      .eq('id', editingHotel.id);

    if (!error) {
      await loadHotels();
      cancelEdit();
    }
  }

  if (loading) {
    return <div className="admin-loading">Зареждане...</div>;
  }

  return (
    <div className="admin-hotels-page">
      <h2>Управление на хотели</h2>

      <div className="hotels-grid">
        {hotels.map(hotel => (
          <div key={hotel.id} className="hotel-card">
            <img src={hotel.image_url || ''} alt={hotel.name} />
            <div className="hotel-info">
              <h3>{hotel.name}</h3>
              <p className="hotel-address">{hotel.address}</p>
              <p className="hotel-description">{hotel.description}</p>
              <button onClick={() => startEdit(hotel)} className="btn-edit">
                Редактирай
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingHotel && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Редактиране на хотел</h3>

            <label>
              Име:
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </label>

            <label>
              Адрес:
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </label>

            <label>
              Описание:
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={4}
              />
            </label>

            <label>
              URL на снимка:
              <input
                type="text"
                value={formData.image_url || ''}
                onChange={e => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://..."
              />
            </label>

            {formData.image_url && (
              <div className="image-preview">
                <img src={formData.image_url} alt="Преглед" />
              </div>
            )}

            <div className="modal-actions">
              <button onClick={saveHotel} className="btn-save">
                Запази
              </button>
              <button onClick={cancelEdit} className="btn-cancel">
                Отказ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
