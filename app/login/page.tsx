// 'use client';

// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import api from '@/lib/api';
// import { Button } from '@/components/ui/button';

// interface LoginForm {
//   email: string;
//   password: string;
// }

// export default function LoginPage() {
//   const { login } = useAuth();
//   const router = useRouter();
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

//   const onSubmit = async (data: LoginForm) => {
//     setLoading(true);
//     setError('');
//     try {
//       const response = await api.post('/auth/login', data);
//       login(response.data);
//     } catch (err: unknown) {
//       if (err && typeof err === 'object' && 'response' in err) {
//         const e = err as { response: { data: { message: string } } };
//         setError(e.response?.data?.message || 'Login failed.');
//       } else {
//         setError('Login failed. Try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#050d1a] flex">
//       {/* Left — Video */}
//       <div className="hidden lg:block flex-1 relative overflow-hidden">
//         <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
//           <source src="\vid\vid2.mp4" type="video/mp4" />
//         </video>
//         <div className="absolute inset-0 bg-gradient-to-r from-[#050d1a]/20 to-[#050d1a]/60" />
//         <div className="absolute bottom-12 left-12 right-12">
//           <div className="w-10 h-1 bg-blue-500 rounded mb-4" />
//           <h2 className="text-3xl font-bold text-white mb-2">Navigate with Confidence</h2>
//           <p className="text-slate-300">Professional maritime fleet management at your fingertips.</p>
//         </div>
//       </div>

//       {/* Right — Form */}
//       <div className="flex-1 flex items-center justify-center p-8">
//         <div className="w-full max-w-md">

//           {/* Back button */}
//           <Button
//             onClick={() => router.push('/')}
//             className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-10 text-sm"
//           >
//             ← Back to Home
//           </Button>

//           {/* Logo */}
//           <div className="flex items-center gap-3 mb-8">
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-xl">
//               ⚓
//             </div>
//             <div>
//               <h1 className="text-white font-bold text-lg">ShipFleet</h1>
//               <p className="text-blue-400 text-xs">Maritime Management</p>
//             </div>
//           </div>

//           <h2 className="text-2xl font-bold  text-white mb-1">Welcome back</h2>
//           <p className="text-slate-400 text-sm mb-8">Sign in to your account to continue</p>

//           {/* Error */}
//           {error && (
//             <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
//               ⚠️ {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
//               <input
//                 {...register('email', { required: 'Email is required' })}
//                 type="email"
//                 className="w-full bg-slate-800/50 border border-slate-700 hover:border-slate-600 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder-slate-500"
//                 placeholder="captain@shipfleet.com"
//               />
//               {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
//               <input
//                 {...register('password', { required: 'Password is required' })}
//                 type="password"
//                 className="w-full bg-slate-800/50 border border-slate-700 hover:border-slate-600 focus:border-blue-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder-slate-500"
//                 placeholder="••••••••"
//               />
//               {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
//             </div>

//             <Button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-blue-800 disabled:to-blue-900 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 mt-2"
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                   Signing in...
//                 </span>
//               ) : 'Sign In'}
//             </Button>
//           </form>

//           <p className="text-center text-slate-500 text-sm mt-6">
//             Don&apos;t have an account?{' '}
//             <Button onClick={() => router.push('/signup')} className="text-blue-400 bg-blue-1000 hover:text-blue-300 font-medium transition-colors">
//               Create one
//             </Button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', data);
      login(response.data);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response: { data: { message: string } } };
        setError(e.response?.data?.message || 'Login failed.');
      } else {
        setError('Login failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050d1a] flex">

      {/* Left — Video */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="\vid\vid3.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#050d1a]/10 to-[#050d1a]/75" />
        <div className="absolute bottom-3 left-3 right-0 p-12">
          <div className="w-12 h-1 bg-blue-500 rounded-full mb-5" />
          <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
          <p className="text-slate-300 text-base max-w-xs leading-relaxed">
            Sign in to manage your maritime fleet operations in real-time.
          </p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">

        {/* Back button */}
        <div className="w-full max-w-sm mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Home
          </button>
        </div>

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

        {/* Card */}
        <Card className="w-full max-w-sm bg-gradient-to-r from-[#050d1a]/10 to-[#050d1a]/75 border-slate-700/60 backdrop-blur-sm shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Sign In</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Error alert */}
            {error && (
              <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} id="login-form">
              <div className="flex flex-col gap-5">

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-slate-300 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="captain@shipfleet.com"
                    {...register('email', { required: 'Email is required' })}
                    className="bg-slate-800/60 border-slate-700 focus:border-blue-500 text-white placeholder:text-slate-500 rounded-xl h-11"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-300 font-medium">
                      Password
                    </Label>
                    <button
                      type="button"
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })}
                    className="bg-slate-800/60 border-slate-700 focus:border-blue-500 text-white placeholder:text-slate-500 rounded-xl h-11"
                  />
                  {errors.password && (
                    <p className="text-red-400 text-xs">{errors.password.message}</p>
                  )}
                </div>

              </div>
            </form>
          </CardContent>

          <CardFooter className="flex-col bg-gradient-to-r from-[#050d1a]/10 to-[#050d1a]/75 gap-3 pt-2">
            <Button
              type="submit"
              form="login-form"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-[#050d1a]/10 to-[#050d1a]/75 hover:from-slate-500 hover:to-slate-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30  rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : '🔐 Sign In to Dashboard'}
            </Button>

            <div className="flex items-center gap-3 w-full my-1">
              <div className="flex-1 h-px bg-gradient-to-r from-[#050d1a]/10 to-[#050d1a]/75" />
              <span className="text-slate-500 text-xs">OR</span>
              <div className="flex-1 h-px bg-gradient-to-r from-[#050d1a]/10 to-[#050d1a]/75" />
            </div>

            <Button
              variant="outline"
              className="w-full h-11 border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-xl transition-all text-sm"
              onClick={() => router.push('/signup')}
            >
              🚀 Create New Account
            </Button>

          </CardFooter>
        </Card>

        <p className="text-slate-600 text-xs mt-6">
          ShipFleet v1.0 • Secure Maritime Platform
        </p>
      </div>
    </div>
  );
}