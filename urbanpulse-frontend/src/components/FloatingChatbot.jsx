import { MessageCircle } from 'lucide-react'

export default function FloatingChatbot() {
  return (
    <>
      <style>{`
        @keyframes urbanPulseFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes urbanPulseGlow {
          0%, 100% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 0.55;
            transform: scale(1.12);
          }
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-[9999] group">

        {/* Soft floating glow */}
        <div
          className="
            absolute inset-0
            rounded-full
            bg-[#8FD14F]/20
            blur-xl
            scale-125
          "
          style={{
            animation: 'urbanPulseGlow 3s ease-in-out infinite',
          }}
        />

        {/* Tooltip */}
        <div
          className="
            absolute right-20 top-1/2 -translate-y-1/2
            whitespace-nowrap
            rounded-lg
            bg-[#004D40]
            px-4 py-2
            text-sm font-medium text-white
            shadow-xl
            opacity-0
            translate-x-2
            pointer-events-none
            group-hover:opacity-100
            group-hover:translate-x-0
            transition-all duration-300
          "
        >
          Ask UrbanPulse AI
        </div>

        {/* Floating AI Chat Button */}
        <button
          onClick={() => {
            console.log('UrbanPulse AI opened')
          }}
          aria-label="Open UrbanPulse AI"
          className="
            relative
            flex h-16 w-16
            items-center justify-center
            rounded-full
            bg-[#005B4F]
            text-white
            shadow-[0_12px_35px_rgba(0,91,79,0.45)]
            transition-all duration-300
            hover:scale-110
            hover:bg-[#00483F]
            hover:shadow-[0_16px_45px_rgba(0,91,79,0.55)]
            active:scale-95
          "
          style={{
            animation: 'urbanPulseFloat 3s ease-in-out infinite',
          }}
        >
          <MessageCircle size={29} strokeWidth={2} />

          {/* Notification dot */}
          <span
            className="
              absolute right-1 top-1
              h-3 w-3
              rounded-full
              border-2 border-white
              bg-[#8FD14F]
            "
          />
        </button>
      </div>
    </>
  )
}
