import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building2, UserPlus, LogIn } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            SmartSched
          </h1>
          <p className="text-xl text-gray-600">
            Academic Timetable & Room Allocation System
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/org-register')}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500 text-left"
          >
            <Building2 className="w-12 h-12 text-blue-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Organization Registration
            </h2>
            <p className="text-gray-600">
              Register your institution to manage timetables and resources
            </p>
          </button>

          <button
            onClick={() => navigate('/user-register')}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-500 text-left"
          >
            <UserPlus className="w-12 h-12 text-green-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              User Registration
            </h2>
            <p className="text-gray-600">
              Register as a student or teacher with your organization code
            </p>
          </button>

          <button
            onClick={() => navigate('/org-login')}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500 text-left"
          >
            <Building2 className="w-12 h-12 text-blue-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Organization Login
            </h2>
            <p className="text-gray-600">
              Access your organization dashboard and management tools
            </p>
          </button>

          <button
            onClick={() => navigate('/user-login')}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-500 text-left"
          >
            <LogIn className="w-12 h-12 text-green-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              User Login
            </h2>
            <p className="text-gray-600">
              View your personalized timetable and schedule
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
