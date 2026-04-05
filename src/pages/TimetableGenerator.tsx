import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Teacher, Room } from '../types';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetableGenerator() {
  const navigate = useNavigate();
  const { organizationId, organizationName } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [periodsPerDay, setPeriodsPerDay] = useState(6);
  const [loading, setLoading] = useState(false);

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

  const generateTimeForPeriod = (periodNumber: number) => {
    const startHour = 8 + Math.floor((periodNumber - 1) / 2);
    const startMinute = (periodNumber - 1) % 2 === 0 ? '00' : '30';
    const endHour = startHour + (startMinute === '30' ? 1 : 0);
    const endMinute = startMinute === '00' ? '30' : '00';

    return {
      start: `${startHour}:${startMinute} AM`,
      end: `${endHour}:${endMinute} ${endHour >= 12 ? 'PM' : 'AM'}`,
    };
  };

  // FIX: Passed globalTeacherSchedule in as an argument so all rooms share it
  const generateTimetableForRoom = (room: Room, globalTeacherSchedule: Set<string>) => {
    const timetable: any[] = [];
    const subjectCount: { [key: string]: number } = {};

    teachers.forEach((t) => {
      subjectCount[t.subject] = 0;
    });

    for (const day of DAYS) {
      for (let period = 1; period <= periodsPerDay; period++) {
        const slot = `${day}-${period}`;
        let assigned = false;

        const availableTeachers = teachers.filter((teacher) => {
          const teacherKey = `${teacher.id}-${slot}`;
          // FIX: Check the global schedule
          return !globalTeacherSchedule.has(teacherKey);
        });

        availableTeachers.sort((a, b) => {
          const countA = subjectCount[a.subject] || 0;
          const countB = subjectCount[b.subject] || 0;
          return countA - countB;
        });

        for (const teacher of availableTeachers) {
          const teacherKey = `${teacher.id}-${slot}`;

          // FIX: Check the global schedule again
          if (!globalTeacherSchedule.has(teacherKey)) {
            const time = generateTimeForPeriod(period);

            timetable.push({
              day_of_week: day,
              period_number: period,
              subject: teacher.subject,
              teacher_name: teacher.name,
              room_number: room.room_number,
              start_time: time.start,
              end_time: time.end,
            });

            // FIX: Mark the teacher as busy globally for this slot
            globalTeacherSchedule.add(teacherKey);
            subjectCount[teacher.subject] =
              (subjectCount[teacher.subject] || 0) + 1;
            assigned = true;
            break;
          }
        }

        if (!assigned) {
          const time = generateTimeForPeriod(period);
          timetable.push({
            day_of_week: day,
            period_number: period,
            subject: null,
            teacher_name: null,
            room_number: room.room_number,
            start_time: time.start,
            end_time: time.end,
          });
        }
      }
    }

    return timetable;
  };

  const generateAllTimetables = async () => {
    if (teachers.length === 0 || rooms.length === 0) {
      alert('Please add teachers and rooms before generating timetables');
      return;
    }

    setLoading(true);

    try {
      await supabase
        .from('timetables')
        .update({ is_current: false })
        .eq('organization_id', organizationId);

      // FIX: Create the tracker here, so it survives the loop across all rooms
      const globalTeacherSchedule = new Set<string>();

      for (const room of rooms) {
        // FIX: Pass the tracker into the room generator
        const timetableEntries = generateTimetableForRoom(room, globalTeacherSchedule);

        const { data: timetableData, error: timetableError } = await supabase
          .from('timetables')
          .insert([
            {
              organization_id: organizationId,
              room_id: room.id,
              generated_date: new Date().toISOString().split('T')[0],
              periods_per_day: periodsPerDay,
              is_current: true,
            },
          ])
          .select()
          .single();

        if (timetableError) throw timetableError;

        const entriesWithTimetableId = timetableEntries.map((entry) => ({
          ...entry,
          timetable_id: timetableData.id,
        }));

        const { error: entriesError } = await supabase
          .from('timetable_entries')
          .insert(entriesWithTimetableId);

        if (entriesError) throw entriesError;
      }

      alert('Timetables generated successfully!');
      navigate('/timetable');
    } catch (error: any) {
      console.error('Error generating timetables:', error);
      alert('Failed to generate timetables: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Timetable Generator
          </h1>
          <p className="text-sm text-gray-600">{organizationName}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Configuration
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Periods per Day
              </label>
              <input
                type="number"
                min="4"
                max="10"
                value={periodsPerDay}
                onChange={(e) => setPeriodsPerDay(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Teachers</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-gray-800">
                    {teachers.length}
                  </p>
                  <p className="text-sm text-gray-600">
                    Teachers with subjects
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Rooms</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-gray-800">
                    {rooms.length}
                  </p>
                  <p className="text-sm text-gray-600">
                    Classrooms configured
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 mb-4">
              The system will generate optimized timetables for all rooms using
              a greedy algorithm to avoid conflicts. Each room will have a
              unique schedule with no teacher or subject clashes.
            </p>

            <button
              onClick={generateAllTimetables}
              disabled={loading || teachers.length === 0 || rooms.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              />
              {loading ? 'Generating...' : 'Generate All Timetables'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}