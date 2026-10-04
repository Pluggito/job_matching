const fs = require('fs');
const path = require('path');
const base = 'apps/web/src/app';

const files = {
  '(public)/page.tsx': `export default function Landing() { return <div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8'><h1 className='text-5xl font-extrabold tracking-tight text-blue-900 mb-4'>STAFF GURU</h1><p className='text-xl text-slate-600 mb-8 text-center max-w-2xl'>Connecting skilled artisans with employers across Nigeria. Quality talent, verified and ready.</p><div className='flex gap-4'><a href='/login' className='px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition'>Login</a><a href='/signup' className='px-6 py-3 bg-white text-slate-900 font-medium rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition'>Sign Up</a></div></div>; }`,
  '(public)/terms/page.tsx': `export default function Terms() { return <div className='p-8 max-w-4xl mx-auto'><h1>Terms & Conditions</h1></div>; }`,
  '(public)/login/page.tsx': `export default function Login() { return <div className='min-h-screen flex items-center justify-center bg-slate-50'><div className='bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-md'></div></div>; }`,
  '(public)/signup/page.tsx': `export default function Signup() { return <div className='min-h-screen flex items-center justify-center bg-slate-50'><div className='bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-md'></div></div>; }`,
  'jobs/layout.tsx': `export default function JobsLayout({ children }: { children: React.ReactNode }) { return <div className='min-h-screen bg-slate-50'><nav className='bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10'><div className='font-bold text-xl text-blue-700 tracking-tight'>STAFF GURU</div><div className='flex items-center gap-4'><button className='p-2 rounded-full hover:bg-slate-100 transition'>🔔</button></div></nav><main className='max-w-7xl mx-auto p-6'>{children}</main></div>; }`,
  'jobs/(worker)/onboarding/page.tsx': `export default function WorkerOnboarding() { return <div><h2 className='text-2xl font-semibold mb-6'>Welcome! Let's get you set up</h2></div>; }`,
  'jobs/(worker)/profile/page.tsx': `export default function WorkerProfile() { return <div><h2 className='text-2xl font-semibold mb-6'>Your Profile</h2></div>; }`,
  'jobs/(worker)/status/page.tsx': `export default function WorkerStatus() { return <div><h2 className='text-2xl font-semibold mb-6'>Application Status</h2></div>; }`,
  'jobs/(employer)/search/page.tsx': `export default function EmployerSearch() { return <div><h2 className='text-2xl font-semibold mb-6'>Find Artisans</h2></div>; }`,
  'jobs/(employer)/shortlist/page.tsx': `export default function EmployerShortlist() { return <div><h2 className='text-2xl font-semibold mb-6'>Your Shortlist</h2></div>; }`,
  'jobs/(employer)/workers/[id]/page.tsx': `export default function WorkerView({ params }: { params: { id: string } }) { return <div><h2 className='text-2xl font-semibold mb-6'>Worker Profile {params.id}</h2></div>; }`,
  'jobs/(employer)/placements/page.tsx': `export default function EmployerPlacements() { return <div><h2 className='text-2xl font-semibold mb-6'>Your Placements</h2></div>; }`,
  'jobs/messages/page.tsx': `export default function Messages() { return <div><h2 className='text-2xl font-semibold mb-6'>Messages</h2></div>; }`,
  'jobs/notifications/page.tsx': `export default function Notifications() { return <div><h2 className='text-2xl font-semibold mb-6'>Notifications</h2></div>; }`,
  'admin/layout.tsx': `export default function AdminLayout({ children }: { children: React.ReactNode }) { return <div className='min-h-screen flex'><aside className='w-64 bg-slate-900 text-slate-300 p-6 flex flex-col'><div className='font-bold text-2xl text-white tracking-tight mb-10'>Staff Guru Admin</div><nav className='flex flex-col gap-2'></nav></aside><main className='flex-1 p-8 bg-slate-50 overflow-y-auto'>{children}</main></div>; }`,
  'admin/workers/page.tsx': `export default function AdminWorkers() { return <div><h2 className='text-2xl font-semibold mb-6'>Manage Workers</h2></div>; }`,
  'admin/employers/page.tsx': `export default function AdminEmployers() { return <div><h2 className='text-2xl font-semibold mb-6'>Manage Employers</h2></div>; }`,
  'admin/placements/page.tsx': `export default function AdminPlacements() { return <div><h2 className='text-2xl font-semibold mb-6'>Manage Placements</h2></div>; }`,
  'admin/messages/page.tsx': `export default function AdminMessages() { return <div><h2 className='text-2xl font-semibold mb-6'>Manage Messages</h2></div>; }`,
  'admin/ratings/page.tsx': `export default function AdminRatings() { return <div><h2 className='text-2xl font-semibold mb-6'>Manage Ratings</h2></div>; }`,
  'api/payments/webhook/route.ts': `export async function POST(req: Request) { return Response.json({ success: true }); }`,
  'api/push/route.ts': `export async function POST(req: Request) { return Response.json({ success: true }); }`,
};

Object.entries(files).forEach(([filepath, content]) => {
  const fullPath = path.join(base, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
});
console.log('Created files');
