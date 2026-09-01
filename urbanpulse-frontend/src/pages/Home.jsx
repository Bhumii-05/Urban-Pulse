import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import AboutUs from "../components/AboutUs";
import Features from "../components/Features";
import ContactUs from "../components/ContactUs";
import FloatingChatbot from "../components/FloatingChatbot";
import background from "../assets/urbanpulse-background.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-500 selection:text-white">
      <Navbar />
      
      {/* Hero Section */}
      <main
        className="relative bg-cover bg-center bg-no-repeat pt-24"
        style={{
          backgroundImage: `url(${background})`,
        }}
      >
        <Hero />
      </main>

      {/* Landing Page Content Sections */}
      <AboutUs />
      <Features />
      <ContactUs />

      {/* Chatbot & Floating Widgets */}
      <FloatingChatbot />
    </div>
  );
}