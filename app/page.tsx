// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';

// const slides = [
//   {
//     video: 'https://videos.pexels.com/video-files/3576378/3576378-uhd_2560_1440_25fps.mp4',
//     title: 'Command Your Fleet',
//     subtitle: 'Real-time tracking and management of your entire cargo fleet from one powerful dashboard.',
//   },
//   {
//     video: 'https://videos.pexels.com/video-files/2294098/2294098-uhd_2560_1440_24fps.mp4',
//     title: 'Navigate the Seas',
//     subtitle: 'Monitor live GPS positions of every vessel across global shipping routes.',
//   },
//   {
//     video: 'https://videos.pexels.com/video-files/1739010/1739010-hd_1920_1080_24fps.mp4',
//     title: 'Optimize Operations',
//     subtitle: 'Track fuel consumption, maintenance, voyages and costs with powerful analytics.',
//   },
// ];

// export default function LandingPage() {
//   const { user } = useAuth();
//   const router = useRouter();
//   const [current, setCurrent] = useState(0);
//   const [loaded, setLoaded] = useState(false);

//   useEffect(() => {
//   const timer = setTimeout(() => {
//     if (user) router.push('/dashboard');
//     setLoaded(true);
//   }, 0);
//   return () => clearTimeout(timer);
// }, [user, router]);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrent(prev => (prev + 1) % slides.length);
//     }, 8000);
//     return () => clearInterval(timer);
//   }, []);

//   if (!loaded) return null;

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-[#050d1a]">

//       {/* Video Carousel Background */}
//       {slides.map((slide, i) => (
//         <div
//           key={i}
//           className={`absolute inset-0 transition-opacity duration-2000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
//         >
//           <video
//             autoPlay
//             muted
//             loop
//             playsInline
//             className="absolute inset-0 w-full h-full object-cover"
//           >
//             <source src={slide.video} type="video/mp4" />
//           </video>
//           {/* Dark overlay */}
//           <div className="absolute inset-0 bg-gradient-to-red from-[#050d1a]/95 via-[#050d1a]/70 to-[#050d1a]/40" />
//         </div>
//       ))}

//       {/* Content */}
//       <div className="relative z-10 min-h-screen flex">

//         {/* Left side — Branding + Slide text */}
//         <div className="flex-1 flex flex-col mt-4 justify-between p-8 md:p-16">

//           {/* Logo */}
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-brown from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-xl">
//               ⚓
//             </div>
//             <div>
//               <h1 className="text-white font-bold text-xl">ShipFleet</h1>
//               <p className="text-blue-400 text-xs">Maritime Management</p>
//             </div>
//           </div>

//           {/* Slide text */}
//           <div className="max-w-lg">
//             {slides.map((slide, i) => (
//               <div
//                 key={i}
//                 className={`transition-all duration-700 ${i === current ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute'}`}
//               >
//                 {i === current && (
//                   <>
//                     <div className="w-12 h-1 bg-blue-500 rounded mb-6" />
//                     <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
//                       {slide.title}
//                     </h2>
//                     <p className="text-slate-300 text-lg leading-relaxed">
//                       {slide.subtitle}
//                     </p>
//                   </>
//                 )}
//               </div>
//             ))}

//             {/* Slide indicators */}
//             <div className="flex gap-2 mt-8">
//               {slides.map((_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setCurrent(i)}
//                   className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-blue-500' : 'w-4 bg-slate-600'}`}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-3 gap-6 max-w-md">
//             {[
//               { value: '8+', label: 'Ships Managed' },
//               { value: '8', label: 'Global Ports' },
//               { value: '24/7', label: 'Live Tracking' },
//             ].map(stat => (
//               <div key={stat.label}>
//                 <p className="text-2xl font-bold text-blue-400">{stat.value}</p>
//                 <p className="text-slate-400 text-sm">{stat.label}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Right side — Login/Signup Card */}
//         <div className="flex items-center justify-center p-8 md:p-16 w-full md:w-auto">
//           <div className="bg-[#0d1424]/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 w-full max-w-sm shadow-2xl">

//             {/* Card Header */}
//             <div className="text-center mb-8">
//               <div className="w-14 h-14 bg-gradient-to-brown from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/20">
//                 ⚓
//               </div>
//               <h3 className="text-xl font-bold text-white">Welcome to ShipFleet</h3>
//               <p className="text-slate-400 text-sm mt-1">Maritime Fleet Management System</p>
//             </div>

//             {/* Buttons */}
//             <div className="space-y-4">
//               <button
//                 onClick={() => router.push('/login')}
//                 className="w-full bg-gradient-to-red from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
//               >
//                 Sign In to Your Account
//               </button>

//               <button
//                 onClick={() => router.push('/signup')}
//                 className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-white font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5"
//               >
//                 Create New Account
//               </button>
//             </div>

//             {/* Divider */}
//             <div className="flex items-center gap-3 my-6">
//               <div className="flex-1 h-px bg-slate-700" />
//               <span className="text-slate-500 text-xs">OR CONTINUE AS</span>
//               <div className="flex-1 h-px bg-slate-700" />
//             </div>

//             {/* Role Badges */}
//             <div className="grid grid-cols-2 gap-2">
//               {[
//                 { role: 'Fleet Manager', icon: '🚢', color: 'blue' },
//                 { role: 'Captain', icon: '⚓', color: 'teal' },
//                 { role: 'Employee', icon: '👤', color: 'purple' },
//                 { role: 'Customer', icon: '🏢', color: 'orange' },
//               ].map(item => (
//                 <button
//                   key={item.role}
//                   onClick={() => router.push(`/signup?role=${item.role.replace(' ', '')}`)}
//                   className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 transition-all text-left"
//                 >
//                   <span className="text-lg">{item.icon}</span>
//                   <span className="text-slate-300 text-xs font-medium">{item.role}</span>
//                 </button>
//               ))}
//             </div>

//             <p className="text-center text-slate-600 text-xs mt-6">
//               ShipFleet v1.0 • Secure Maritime Platform
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";


const videos = [
    '/vid/vid1.mp4',
    '/vid/vid2.mp4',
    '/vid/vid3.mp4',
];

const slides = [
    { title: 'Command Your Fleet', subtitle: 'Real-time tracking and management of your entire cargo fleet from one powerful dashboard.' },
    { title: 'Navigate the Seas', subtitle: 'Monitor live GPS positions of every vessel across global shipping routes.' },
    { title: 'Optimize Operations', subtitle: 'Track fuel consumption, maintenance, voyages and costs with powerful analytics.' },
];

export default function LandingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [current, setCurrent] = useState(0);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (user) router.push('/dashboard');
            setLoaded(true);
        }, 0);
        return () => clearTimeout(timer);
    }, [user, router]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent(prev => (prev + 1) % videos.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    if (!loaded) return (
        <div className="min-h-screen bg-[#050d1a] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );




    return (
        <div className="relative min-h-screen w-full overflow-hidden">

            {/* Full screen video background */}
            {videos.map((src, i) => (
                <div
                    key={i}
                    className={`absolute inset-0 transition-opacity duration-1500 ${i === current ? 'opacity-100' : 'opacity-0'}`}
                >
                    <video
                        autoPlay muted loop playsInline
                        className="w-full h-full object-cover"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    >
                        <source src={src} type="video/mp4" />
                    </video>
                </div>
            ))}

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute bg-linear-to-b from-black/30 via-transparent to-black/70" />

            {/* Content */}
            <div className="relative max-w-7xl  mb-4  px-6 md:px-10 lg:px-16 z-10 min-h-screen flex mt-0 flex-col">

                {/* Navbar */}

                <nav className="flex items-center lg:w-5xl justify-between pt-6 md:pt-8">

                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-lg font-bold">
                            ⚓
                        </div>

                        <div className="leading-tight">
                            <span className="text-white font-bold text-lg block">
                                ShipFleet
                            </span>
                            <span className="text-blue-400 text-xs">
                                Maritime Management
                            </span>
                        </div>
                    </div>

                    {/* Desktop Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button
                            onClick={() => router.push('/login')}
                            className="px-6 py-3 w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30"
                        >
                            🔐 Sign In
                        </Button>

                        <Button
                            onClick={() => router.push('/signup')}
                            className="px-6 py-3 w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl transition-all"
                        >
                            🚀 Create Account
                        </Button>
                    </div>

                </nav>



                {/* Hero Section */}
                <div className="flex-1 flex flex-col gap-4 items-center justify-center px-6 md:px-12 text-center">

                    {/* Badge */}
                    <div className="inline-flex mb-3 items-center gap-2 bg-blue-500/20 border border-blue-500/30 backdrop-blur-sm rounded-full px-5 py-3">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-blue-300 text-sm font-medium">Live Fleet Tracking Active</span>
                    </div>

                    {/* Slide text */}
                    <div className="h-36 md:h-32 flex flex-col items-center justify-center mb-6">
                        {slides.map((slide, i) => (
                            <div
                                key={i}
                                className={`absolute transition-all duration-700 text-center px-4 ${i === current
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-6 pointer-events-none'}`}
                            >
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                                    {slide.title}
                                </h1>
                                <p className="text-slate-300 text-base md:text-xl max-w-2xl mx-auto">
                                    {slide.subtitle}
                                </p>
                            </div>
                        ))}
                    </div>


                    {/* Stats */}
                    <div className="grid grid-cols-3 mt-6 gap-6 md:gap-12">
                        {[
                            { value: '8', label: 'Ships Managed' },
                            { value: '8', label: 'Global Ports' },
                            { value: '24/7', label: 'Live Tracking' },
                        ].map(stat => (
                            <div key={stat.label} className="text-center">
                                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                                <p className="text-slate-400 text-xs md:text-sm mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Slide indicators */}
                <div className="flex justify-center mt-0 gap-2 mb-8 sm:mb-12">
                    {videos.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-blue-400' : 'w-3 bg-white/30'}`}
                        />
                    ))}
                </div>



                {/* Mobile buttons at bottom */}
                <div className="md:hidden items-center flex flex-col gap-3 px-6 pb-8">
                    <Button
                        onClick={() => router.push('/login')}
                        className="w-fit  px-8 py-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-xl shadow-blue-500/30 hover:-translate-y-0.5 text-base"
                    >
                        🔐 Sign In to Dashboard
                    </Button>
                    <Button
                        onClick={() => router.push('/signup')}
                        className="w-fit px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 hover:border-white/50 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 text-base"
                    >
                        🚀 Create New Account
                    </Button>
                </div>

            </div>
        </div>
    );
}


