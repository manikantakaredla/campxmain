import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { GraduationCap, Users, Award } from "lucide-react";
import LoginForm from "../../components/auth/LoginForm";
import StudentRegisterForm from "../../components/auth/StudentRegisterForm";
import FacultyRegisterForm from "../../components/auth/FacultyRegisterForm";
import VerifyOTPForm from "../../components/auth/VerifyOTPForm";
import toast from "react-hot-toast";

function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Make sure this is here
  
  const [showRegister, setShowRegister] = useState(false);
  const [registerType, setRegisterType] = useState("student");
  const [email, setEmail] = useState("");
  const [registrationData, setRegistrationData] = useState(null);
  const [showVerifyOTP, setShowVerifyOTP] = useState(false);

  return (
    <div 
      className="min-h-screen flex relative overflow-hidden bg-gray-900"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-blue-900/80 to-black/90"></div>
        
        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Left Section - Hero Info */}
      <div className="hidden lg:flex lg:w-[55%] relative z-10 flex-col justify-center px-16 xl:px-24 text-white">
        <div className="max-w-xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm font-semibold tracking-wide text-blue-100">Welcome to Aditya University</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            Elevate Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Academic Journey
            </span>
          </h1>
          
          <p className="text-lg text-blue-100/80 mb-12 leading-relaxed font-light max-w-lg">
            Experience a seamless, interconnected campus ecosystem designed to empower students and faculty.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Feature Cards with Glassmorphism */}
            <div className="bg-white/10 border border-white/10 backdrop-blur-md p-5 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="text-blue-300" size={24} />
              </div>
              <h3 className="font-bold text-white mb-1">Smart Learning</h3>
              <p className="text-blue-100/60 text-sm">Access courses, assignments & grades instantly.</p>
            </div>

            <div className="bg-white/10 border border-white/10 backdrop-blur-md p-5 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="text-purple-300" size={24} />
              </div>
              <h3 className="font-bold text-white mb-1">Collaborative Space</h3>
              <p className="text-blue-100/60 text-sm">Connect seamlessly with peers & faculty.</p>
            </div>
            
            <div className="bg-white/10 border border-white/10 backdrop-blur-md p-5 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 group sm:col-span-2 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Award className="text-green-300" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Track Progress</h3>
                <p className="text-blue-100/60 text-sm">Monitor your academic journey with powerful analytics and insights.</p>
              </div>
            </div>
          </div>

          <div className="mt-16 flex items-center gap-4">
            <img 
              src="https://www.adityauniversity.in/public/frontend/assets/images/site-logo.svg" 
              alt="Aditya University" 
              className="w-32 h-auto brightness-0 invert opacity-50"
            />
            <div className="h-8 w-px bg-white/20"></div>
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase font-bold">
              Powered by CAMPX
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Section - Form Container */}
      <div className="w-full lg:w-[45%] relative z-10 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-white/5 backdrop-blur-sm lg:backdrop-blur-none lg:bg-transparent">
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
          
          {/* Header with logo for mobile */}
          <div className="text-center pt-8 pb-4 px-6 border-b border-gray-100">
            
            <h2 className="text-xl font-bold text-gray-800">
              {!showRegister && !showVerifyOTP ? 'Welcome Back' : showVerifyOTP ? 'Verify Email' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {!showRegister && !showVerifyOTP ? 'Sign in to your account' : showVerifyOTP ? 'Enter the OTP sent to your email' : 'Register to get started'}
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {!showRegister && !showVerifyOTP ? (
              <div>
                <LoginForm />
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setShowRegister(true)}
                      className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      Register now
                    </button>
                  </p>
                </div>
              </div>
            ) : showVerifyOTP ? (
              <VerifyOTPForm
                email={email}
                setActiveTab={() => {
                  setShowVerifyOTP(false);
                  setShowRegister(false);
                }}
              />
            ) : (
              <div>
                {/* Register Type Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setRegisterType("student")}
                    className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200 ${
                      registerType === "student"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterType("faculty")}
                    className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200 ${
                      registerType === "faculty"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Faculty
                  </button>
                </div>

                {registerType === "student" ? (
                  <StudentRegisterForm
                    setActiveTab={(tab) => {
                      if (tab === "verifyOtp") {
                        setShowVerifyOTP(true);
                        setShowRegister(false);
                      }
                    }}
                    setEmail={setEmail}
                    setRegistrationData={setRegistrationData}
                    registrationData={registrationData}
                  />
                ) : (
                  <FacultyRegisterForm
                    setActiveTab={(tab) => {
                      if (tab === "verifyOtp") {
                        setShowVerifyOTP(true);
                        setShowRegister(false);
                      }
                    }}
                    setEmail={setEmail}
                    setRegistrationData={setRegistrationData}
                    registrationData={registrationData}
                  />
                )}

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => setShowRegister(false)}
                      className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile footer */}
          <div className="lg:hidden text-center py-4 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase">
              Powered by CAMPX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;