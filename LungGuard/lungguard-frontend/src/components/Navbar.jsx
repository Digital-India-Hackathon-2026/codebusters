import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Activity, LayoutDashboard, Calculator, LineChart, FileImage, MessageSquare, LogOut, User, LogIn, UserPlus, Menu, X, Target } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Read auth token and user object
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200
    ${isActive(path) 
      ? "bg-sky-500/10 text-sky-400 border-b border-sky-400/30" 
      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
    }
  `;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60 shadow-lg shadow-slate-950/20" 
        : "bg-transparent border-b border-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Brand logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Activity className="h-6 w-6 text-sky-400 animate-pulse" />
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
            LungGuard AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {token ? (
            <>
              <Link to="/dashboard" className={linkClass("/dashboard")}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/risk" className={linkClass("/risk")}>
                <Calculator size={16} /> Risk
              </Link>
              <Link to="/simulation" className={linkClass("/simulation")}>
                <LineChart size={16} /> Simulation
              </Link>
              <Link to="/xray" className={linkClass("/xray")}>
                <FileImage size={16} /> X-ray
              </Link>
              <Link to="/chat" className={linkClass("/chat")}>
                <MessageSquare size={16} /> Copilot
              </Link>
            </>
          ) : (
            <Link to="/" className={linkClass("/")}>Home</Link>
          )}
        </div>

        {/* User Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-350 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <User size={14} className="text-sky-400" />
                <span className="font-medium max-w-[120px] truncate">{user?.fullName || "User"}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-red-950/20 hover:text-red-400 border border-slate-800 hover:border-red-500/20 text-slate-350 font-semibold text-sm rounded-lg transition-all duration-200 cursor-pointer"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-slate-300 hover:text-white font-medium text-sm transition-all"
              >
                <LogIn size={14} /> Login
              </Link>
              <Link 
                to="/register" 
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-400 hover:opacity-95 text-slate-950 font-bold text-sm rounded-lg shadow-lg shadow-sky-500/10 transition-all"
              >
                <UserPlus size={14} /> Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <div className="md:hidden flex items-center gap-3">
          {token && (
            <div className="flex items-center gap-1.5 text-sm text-slate-400 bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800">
              <User size={12} className="text-sky-400" />
              <span className="font-medium max-w-[80px] truncate">{user?.fullName?.split(" ")[0]}</span>
            </div>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900/60 border border-slate-850 rounded-lg cursor-pointer"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-lg border-b border-slate-900 py-4 px-6 absolute top-16 left-0 right-0 shadow-xl flex flex-col gap-3">
          {token ? (
            <>
              <Link 
                to="/dashboard" 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-2 rounded-lg text-sm ${isActive("/dashboard") ? "bg-slate-900 text-sky-400" : "text-slate-405"}`}
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link 
                to="/risk" 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-2 rounded-lg text-sm ${isActive("/risk") ? "bg-slate-900 text-sky-400" : "text-slate-405"}`}
              >
                <Calculator size={16} /> Risk Assessment
              </Link>
              <Link 
                to="/simulation" 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-2 rounded-lg text-sm ${isActive("/simulation") ? "bg-slate-900 text-sky-400" : "text-slate-405"}`}
              >
                <LineChart size={16} /> Health Simulator
              </Link>
              <Link 
                to="/xray" 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-2 rounded-lg text-sm ${isActive("/xray") ? "bg-slate-900 text-sky-400" : "text-slate-405"}`}
              >
                <FileImage size={16} /> X-ray Analyzer
              </Link>
              <Link 
                to="/chat" 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-2 rounded-lg text-sm ${isActive("/chat") ? "bg-slate-900 text-sky-400" : "text-slate-405"}`}
              >
                <MessageSquare size={16} /> AI Health Copilot
              </Link>
              <Link 
                to="/tracker" 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-2 rounded-lg text-sm ${isActive("/tracker") ? "bg-slate-900 text-sky-400" : "text-slate-405"}`}
              >
                <Target size={16} /> Recovery Tracker
              </Link>
              <div className="h-px bg-slate-900 my-2" />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 p-2 text-red-400 rounded-lg text-sm hover:bg-red-950/20 w-full text-left cursor-pointer"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-2 text-slate-400 text-sm hover:text-slate-200"
              >
                Home
              </Link>
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-2 text-slate-400 text-sm hover:text-slate-200"
              >
                <LogIn size={16} /> Login
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-bold text-sm rounded-lg"
              >
                <UserPlus size={16} /> Register / Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;