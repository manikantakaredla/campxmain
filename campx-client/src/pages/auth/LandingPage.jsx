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
      className="min-h-screen flex relative overflow-hidden"
      style={{
        backgroundImage: "url('https://i.ytimg.com/vi/Rqjg-77AE9w/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAwlZ30H1IPK9D7JiBVdiFCV8a1Nw')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70"></div>
      
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-12 lg:px-16 xl:px-20 text-white">
        <div className="max-w-lg">
          <img 
            src="https://www.adityauniversity.in/public/frontend/assets/images/site-logo.svg" 
            alt="Aditya University" 
            className="w-36 h-auto mb-8 brightness-0 invert"
          />
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Academic Hub
          </h1>
          
          <p className="text-base lg:text-lg text-white/80 mb-10 leading-relaxed">
            Your centralized platform for academic resources, collaboration, and university management.
          </p>

          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-0.5">Smart Learning</h3>
                <p className="text-white/60 text-xs">Access courses, assignments & grades</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-0.5">Collaborative Space</h3>
                <p className="text-white/60 text-xs">Connect with peers & faculty</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Award size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-0.5">Track Progress</h3>
                <p className="text-white/60 text-xs">Monitor your academic journey</p>
              </div>
            </div>
          </div>

          <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mt-12">
            Powered by CAMPX
          </p>
        </div>
      </div>
      
      {/* Right Section - Form Container */}
     <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          
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