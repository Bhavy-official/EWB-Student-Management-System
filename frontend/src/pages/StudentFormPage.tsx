import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Calendar,
  Phone,
  BookOpen,
  MapPin,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { studentApi, getApiErrorMessage } from '../services/api';
import type { StudentFormData } from '../types/student';


const COURSES = [
  'Computer Science',
  'Data Science',
  'Artificial Intelligence',
  'Cloud Computing',
  'Cyber Security',
  'Web Development',
];

const studentSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  email: z.string().email('Please enter a valid email address').max(255),
  date_of_birth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((dateStr) => {
      const parsed = new Date(dateStr);
      const today = new Date();
      return parsed < today;
    }, 'Date of birth must be in the past'),
  phone_number: z
    .string()
    .min(5, 'Phone number must be at least 5 digits')
    .max(30, 'Phone number cannot exceed 30 characters'),
  course: z.string().min(2, 'Please select or enter a course program'),
  address: z.string().max(500, 'Address cannot exceed 500 characters').optional().or(z.literal('')),
  enrollment_date: z.string().min(1, 'Enrollment date is required'),
});

type FormValues = z.infer<typeof studentSchema>;

export const StudentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [isLoadingStudent, setIsLoadingStudent] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      full_name: '',
      email: '',
      date_of_birth: '',
      phone_number: '',
      course: 'Computer Science',
      address: '',
      enrollment_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      const fetchStudentData = async () => {
        setIsLoadingStudent(true);
        setErrorMessage(null);
        try {
          const student = await studentApi.getStudentById(Number(id));
          reset({
            full_name: student.full_name,
            email: student.email,
            date_of_birth: student.date_of_birth,
            phone_number: student.phone_number,
            course: student.course,
            address: student.address || '',
            enrollment_date: student.enrollment_date,
          });
        } catch (err) {
          setErrorMessage(getApiErrorMessage(err));
        } finally {
          setIsLoadingStudent(false);
        }
      };
      fetchStudentData();
    }
  }, [isEditMode, id, reset]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const payload: StudentFormData = {
        full_name: data.full_name,
        email: data.email,
        date_of_birth: data.date_of_birth,
        phone_number: data.phone_number,
        course: data.course,
        address: data.address || undefined,
        enrollment_date: data.enrollment_date,
      };

      if (isEditMode && id) {
        await studentApi.updateStudent(Number(id), payload);
        setSuccessMessage('Student details updated successfully!');
      } else {
        const created = await studentApi.createStudent(payload);
        setSuccessMessage('Student registered successfully!');
        setTimeout(() => navigate(`/students/${created.id}`), 1200);
        return;
      }
      setTimeout(() => navigate(`/students/${id}`), 1200);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStudent) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-96 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={isEditMode ? `/students/${id}` : '/students'}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {isEditMode ? 'Edit Student Profile' : 'Enroll New Student'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {isEditMode ? `Update record for student ID #${id}` : 'Fill in the verified personal and academic details'}
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center gap-2.5 text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-center gap-2.5 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Aarav Sharma"
                {...register('full_name')}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.full_name
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.full_name && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.full_name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="aarav@example.com"
                {...register('email')}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.email
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                {...register('phone_number')}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.phone_number
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.phone_number && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.phone_number.message}</p>
              )}
            </div>

            {/* Academic Course */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                Academic Program <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('course')}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              {errors.course && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.course.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Date of Birth <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                {...register('date_of_birth')}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.date_of_birth
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.date_of_birth && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.date_of_birth.message}</p>
              )}
            </div>

            {/* Enrollment Date */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Enrollment Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                {...register('enrollment_date')}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.enrollment_date
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.enrollment_date && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.enrollment_date.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Residential / Postal Address (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Street address, city, state, postal code..."
                {...register('address')}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
              />
              {errors.address && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to={isEditMode ? `/students/${id}` : '/students'}>
              <Button type="button" variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              size="md"
              isLoading={isSubmitting}
              icon={<Save className="w-4 h-4" />}
            >
              {isEditMode ? 'Update Student Record' : 'Register Student'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
