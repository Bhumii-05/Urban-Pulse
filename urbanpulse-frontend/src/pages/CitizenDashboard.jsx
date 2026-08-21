export default function CitizenDashboard() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a1f14] p-6 text-center text-white">
      <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
        <h1 className="text-3xl font-extrabold text-[#2FBE86]">
          Citizen Portal
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          Welcome to UrbanPulse! Your citizen dashboard is under development.
        </p>
        <div className="mt-6 rounded-xl bg-white/10 px-4 py-2 text-xs font-medium text-[#8FD35F]">
          Authentication & Role Redirection: Verified
        </div>
      </div>
    </div>
  )
}