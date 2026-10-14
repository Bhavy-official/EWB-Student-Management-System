import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  MapPin,
  Clock,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { studentApi, getApiErrorMessage } from '../services/api';
import type { Student } from '../types/student';


export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await studentApi.getStudentById(Number(id));
        setStudent(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleDelete = async () => {
    if (!student) return;
    setIsDeleting(true);
    try {
      await studentApi.deleteStudent(student.id);
      navigate('/students', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Student Record Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          {error || `Unable to locate student with ID #${id}. It may have been removed or does not exist.`}
        </p>
        <Link to="/students">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/students"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{student.full_name}</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-mono">Student ID: #{student.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/students/${student.id}/edit`}>
            <Button variant="outline" size="sm" icon={<Edit className="w-4 h-4 text-blue-600" />}>
              Edit Record
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Profile Info Card */}
      <Card>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar / Badge */}
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-inner">
            <GraduationCap className="w-10 h-10" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-900">{student.full_name}</h2>
                <Badge variant="blue" size="md">
                  {student.course}
                </Badge>
                <Badge variant="emerald" size="md">
                  Age: {student.age}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Registered on {student.enrollment_date} • System timestamp: {new Date(student.created_at).toLocaleString()}
              </p>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs sm:text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Email Address</span>
                  <a href={`mailto:${student.email}`} className="text-slate-900 font-semibold hover:underline">
                    {student.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Contact Phone</span>
                  <span className="text-slate-900 font-semibold">{student.phone_number}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Date of Birth</span>
                  <span className="text-slate-900 font-semibold">
                    {student.date_of_birth} ({student.age} years old)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Academic Program</span>
                  <span className="text-slate-900 font-semibold">{student.course}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600 sm:col-span-2">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Residential Address</span>
                  <span className="text-slate-900 font-semibold">
                    {student.address || 'No residential address recorded.'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600 sm:col-span-2">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Last Record Modification</span>
                  <span className="text-slate-700">
                    {new Date(student.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Student Record Deletion"
        description="Permanently delete student profile."
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600">
            Are you sure you want to delete the record for{' '}
            <strong className="text-slate-900">{student.full_name}</strong>? This action cannot be reverted.
          </p>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
