import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Teacher, Room } from '../types';
import { LogOut, Plus, Trash2, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { organizationId, organizationName, logout } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ name: '', subject: '' });
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    branch: '',
    section: '',
  });

  useEffect(() => {
    if (!organizationId) {
      navigate('/');
      return;
    }
    loadData();
  }, [organizationId, navigate]);

  const loadData = async () => {
    const { data: teachersData } = await supabase
      .from('teachers')
      .select('*')
      .eq('organization_id', organizationId);

    const { data: roomsData } = await supabase
      .from('rooms')
      .select('*')
      .eq('organization_id', organizationId);

    if (teachersData) setTeachers(teachersData);
    if (roomsData) setRooms(roomsData);
  };

  const addTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('teachers').insert([
      {
        organization_id: organizationId,
        name: teacherForm.name,
        subject: teacherForm.subject,
      },
    ]);

    if (!error) {
      setTeacherForm({ name: '', subject: '' });
      setShowTeacherForm(false);
      loadData();
    }
  };

  const deleteTeacher = async (id: string) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      await supabase.from('teachers').delete().eq('id', id);
      loadData();
    }
  };

  const addRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('rooms').insert([
      {
        organization_id: organizationId,
        room_number: roomForm.roomNumber,
        branch: roomForm.branch,
        section: roomForm.section,
      },
    ]);

    if (!error) {
      setRoomForm({ roomNumber: '', branch: '', section: '' });
      setShowRoomForm(false);
      loadData();
    }
  };

  const deleteRoom = async (id: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      await supabase.from('rooms').delete().eq('id', id);
      loadData();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {organizationName}
            </h1>
            <p className="text-sm text-gray-600">Admin Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/timetable-generator')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Generate Timetable
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Teachers</h2>
              <button
                onClick={() => setShowTeacherForm(!showTeacherForm)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add Teacher
              </button>
            </div>

            {showTeacherForm && (
              <form onSubmit={addTeacher} className="mb-6 space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Teacher Name"
                  value={teacherForm.name}
                  onChange={(e) =>
                    setTeacherForm({ ...teacherForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  required
                  placeholder="Subject"
                  value={teacherForm.subject}
                  onChange={(e) =>
                    setTeacherForm({ ...teacherForm, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Save Teacher
                </button>
              </form>
            )}

            <div className="space-y-2">
              {teachers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No teachers added yet
                </p>
              ) : (
                teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {teacher.name}
                      </p>
                      <p className="text-sm text-gray-600">{teacher.subject}</p>
                    </div>
                    <button
                      onClick={() => deleteTeacher(teacher.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Rooms</h2>
              <button
                onClick={() => setShowRoomForm(!showRoomForm)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Room
              </button>
            </div>

            {showRoomForm && (
              <form onSubmit={addRoom} className="mb-6 space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Room Number"
                  value={roomForm.roomNumber}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, roomNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  required
                  placeholder="Branch"
                  value={roomForm.branch}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, branch: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  required
                  placeholder="Section"
                  value={roomForm.section}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, section: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Room
                </button>
              </form>
            )}

            <div className="space-y-2">
              {rooms.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No rooms added yet
                </p>
              ) : (
                rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        Room {room.room_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        {room.branch} - Section {room.section}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteRoom(room.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
