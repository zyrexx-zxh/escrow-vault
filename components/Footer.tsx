export default function Footer() {
  return (
    <footer className="relative px-6 pb-10 pt-24 text-center">
      <div className="mx-auto mb-8 h-px w-full max-w-md bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <p className="text-xs tracking-[0.18em] text-white/40">
        <a
          href="https://t.me/claxen"
          target="_blank"
          rel="noopener noreferrer"
          className="transition duration-300 hover:text-emerald-300 hover:[text-shadow:0_0_18px_rgba(16,242,165,0.6)]"
        >
          Designed By @claxen
        </a>
      </p>
    </footer>
  );
}
