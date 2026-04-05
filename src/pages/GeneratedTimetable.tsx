import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { TimetableEntry, Room } from '../types';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface TimetableView {
  room: Room;
  entries: TimetableEntry[];
  generatedDate: string;
  periodsPerDay: number;
}

export default function GeneratedTimetable() {
  const navigate = useNavigate();
  const { authType, organizationId, organizationName, logout } = useAuth();
  const [timetables, setTimetables] = useState<TimetableView[]>([]);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      navigate('/');
      return;
    }
    loadTimetables();
  }, [organizationId, navigate]);

  const loadTimetables = async () => {
    setLoading(true);
    try {
      const { data: timetableData } = await supabase
        .from('timetables')
        .select('*, rooms(*)')
        .eq('organization_id', organizationId)
        .eq('is_current', true);

      if (timetableData && timetableData.length > 0) {
        const timetableViews: TimetableView[] = [];

        for (const timetable of timetableData) {
          const { data: entries } = await supabase
            .from('timetable_entries')
            .select('*')
            .eq('timetable_id', timetable.id)
            .order('day_of_week')
            .order('period_number');

          if (entries) {
            timetableViews.push({
              room: timetable.rooms as Room,
              entries: entries,
              generatedDate: timetable.generated_date,
              periodsPerDay: timetable.periods_per_day,
            });
          }
        }

        setTimetables(timetableViews);
      }
    } catch (error) {
      console.error('Error loading timetables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const downloadCSV = () => {
    if (timetables.length === 0) return;

    const currentTimetable = timetables[selectedRoomIndex];
    let csv = 'Day,Period,Time,Subject,Teacher,Room\n';

    currentTimetable.entries.forEach((entry) => {
      csv += `${entry.day_of_week},${entry.period_number},${entry.start_time}-${entry.end_time},${entry.subject || 'Free'},${entry.teacher_name || '-'},${entry.room_number}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable-${currentTimetable.room.room_number}.csv`;
    a.click();
  };

  const downloadPDF = () => {
    if (timetables.length === 0) return;

    const currentTimetable = timetables[selectedRoomIndex];
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('SmartSched Timetable', 14, 15);
    doc.setFontSize(12);
    doc.text(
      `Room: ${currentTimetable.room.room_number} - ${currentTimetable.room.branch} - Section ${currentTimetable.room.section}`,
      14,
      22
    );
    doc.text(`Generated: ${currentTimetable.generatedDate}`, 14, 29);

    const tableData: any[] = [];
    DAYS.forEach((day) => {
      const dayEntries = currentTimetable.entries.filter(
        (e) => e.day_of_week === day
      );
      const row = [day];
      dayEntries.forEach((entry) => {
        row.push(
          `${entry.subject || 'Free'}\n${entry.teacher_name || '-'}\n${entry.start_time}`
        );
      });
      tableData.push(row);
    });

    const headers = ['Day'];
    for (let i = 1; i <= currentTimetable.periodsPerDay; i++) {
      headers.push(`Period ${i}`);
    }

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`timetable-${currentTimetable.room.room_number}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading timetables...</p>
      </div>
    );
  }

  if (timetables.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-800">Timetable</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-600 mb-4">
              No timetables have been generated yet.
            </p>
            {authType === 'organization' && (
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentTimetable = timetables[selectedRoomIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Generated Timetable
            </h1>
            <p className="text-sm text-gray-600">
              {organizationName} - Generated on {currentTimetable.generatedDate}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {authType === 'organization' && (
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
                Dashboard
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {timetables.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Room
            </label>
            <select
              value={selectedRoomIndex}
              onChange={(e) => setSelectedRoomIndex(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {timetables.map((tt, index) => (
                <option key={index} value={index}>
                  Room {tt.room.room_number} - {tt.room.branch} - Section{' '}
                  {tt.room.section}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Room {currentTimetable.room.room_number}
              </h2>
              <p className="text-sm text-gray-600">
                {currentTimetable.room.branch} - Section{' '}
                {currentTimetable.room.section}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                    Day / Period
                  </th>
                  {Array.from(
                    { length: currentTimetable.periodsPerDay },
                    (_, i) => (
                      <th
                        key={i}
                        className="border border-gray-300 px-4 py-3 text-center font-semibold"
                      >
                        Period {i + 1}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => {
                  const dayEntries = currentTimetable.entries.filter(
                    (e) => e.day_of_week === day
                  );
                  return (
                    <tr key={day} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800 bg-gray-100">
                        {day}
                      </td>
                      {dayEntries.map((entry, index) => (
                        <td
                          key={index}
                          className="border border-gray-300 px-4 py-3 text-center"
                        >
                          {entry.subject ? (
                            <div>
                              <p className="font-semibold text-gray-800">
                                {entry.subject}
                              </p>
                              <p className="text-sm text-gray-600">
                                {entry.teacher_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {entry.start_time} - {entry.end_time}
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm">Free Period</p>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
