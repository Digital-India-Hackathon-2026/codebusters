import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-200">
      {/* Dynamic background blur objects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] -z-10" />
      
      <Navbar />
      <main className="flex-grow pt-16 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
}

export default Layout;