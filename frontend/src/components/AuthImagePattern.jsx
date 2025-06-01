import { Leaf, TreePine, Cloud, Flower2, Droplets, Sun, Wind, Sprout } from 'lucide-react';

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 p-12 relative overflow-hidden">
      {/* Floating elements in background */}
      <div className="absolute top-10 left-10 text-green-300/30 dark:text-green-700/30">
        <TreePine size={80} />
      </div>
      <div className="absolute bottom-10 right-10 text-emerald-200/40 dark:text-emerald-700/40">
        <Leaf size={100} className="rotate-45" />
      </div>
      <div className="absolute top-1/4 right-1/3 text-teal-200/20 dark:text-teal-700/20">
        <Cloud size={50} />
      </div>
      
      <div className="max-w-md text-center relative z-10">
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            <Leaf className="w-full h-full text-green-500/80" />,
            <TreePine className="w-full h-full text-emerald-600/80" />,
            <Flower2 className="w-full h-full text-rose-400/80" />,
            <Droplets className="w-full h-full text-blue-400/80" />,
            <Sprout className="w-full h-full text-green-400/80" />,
            <Sun className="w-full h-full text-amber-400/80" />,
            <Wind className="w-full h-full text-teal-500/80" />,
            <Sprout className="w-full h-full text-lime-500/80" />,
            <Leaf className="w-full h-full text-emerald-500/80" />
          ].map((icon, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl flex items-center justify-center bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm shadow-sm border border-green-100 dark:border-green-700/30 p-3 
              ${i % 2 === 0 ? "hover:scale-105 transition-transform" : ""}
              ${i % 3 === 0 ? "animate-pulse" : ""}`}
            >
              {icon}
            </div>
          ))}
        </div>
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-green-100 dark:border-green-800/30 shadow-lg">
          <div className="inline-flex items-center gap-2 mb-2">
            <Leaf className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">EcoConnect</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{title}</h2>
          <p className="text-gray-600 dark:text-gray-300">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthImagePattern;
