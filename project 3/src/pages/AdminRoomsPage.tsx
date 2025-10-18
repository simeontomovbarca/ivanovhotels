import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Room, Hotel } from '../types';
import './AdminRoomsPage.css';

interface RoomWithHotel extends Room {
  hotels: Hotel;
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<RoomWithHotel[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<RoomWithHotel | null>(null);
  const [addingRoom, setAddingRoom] = useState(false);
  const [formData, setFormData] = useState<{
    hotel_id: string;
    room_number: string;
    room_type: string;
    capacity: number;
    price_per_night: number;
    description: string | null;
    image_url: string | null;
  }>({
    hotel_id: '',
    room_number: '',
    room_type: 'standard',
    capacity: 2,
    price_per_night: 0,
    description: '',
    image_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [roomsResult, hotelsResult] = await Promise.all([
      supabase
        .from('rooms')
        .select('*, hotels(*)')
        .order('room_number'),
      supabase
        .from('hotels')
        .select('*')
        .order('name')
    ]);

    if (!roomsResult.error && roomsResult.data) {
      setRooms(roomsResult.data as RoomWithHotel[]);
    }
    if (!hotelsResult.error && hotelsResult.data) {
      setHotels(hotelsResult.data);
    }

    setLoading(false);
  }

  function startEdit(room: RoomWithHotel) {
    setEditingRoom(room);
    setFormData({
      hotel_id: room.hotel_id,
      room_number: room.room_number,
      room_type: room.room_type,
      capacity: room.capacity,
      price_per_night: room.price_per_night,
      description: room.description || '',
      image_url: room.image_url || ''
    });
  }

  function startAdd() {
    setAddingRoom(true);
    setFormData({
      hotel_id: hotels[0]?.id || '',
      room_number: '',
      room_type: 'standard',
      capacity: 2,
      price_per_night: 100,
      description: '',
      image_url: ''
    });
  }

  function cancelEdit() {
    setEditingRoom(null);
    setAddingRoom(false);
    setFormData({
      hotel_id: '',
      room_number: '',
      room_type: 'standard',
      capacity: 2,
      price_per_night: 0,
      description: '',
      image_url: ''
    });
  }

  async function saveRoom() {
    if (editingRoom) {
      const { error } = await (supabase as any)
        .from('rooms')
        .update({
          hotel_id: formData.hotel_id,
          room_number: formData.room_number,
          room_type: formData.room_type,
          capacity: formData.capacity,
          price_per_night: formData.price_per_night,
          description: formData.description || null,
          image_url: formData.image_url || null
        })
        .eq('id', editingRoom.id);

      if (!error) {
        await loadData();
        cancelEdit();
      }
    }
  }

  async function addRoom() {
    const { error } = await (supabase as any)
      .from('rooms')
      .insert([{
        hotel_id: formData.hotel_id,
        room_number: formData.room_number,
        room_type: formData.room_type,
        capacity: formData.capacity,
        price_per_night: formData.price_per_night,
        description: formData.description || null,
        image_url: formData.image_url || null
      }]);

    if (!error) {
      await loadData();
      cancelEdit();
    }
  }

  async function deleteRoom(roomId: string) {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази стая?')) {
      return;
    }

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (!error) {
      await loadData();
    }
  }

  const getRoomTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      standard: 'Стандартна',
      deluxe: 'Делукс',
      suite: 'Апартамент'
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="admin-loading">Зареждане...</div>;
  }

  return (
    <div className="admin-rooms-page">
      <div className="page-header">
        <h2>Управление на стаи</h2>
        <button onClick={startAdd} className="btn-add">
          + Добави стая
        </button>
      </div>

      <div className="rooms-table">
        <table>
          <thead>
            <tr>
              <th>Хотел</th>
              <th>Стая</th>
              <th>Тип</th>
              <th>Капацитет</th>
              <th>Цена/нощ</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td>{room.hotels.name}</td>
                <td>{room.room_number}</td>
                <td>{getRoomTypeLabel(room.room_type)}</td>
                <td>{room.capacity}</td>
                <td>{room.price_per_night} лв</td>
                <td>
                  <button onClick={() => startEdit(room)} className="btn-small btn-edit">
                    Редактирай
                  </button>
                  <button onClick={() => deleteRoom(room.id)} className="btn-small btn-delete">
                    Изтрий
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editingRoom || addingRoom) && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>{addingRoom ? 'Добавяне на стая' : 'Редактиране на стая'}</h3>

            <label>
              Хотел:
              <select
                value={formData.hotel_id}
                onChange={e => setFormData({...formData, hotel_id: e.target.value})}
              >
                {hotels.map(hotel => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Номер на стая:
              <input
                type="text"
                value={formData.room_number}
                onChange={e => setFormData({...formData, room_number: e.target.value})}
              />
            </label>

            <label>
              Тип стая:
              <select
                value={formData.room_type}
                onChange={e => setFormData({...formData, room_type: e.target.value})}
              >
                <option value="standard">Стандартна</option>
                <option value="deluxe">Делукс</option>
                <option value="suite">Апартамент</option>
              </select>
            </label>

            <label>
              Капацитет (брой гости):
              <input
                type="number"
                min="1"
                max="10"
                value={formData.capacity}
                onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
              />
            </label>

            <label>
              Цена на нощ (лв):
              <input
                type="number"
                min="0"
                step="10"
                value={formData.price_per_night}
                onChange={e => setFormData({...formData, price_per_night: Number(e.target.value)})}
              />
            </label>

            <label>
              Описание:
              <textarea
                value={formData.description || ''}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={3}
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
              <button
                onClick={addingRoom ? addRoom : saveRoom}
                className="btn-save"
              >
                {addingRoom ? 'Добави' : 'Запази'}
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
