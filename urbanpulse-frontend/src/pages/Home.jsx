import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FloatingChatbot from "../components/FloatingChatbot";
import background from "../assets/urbanpulse-background.png";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${background})`,
        }}
      >
        <Hero />
      </main>
      <FloatingChatbot />
    </div>
  );
}
