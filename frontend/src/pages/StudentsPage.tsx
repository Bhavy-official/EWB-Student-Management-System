import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { studentApi, getApiErrorMessage } from '../services/api';
import type { Student, StudentPagination } from '../types/student';


const COURSES = [
  'Computer Science',
  'Data Science',
  'Artificial Intelligence',
  'Cloud Computing',
  'Cyber Security',
  'Web Development',
];

export const StudentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter states initialized from URL params if present
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCourse, setSelectedCourse] = useState(searchParams.get('course') || '');
  const [enrollmentStart, setEnrollmentStart] = useState(searchParams.get('enrollment_start') || '');
  const [enrollmentEnd, setEnrollmentEnd] = useState(searchParams.get('enrollment_end') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('sort_order') as 'asc' | 'desc') || 'desc');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [pageSize] = useState(10);

  const [data, setData] = useState<StudentPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Delete modal state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await studentApi.getStudents({
        page,
        page_size: pageSize,
        search: searchTerm || undefined,
        course: selectedCourse || undefined,
        enrollment_start: enrollmentStart || undefined,
        enrollment_end: enrollmentEnd || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setData(res);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchTerm, selectedCourse, enrollmentStart, enrollmentEnd, sortBy, sortOrder]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Update URL search parameters
  useEffect(() => {
    const params: Record<string, string> = { page: String(page) };
    if (searchTerm) params.search = searchTerm;
    if (selectedCourse) params.course = selectedCourse;
    if (enrollmentStart) params.enrollment_start = enrollmentStart;
    if (enrollmentEnd) params.enrollment_end = enrollmentEnd;
    if (sortBy !== 'id') params.sort_by = sortBy;
    if (sortOrder !== 'desc') params.sort_order = sortOrder;
    setSearchParams(params, { replace: true });
  }, [page, searchTerm, selectedCourse, enrollmentStart, enrollmentEnd, sortBy, sortOrder, setSearchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCourse('');
    setEnrollmentStart('');
    setEnrollmentEnd('');
    setSortBy('id');
    setSortOrder('desc');
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await studentApi.deleteStudent(studentToDelete.id);
      setSuccessMessage(`Student '${studentToDelete.full_name}' was removed successfully.`);
      setStudentToDelete(null);
      fetchStudents();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = Boolean(searchTerm || selectedCourse || enrollmentStart || enrollmentEnd);

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, filter, edit, and manage all enrolled students.
          </p>
        </div>
        <Link to="/students/new">
          <Button icon={<UserPlus className="w-4 h-4" />}>Register New Student</Button>
        </Link>
      </div>

      {/* Notification Alerts */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3.5 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters Card */}
      <Card>
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Course Filter */}
            <div>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="">All Academic Programs</option>
                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* Enrollment Start Date */}
            <div>
              <input
                type="date"
                title="Enrollment Start Date"
                value={enrollmentStart}
                onChange={(e) => {
                  setEnrollmentStart(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-700"
              />
            </div>

            {/* Enrollment End Date */}
            <div>
              <input
                type="date"
                title="Enrollment End Date"
                value={enrollmentEnd}
                onChange={(e) => {
                  setEnrollmentEnd(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-700"
              />
            </div>
          </div>

          {/* Active Filter Badges & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-medium text-slate-700 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Filters:
              </span>
              {hasActiveFilters ? (
                <>
                  {searchTerm && <Badge variant="blue">Query: {searchTerm}</Badge>}
                  {selectedCourse && <Badge variant="emerald">{selectedCourse}</Badge>}
                  {enrollmentStart && <Badge variant="purple">From: {enrollmentStart}</Badge>}
                  {enrollmentEnd && <Badge variant="purple">To: {enrollmentEnd}</Badge>}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium ml-2 underline"
                  >
                    Reset all
                  </button>
                </>
              ) : (
                <span className="text-slate-400">None active (showing all records)</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" variant="secondary">
                Apply Search
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={fetchStudents} title="Reload">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('full_name')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Email</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('course')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Program</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('date_of_birth')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors hidden md:table-cell"
                >
                  <div className="flex items-center gap-1">
                    <span>Age / DOB</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('enrollment_date')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors hidden lg:table-cell"
                >
                  <div className="flex items-center gap-1">
                    <span>Enrolled</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Loading student directory...</span>
                    </div>
                  </td>
                </tr>
              ) : data && data.items.length > 0 ? (
                data.items.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                      #{student.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/students/${student.id}`}
                        className="font-medium text-slate-900 hover:text-emerald-600 transition-colors"
                      >
                        {student.full_name}
                      </Link>
                      <div className="text-[11px] text-slate-400 sm:hidden">{student.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="truncate max-w-[200px] block">{student.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="blue">{student.course}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 hidden md:table-cell">
                      <span>{student.age} yrs</span>
                      <span className="text-[11px] text-slate-400 block">{student.date_of_birth}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 hidden lg:table-cell font-mono text-xs">
                      {student.enrollment_date}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/students/${student.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/students/${student.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          title="Edit Details"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-14">
                    <div className="max-w-xs mx-auto space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold text-slate-700">No students match criteria</p>
                      <p className="text-xs text-slate-400">
                        Try modifying search query or resetting filters.
                      </p>
                      {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2">
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data && (
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-800">{data.items.length > 0 ? (data.page - 1) * data.page_size + 1 : 0}</span> to{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(data.page * data.page_size, data.total)}
              </span> of <span className="font-semibold text-slate-800">{data.total}</span> students
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={data.page <= 1 || isLoading}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <span className="px-2 font-medium text-slate-700">
                Page {data.page} of {data.total_pages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, data.total_pages))}
                disabled={data.page >= data.total_pages || isLoading}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        title="Confirm Student Deletion"
        description="This action is permanent and cannot be undone."
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600">
            Are you sure you want to delete the record for{' '}
            <strong className="text-slate-900">{studentToDelete?.full_name}</strong> (ID #{studentToDelete?.id})?
            All associated academic records will be purged from SQLite.
          </p>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStudentToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
            >
              Delete Student
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
