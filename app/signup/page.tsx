'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface SignupForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  department?: string;
  phoneNumber?: string;
  company?: string;
}

const roles = [
  {
    value: 1,
    label: 'Fleet Manager',
    icon: '🚢',
    desc: 'Manage fleet operations & approve bookings',
    needsApproval: true,
    color: 'from-blue-600/20 to-blue-800/20',
    border: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-400/60',
  },
  {
    value: 2,
    label: 'Captain',
    icon: '⚓',
    desc: 'Ship captain with full navigation access',
    needsApproval: true,
    color: 'from-teal-600/20 to-teal-800/20',
    border: 'border-teal-500/30',
    hoverBorder: 'hover:border-teal-400/60',
  },
  {
    value: 3,
    label: 'Employee',
    icon: '👤',
    desc: 'Request and book vessels for trips',
    needsApproval: false,
    color: 'from-purple-600/20 to-purple-800/20',
    border: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-400/60',
  },
  {
    value: 4,
    label: 'Customer',
    icon: '🏢',
    desc: 'Request cargo shipping services',
    needsApproval: false,
    color: 'from-orange-600/20 to-orange-800/20',
    border: 'border-orange-500/30',
    hoverBorder: 'hover:border-orange-400/60',
  },
];

function SignupContent() {
  const router = useRouter();
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<typeof roles[0] | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>();

  const onSubmit = async (data: SignupForm) => {
    if (!selectedRole) return;
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: selectedRole.value,
        department: data.department || null,
        phoneNumber: data.phoneNumber || null,
        company: data.company || null,
      });
      if (response.data.requiresApproval) {
        setSuccess(response.data.message);
      } else {
        setSuccess('Account created! Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response: { data: { message: string } } };
        setError(e.response?.data?.message || 'Registration failed.');
      } else {
        setError('Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050d1a] flex">

      {/* ── Left Video Panel ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="\vid\vid3.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#050d1a]/10 to-[#050d1a]/75" />

        {/* Video overlay content */}
        <div className="absolute bottom-3 left-3 right-0 p-12">
          <div className="w-12 h-1 bg-cyan-500 rounded-full mb-5" />
          <h2 className="text-3xl font-bold text-white mb-3">Join ShipFleet</h2>
          <p className="text-slate-300 text-base max-w-xs leading-relaxed mb-8">
            Professional maritime fleet management platform for modern shipping operations.
          </p>
          <div className="space-y-2.5">
            {['Real-time GPS ship tracking', 'Voyage planning & management', 'Cost analytics & reporting', 'Secure role-based access'].map(b => (
              <div key={b} className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 text-xs">✓</span>
                </div>
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-lg py-8">

          {/* Back button */}
          <Button
            onClick={() => step === 'form' ? setStep('role') : router.push('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            {step === 'form' ? 'Back to role selection' : 'Back to Home'}
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">
              ⚓
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">ShipFleet</p>
              <p className="text-blue-400 text-xs mt-0.5">Maritime Management</p>
            </div>
          </div>

          {/* ── STEP 1: Role Selection ── */}
          {step === 'role' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
              <p className="text-slate-400 text-sm mb-8">Select your role to get started</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {roles.map(role => (
                  <Card
                    key={role.value}
                    onClick={() => { setSelectedRole(role); setStep('form'); }}
                    className={`
                      cursor-pointer  border bg-gradient-to-br ${role.color} ${role.border} ${role.hoverBorder}
                      hover:-translate-y-1 hover:shadow-xl transition-all duration-200
                      bg-slate-900/80 backdrop-blur-sm
                    `}
                  >
                    <CardContent className="p-5">
                      {/* Icon + Badge row */}
                      <div className="flex items-center  justify-between mb-4">
                        <div className="w-12 h-12 bg-slate-800/80 rounded-xl flex items-center justify-center text-2xl">
                          {role.icon}
                        </div>
                        {role.needsApproval && (
                          <Badge variant="outline" className="text-yellow-400 border-yellow-500/40 bg-yellow-500/10 text-xs">
                            ⏳ Needs Approval
                          </Badge>
                        )}
                        {!role.needsApproval && (
                          <Badge variant="outline" className="text-green-400 border-green-500/40 bg-green-500/10 text-xs">
                            ✓ Instant Access
                          </Badge>
                        )}
                      </div>

                      {/* Label + desc */}
                      <p className="text-white font-semibold text-base mb-1">{role.label}</p>
                      <p className="text-slate-400 text-sm leading-snug">{role.desc}</p>

                      {/* Arrow */}
                      <div className="flex justify-end mt-4">
                        <span className="text-slate-600 text-sm group-hover:text-blue-400">→</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <p className="text-center text-slate-500 text-sm">
                Already have an account?{' '}
                <button onClick={() => router.push('/login')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Sign in
                </button>
              </p>
            </div>
          )}

          {/* ── STEP 2: Registration Form ── */}
          {step === 'form' && selectedRole && (
            <div>
              {/* Selected role badge */}
              <div className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${selectedRole.color} border ${selectedRole.border} mb-6`}>
                <span className="text-2xl">{selectedRole.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">Registering as {selectedRole.label}</p>
                  {selectedRole.needsApproval
                    ? <p className="text-yellow-400 text-xs mt-0.5">⏳ Account requires admin approval before access</p>
                    : <p className="text-green-400 text-xs mt-0.5">✓ Instant access after registration</p>
                  }
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">Your Details</h2>
              <p className="text-slate-400 text-sm mb-6">Fill in your information below</p>

              {/* Error / Success alerts */}
              {error && (
                <div className="flex items-start gap-3 bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm">
                  <span className="mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-3 bg-green-900/30 border border-green-700/50 text-green-400 px-4 py-3 rounded-xl mb-5 text-sm">
                  <span className="mt-0.5">✅</span>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm font-medium">Full Name *</Label>
                  <Input
                    {...register('fullName', { required: 'Full name is required' })}
                    placeholder="John Smith"
                    className="bg-slate-800/60 border-slate-700 focus:border-blue-500 text-white placeholder:text-slate-500 rounded-xl h-11"
                  />
                  {errors.fullName && <p className="text-red-400 text-xs">{errors.fullName.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm font-medium">Email Address *</Label>
                  <Input
                    {...register('email', { required: 'Email is required' })}
                    type="email"
                    placeholder="john@company.com"
                    className="bg-slate-800/60 border-slate-700 focus:border-blue-500 text-white placeholder:text-slate-500 rounded-xl h-11"
                  />
                  {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                </div>

                {/* Password row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm font-medium">Password *</Label>
                    <Input
                      {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-800/60 border-slate-700 focus:border-blue-500 text-white placeholder:text-slate-500 rounded-xl h-11"
                    />
                    {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm font-medium">Confirm *</Label>
                    <Input
                      {...register('confirmPassword', { required: 'Required' })}
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-800/60 border-slate-700 focus:border-blue-500 text-white placeholder:text-slate-500 rounded-xl h-11"
                    />
                    {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                {/* Department + Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm font-medium">Department</Label>
                    <Input
                      {...register('department')}
                      placeholder="Operations"
                      className="bg-slate-800/60 border-slate-700 focus:border-blue-500 text-white placeholder:text-slate-500 rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm font-medium">Phone</Label>
                    <Input
                      {...register('phoneNumber')}
                      placeholder="+1 234 567 8900"
                      className="bg-slate-800/60 border-slate-700 focus:border-blue-500 text-white placeholder:text-slate-500 rounded-xl h-11"
                    />
                  </div>
                </div>

                {/* Company */}
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm font-medium">Company</Label>
                  <Input
                    {...register('company')}
                    placeholder="Maritime Corp Ltd."
                    className="bg-slate-800/60 border-slate-700 focus:border-blue-500 text-white placeholder:text-slate-500 rounded-xl h-11"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading || !!success}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all text-base mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : `Create ${selectedRole.label} Account →`}
                </Button>
              </form>

              <p className="text-center text-slate-500 text-sm mt-5">
                Already have an account?{' '}
                <button onClick={() => router.push('/login')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050d1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}