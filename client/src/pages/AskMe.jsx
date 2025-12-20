import ContactForm from "../components/ContactForm";

export default function Contact() {
  return (
    <main className="min-h-screen bg-[#F5F5F5] px-4 py-10 md:py-16 flex justify-center">
      <section className="w-full max-w-5xl">
        
        {/* Header */}
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-black">
            Contact Us
          </h1>
          <p className="mt-3 text-sm md:text-base text-black/70 max-w-xl">
            Have a question, suggestion, or something important to share?
            We’d love to hear from you.
          </p>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Left info panel */}
          <div className="block bg-white rounded-xl p-6 shadow-sm border border-black/5">
            <h2 className="text-xl font-semibold text-black mb-4">
              Why reach out?
            </h2>

            <ul className="space-y-3 text-sm text-black/70">
              <li>• Community suggestions & feedback</li>
              <li>• Article or content-related queries</li>
              <li>• Volunteering opportunities</li>
              <li>• Reporting issues or improvements</li>
            </ul>

            <div className="mt-6 text-sm text-black/60">
              We usually respond within <span className="font-medium text-black">24–48 hours</span>.
            </div>
          </div>

          {/* Form */}
          <ContactForm />
        </div>

      </section>
    </main>
  );
}
