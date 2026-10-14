import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  TrendingUp,
  Clock,
  UserPlus,
  Sparkles,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { studentApi, getApiErrorMessage } from '../services/api';
import type { StudentStats } from '../types/student';


const PIE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await studentApi.getStudentStats();
      setStats(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-xl"></div>
          <div className="h-80 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-semibold text-rose-800">Failed to Load Dashboard Data</h3>
        <p className="text-sm text-rose-600 max-w-md mx-auto">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchStats} icon={<RefreshCw className="w-4 h-4" />}>
          Try Again
        </Button>
      </div>
    );
  }

  const ageData = stats
    ? Object.entries(stats.age_distribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Academic Overview</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time analytics and registered student enrollment trends.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/students/new">
            <Button size="sm" icon={<UserPlus className="w-4 h-4" />}>
              Enroll Student
            </Button>
          </Link>
          <Link to="/ai-assistant">
            <Button variant="outline" size="sm" icon={<Sparkles className="w-4 h-4 text-emerald-600" />}>
              Ask AI Assistant
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={fetchStats} title="Refresh data">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Students</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1.5">{stats?.total_students ?? 0}</h2>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Live records
              </span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Programs</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1.5">{stats?.by_course.length ?? 0}</h2>
              <span className="text-[11px] text-blue-600 font-medium mt-1 inline-flex items-center gap-1">
                Across STEM fields
              </span>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Top Course</p>
              <h2 className="text-lg font-bold text-slate-900 mt-1.5 truncate max-w-[150px]" title={stats?.by_course[0]?.course || 'N/A'}>
                {stats?.by_course[0]?.course || 'N/A'}
              </h2>
              <span className="text-[11px] text-purple-600 font-medium mt-1 inline-block">
                {stats?.by_course[0]?.count ?? 0} students enrolled
              </span>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Recent Enrollments</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1.5">{stats?.recent_students.length ?? 0}</h2>
              <span className="text-[11px] text-amber-600 font-medium mt-1 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> Latest batch
              </span>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Distribution Bar Chart */}
        <Card title="Students by Program" subtitle="Enrollment breakdown per course" className="lg:col-span-2">
          {stats?.by_course.length ? (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.by_course} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="course"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400">
              No course enrollment data found.
            </div>
          )}
        </Card>

        {/* Age Demographics Pie Chart */}
        <Card title="Age Demographics" subtitle="Calculated from dates of birth">
          {stats && ageData.some((d) => d.value > 0) ? (
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={ageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {ageData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2 w-full px-4">
                {ageData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs text-slate-600">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="font-medium">{item.name}:</span>
                    <span className="text-slate-900 font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400">
              No demographic data available.
            </div>
          )}
        </Card>
      </div>

      {/* Enrollment Trends & Recent Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <Card title="Enrollment Trends" subtitle="Monthly registration velocity" className="lg:col-span-2">
          {stats?.enrollment_trends.length ? (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.enrollment_trends} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No historical trend data yet.
            </div>
          )}
        </Card>

        {/* Recently Added Students */}
        <Card
          title="Recent Additions"
          subtitle="Latest student registrations"
          action={
            <Link to="/students" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="divide-y divide-slate-100">
            {stats?.recent_students && stats.recent_students.length > 0 ? (
              stats.recent_students.map((student) => (
                <div key={student.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/students/${student.id}`}
                      className="text-xs font-semibold text-slate-800 hover:text-emerald-600 truncate block"
                    >
                      {student.full_name}
                    </Link>
                    <p className="text-[11px] text-slate-400 truncate">{student.course}</p>
                  </div>
                  <Badge variant="slate" size="sm">
                    {student.enrollment_date}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No recent students found.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
