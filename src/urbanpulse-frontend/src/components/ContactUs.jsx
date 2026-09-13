import { useState } from "react";
import {
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  MessageSquareCode,
  Laptop,
} from "lucide-react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const SUPPORT_EMAIL = "urbanpulsesupport@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Construct direct mailto to forward the query straight to your Gmail
    const mailSubject = encodeURIComponent(
      `[UrbanPulse Query] ${formData.subject}`
    );
    const mailBody = encodeURIComponent(
      `Sender Name: ${formData.name}\n` +
      `Sender Email: ${formData.email}\n\n` +
      `Message:\n${formData.message}`
    );

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${mailSubject}&body=${mailBody}`;

    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section id="contact" className="relative bg-[#F4F8F6] py-20 lg:py-28">
      <div className="mx-auto max-w-[1300px] px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-3.5 py-1 text-xs font-semibold text-[#005B4F] ring-1 ring-inset ring-emerald-600/20">
            Get In Touch
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Contact Support & Feedback
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Have suggestions, technical queries, or feedback about the platform? Reach out directly to our project team.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Left: Contact Info Card */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-[#003D36] p-7 sm:p-9 text-white shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-[#8FD35F] ring-1 ring-emerald-500/30 mb-4">
                <Laptop className="h-3.5 w-3.5" />
                Online Support Desk
              </div>
              <h3 className="text-2xl font-bold">UrbanPulse Team</h3>
              <p className="mt-2 text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                As a cloud-hosted smart civic project, we provide direct digital support for issue escalations, bug reports, and civic recommendations.
              </p>

              <div className="mt-8 space-y-5">
                {/* Primary Email */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#8FD35F]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/60">Official Support Email</p>
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="text-sm font-semibold hover:text-[#8FD35F] transition-colors break-all"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    title="Copy Email"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 transition"
                  >
                    {copied ? <Check className="h-4 w-4 text-[#8FD35F]" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {/* Instant AI Assistance */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#8FD35F]">
                    <MessageSquareCode className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Instant Queries</p>
                    <p className="text-sm font-semibold">UrbanPulse AI Assistant</p>
                    <p className="text-[11px] text-emerald-200/70 mt-0.5">Available 24/7 on the bottom right corner</p>
                  </div>
                </div>

                {/* Response Time */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#8FD35F]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Response Time</p>
                    <p className="text-sm font-semibold">Within 24 – 48 Hours</p>
                    <p className="text-[11px] text-emerald-200/70 mt-0.5">All inbox queries are tracked and answered</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-[11px] text-emerald-100/60">
              Developed under JSL Works Summer Internship Programme 2026.
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7 flex flex-col justify-center rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Send an Inquiry</h3>
            <p className="mt-1 text-xs text-slate-500">
              Drop your message below to send an email directly to our support inbox.
            </p>

            {submitted && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Your email client was opened. You can review and confirm sending your query!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Issue reporting feedback / Ward suggestion query"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your query or feedback here..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#005B4F] px-7 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#00473e] hover:shadow-lg"
              >
                <Send className="h-3.5 w-3.5" />
                Submit via Email
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}