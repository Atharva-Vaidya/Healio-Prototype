import BrandPanel from './BrandPanel';
import LoginCard from './LoginCard';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex font-sans">
      {/* Left — Brand Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%]">
        <BrandPanel />
      </div>

      {/* Right — Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center bg-white px-6 py-12 sm:px-12">
        <LoginCard />
      </div>
    </div>
  );
}
