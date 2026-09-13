import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import AboutUs from "../components/AboutUs";
import LiveImpact from "../components/LiveImpact";
import Features from "../components/Features";
import ContactUs from "../components/ContactUs";
import FloatingChatbot from "../components/FloatingChatbot";
import background from "../assets/urbanpulse-background.png";
import jslLogo from "../assets/jsl-logo.jpg";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-500 selection:text-white flex flex-col">
      <Navbar />

      {/* 1. Hero */}
      <main
        className="relative bg-cover bg-center bg-no-repeat pt-24"
        style={{ backgroundImage: `url(${background})` }}
      >
        <Hero />
      </main>

      {/* 2. Orientation: Who we are & 6 Role Features */}
      <AboutUs />

      {/* 3. Proof: Real-time Green Metrics & SLA Gauges */}
      <LiveImpact />

      {/* 4. Deep Dive: Extended Feature Walkthroughs */}
      <Features />

      {/* 5. Support & City Hotline */}
      <ContactUs />

      {/* 6. Co-Branded Footer Signature */}
      <footer className="w-full border-t border-slate-200 bg-white py-5 px-4 mt-auto">
        <div className="mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-xs text-slate-500">
          <span>© 2026 UrbanPulse. All rights reserved.</span>
          
          <span className="hidden sm:inline text-slate-300">•</span>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Developed under</span>
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 shadow-xs">
              <div className="h-6 w-6 shrink-0 overflow-hidden rounded-md bg-black flex items-center justify-center p-0.5">
                <img
                  src={jslLogo}
                  alt="JSL Works Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-semibold text-slate-800 text-xs whitespace-nowrap">
                JSL Works Summer Internship Programme 2026
              </span>
            </div>
          </div>
        </div>
      </footer>

      <FloatingChatbot />
    </div>
  );
}
