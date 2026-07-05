'use client';
import React, { useState, useEffect } from 'react';
import {
  Search,
  Check,
  X,
  ShieldAlert,
  GraduationCap,
  Calendar,
  Eye,
  Mail,
  Phone,
  User,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

type StudentUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isStudent: boolean;
  studentStatus: 'Pending' | 'Approved' | 'Declined';
  studentOfficialEmail: string;
  studentIdCardUrl: string;
  studentVerifiedAt?: any;
  studentDiscount?: number;
};

export default function StudentApprovalsClient() {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Declined'>('Pending');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [globalStudentDiscount, setGlobalStudentDiscount] = useState<number>(30);

  // Fetch student discount from settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'global'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.studentDiscount !== undefined) {
            setGlobalStudentDiscount(data.studentDiscount);
          }
        }
      } catch (err) {
        console.error('Error fetching global student discount settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Subscribe to students list
  useEffect(() => {
    const q = query(collection(db, 'users'), where('isStudent', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      const fetched: StudentUser[] = [];
      snap.docs.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          name: data.name || 'Unknown',
          email: data.email || 'N/A',
          phone: data.phone || 'N/A',
          isStudent: data.isStudent,
          studentStatus: data.studentStatus || 'Pending',
          studentOfficialEmail: data.studentOfficialEmail || 'N/A',
          studentIdCardUrl: data.studentIdCardUrl || '',
          studentVerifiedAt: data.studentVerifiedAt,
          studentDiscount: data.studentDiscount,
        });
      });
      setStudents(fetched);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleApprove = async (studentId: string) => {
    setActionLoadingId(studentId);
    try {
      await updateDoc(doc(db, 'users', studentId), {
        studentStatus: 'Approved',
        studentDiscount: globalStudentDiscount,
        studentVerifiedAt: serverTimestamp(),
      });
      toast.success('Student verified and approved successfully! 🎓');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to approve student verification.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (studentId: string) => {
    setActionLoadingId(studentId);
    try {
      await updateDoc(doc(db, 'users', studentId), {
        studentStatus: 'Declined',
        studentVerifiedAt: serverTimestamp(),
      });
      toast.success('Student verification declined.');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to decline student verification.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredStudents = students
    .filter((s) => s.studentStatus === activeTab)
    .filter((s) => {
      const queryStr = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(queryStr) ||
        s.email.toLowerCase().includes(queryStr) ||
        s.studentOfficialEmail.toLowerCase().includes(queryStr)
      );
    });

  const tabCounts = {
    Pending: students.filter((s) => s.studentStatus === 'Pending').length,
    Approved: students.filter((s) => s.studentStatus === 'Approved').length,
    Declined: students.filter((s) => s.studentStatus === 'Declined').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E3B2B]">Student Discount Approvals</h1>
          <p className="text-sm text-muted-foreground">
            Manage and verify student status submissions
          </p>
        </div>
        <div className="bg-[#C39B54]/10 border border-[#C39B54]/30 px-4 py-3 rounded-2xl flex items-center gap-3">
          <GraduationCap className="text-[#C39B54]" size={24} />
          <div>
            <p className="text-[10px] font-800 text-[#C39B54] uppercase tracking-wider">
              Active Student Discount
            </p>
            <p className="text-sm font-800 text-foreground">{globalStudentDiscount}% Off Orders</p>
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl border border-border self-start">
          {(['Pending', 'Approved', 'Declined'] as const).map((tab) => {
            const count = tabCounts[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearch('');
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-700 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-[#1E3B2B] shadow-sm border border-border/50'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-[#1E3B2B] text-white' : 'bg-gray-200 text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3B2B]/20 focus:border-[#1E3B2B] shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Main content grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-border p-24 text-center shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3B2B] mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading applications...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-20 text-center shadow-sm">
          <GraduationCap size={48} className="text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="font-800 text-lg text-foreground mb-1">No Applications Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {search
              ? 'No student accounts match your current search query.'
              : `There are currently no users in the ${activeTab.toLowerCase()} list.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:border-[#1E3B2B]/30 transition-all flex flex-col md:flex-row gap-5"
            >
              {/* ID Card Image Card */}
              <div className="w-full md:w-48 shrink-0">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-border bg-gray-50 group">
                  {student.studentIdCardUrl ? (
                    <>
                      <img
                        src={student.studentIdCardUrl}
                        alt={`${student.name}'s ID Card`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setSelectedImageUrl(student.studentIdCardUrl)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="bg-white/90 text-foreground px-3 py-1.5 rounded-lg text-xs font-800 flex items-center gap-1.5 shadow-md">
                          <Eye size={12} /> View Card
                        </div>
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/60 p-4">
                      <ShieldAlert size={28} className="mb-2" />
                      <p className="text-[10px] font-800 text-center">No Image Uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Details & Action side */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="space-y-3">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-800 px-2.5 py-0.5 rounded-full border mb-2 ${
                        student.studentStatus === 'Approved'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : student.studentStatus === 'Declined'
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {student.studentStatus === 'Pending' && <Clock size={10} />}
                      {student.studentStatus === 'Approved' && <CheckCircle2 size={10} />}
                      {student.studentStatus === 'Declined' && <XCircle size={10} />}
                      {student.studentStatus} Review
                    </span>
                    <h3 className="font-800 text-base text-foreground truncate">{student.name}</h3>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User size={13} className="shrink-0" />
                      <span className="truncate">Sign Up: {student.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="shrink-0 text-primary" />
                      <span className="font-700 text-foreground truncate">
                        Official: {student.studentOfficialEmail}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="shrink-0" />
                      <span>Phone: {student.phone}</span>
                    </div>
                    {student.studentVerifiedAt && (
                      <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                        <Calendar size={13} className="shrink-0" />
                        <span>
                          Actioned:{' '}
                          {student.studentVerifiedAt.toDate
                            ? student.studentVerifiedAt.toDate().toLocaleDateString('en-GB')
                            : 'Recently'}
                        </span>
                      </div>
                    )}
                    {student.studentDiscount !== undefined &&
                      student.studentStatus === 'Approved' && (
                        <div className="mt-1 font-800 text-[#C39B54] bg-[#C39B54]/10 inline-block px-2 py-0.5 rounded">
                          Applied Offer: {student.studentDiscount}% Discount
                        </div>
                      )}
                  </div>
                </div>

                {/* Actions */}
                {student.studentStatus === 'Pending' && (
                  <div className="flex gap-2.5 mt-5">
                    <button
                      type="button"
                      disabled={actionLoadingId !== null}
                      onClick={() => handleApprove(student.id)}
                      className="flex-1 bg-[#1E3B2B] hover:bg-[#14261A] text-white text-xs font-700 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {actionLoadingId === student.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Check size={14} /> Approve
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={actionLoadingId !== null}
                      onClick={() => handleDecline(student.id)}
                      className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-700 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {actionLoadingId === student.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <X size={14} /> Decline
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Re-action options for past states */}
                {student.studentStatus !== 'Pending' && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, 'users', student.id), {
                            studentStatus: 'Pending',
                          });
                          toast.info('Returned to Pending status for re-review.');
                        } catch (e) {
                          toast.error('Failed to change status.');
                        }
                      }}
                      className="text-[11px] font-700 text-[#C39B54] hover:underline"
                    >
                      Reset to Review Status
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImageUrl && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button
            onClick={() => setSelectedImageUrl(null)}
            className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors border border-white/20"
          >
            <X size={20} />
          </button>
          <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center overflow-hidden animate-in zoom-in-95 duration-200">
            <img
              src={selectedImageUrl}
              alt="Student ID Card Full Screen"
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
