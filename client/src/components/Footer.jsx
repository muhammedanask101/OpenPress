const Footer = () => {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="w-full px-4 md:px-8 py-6 md:py-8 space-y-6">

        {/* Top section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          
          {/* Identity */}
          <div>
            <p className="text-lg font-semibold tracking-wide text-white">
              Kerala Muslims
            </p>
            <p className="mt-1 text-sm text-white/70 max-w-md">
              A non-profit community platform
            </p>
          </div>

          {/* Simple links */}
          <div className="flex gap-6 text-sm font-medium text-white/80">
            <a href="/articles" className="hover:text-white transition">
              Articles
            </a>
            <a href="/contact" className="hover:text-white transition">
              Contact
            </a>
            <a
              href="https://discord.gg/GnBeB7bhvc"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Community
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-white/60">
          <p>
            © {new Date().getFullYear()} Kerala Muslims. All rights reserved.
          </p>
          <p className="italic">
            Built with care • Serving the Ummah
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
