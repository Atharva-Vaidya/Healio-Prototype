import healthcareIllustration from '../assets/healthcare-illustration.png';

export default function BrandPanel() {
  return (
    <div className="hidden lg:flex relative flex-col items-center justify-center bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 text-white overflow-hidden px-12 py-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large circle */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full animate-float" />
        {/* Medium circle */}
        <div className="absolute bottom-20 -right-10 w-56 h-56 bg-white/5 rounded-full animate-float-delayed" />
        {/* Small circle */}
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse-ring" />
        {/* Shimmer line */}
        <div className="absolute top-0 left-0 w-full h-full animate-shimmer" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center mb-10 bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-2xl shadow-2xl ring-1 ring-white/50 transform hover:scale-105 transition-transform">
          <img src="/healio-logo.svg" alt="Healio Logo" className="h-[38px] w-auto" />
        </div>

        {/* Illustration */}
        <div className="mb-8 w-72 h-72 flex items-center justify-center">
          <img
            src={healthcareIllustration}
            alt="Healthcare platform illustration"
            className="w-full h-full object-contain drop-shadow-2xl animate-float-delayed"
          />
        </div>

        {/* Tagline */}
        <h1 className="text-2xl font-semibold mb-3 leading-snug">
          Simplifying Healthcare,
          <br />
          <span className="text-teal-200">One Platform at a Time</span>
        </h1>
        <p className="text-teal-100/80 text-sm leading-relaxed max-w-sm">
          Connect employees, companies, clinics, and TPAs in a unified
          healthcare ecosystem. Manage insurance claims and health wallets
          seamlessly.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {[
            'Claims Management',
            'Health Wallets',
            'Employee Benefits',
            'Provider Network',
          ].map((feature) => (
            <span
              key={feature}
              className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-teal-50"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom attribution */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-teal-200/50 text-xs">
          © 2026 Healio Healthcare Platform
        </p>
      </div>
    </div>
  );
}
