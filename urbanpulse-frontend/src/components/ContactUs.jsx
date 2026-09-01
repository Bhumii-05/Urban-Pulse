import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, Clock } from "lucide-react";

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ loading: false, success: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false });
    // Simulate contact submission
    setTimeout(() => {
      setStatus({ loading: false, success: true });
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1200);
  };

  return (
    <section id="contact" className="relative bg-[#F4F8F6] py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-3.5 py-1 text-xs font-semibold text-[#005B4F] ring-1 ring-inset ring-emerald-600/20">
            Get In Touch
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Contact Support & Civic Helpdesk
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Have questions regarding municipal partnerships, route coverage, or technical issues? Reach out to our civic operations team.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-[#003D36] p-8 text-white shadow-xl">
              <h3 className="text-2xl font-bold">UrbanPulse Civic HQ</h3>
              <p className="mt-2 text-sm text-emerald-100/80">
                Direct helpline for municipal inquiries, citizen escalations, and technical support.
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#8FD35F]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Toll-Free Helpline</p>
                    <p className="text-sm font-semibold">1800-123-URBAN</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#8FD35F]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Email Support</p>
                    <p className="text-sm font-semibold">support@urbanpulse.gov.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#8FD35F]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Central Control Room</p>
                    <p className="text-sm font-semibold">Municipal Corporation Complex, Sector 4</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#8FD35F]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Operating Hours</p>
                    <p className="text-sm font-semibold">Mon – Sat: 06:00 AM – 09:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Send an Inquiry</h3>
            <p className="mt-1 text-sm text-slate-500">
              Fill in the form below and our team will respond within 24 business hours.
            </p>

            {status.success && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <span>Your message has been sent successfully. We will be in touch shortly!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Sneha Kesharwani"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Ward Bin Deployment Query"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide additional details regarding your inquiry..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              <button
                type="submit"
                disabled={status.loading}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#005B4F] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#00473e] hover:shadow-lg disabled:opacity-60"
              >
                {status.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {status.loading ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}