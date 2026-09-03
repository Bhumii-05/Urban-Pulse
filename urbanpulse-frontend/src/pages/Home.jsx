import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import AboutUs from "../components/AboutUs";
import LiveImpact from "../components/LiveImpact";
import Features from "../components/Features";
import ContactUs from "../components/ContactUs";
import FloatingChatbot from "../components/FloatingChatbot";
import background from "../assets/urbanpulse-background.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-500 selection:text-white">
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

      <FloatingChatbot />
    </div>
  );
}