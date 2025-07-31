// import { useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom"; // ✅ navigate 추가
// import { Button } from "@/components/ui/button";
// import { Brain, Menu, X, User, Settings, BarChart3, LogOut } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import { useTheme } from "@/contexts/ThemeContext";

// const Navbar = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate(); // ✅ navigate 사용
//   const { user, logout } = useAuth();
//   const { actualTheme } = useTheme();

//   const isActive = (path: string) => location.pathname === path;

//   const navItems = [
//     { path: "/dashboard", label: "대시보드", icon: BarChart3 },
//     { path: "/interview", label: "면접 시작", icon: Brain },
//     { path: "/improvement", label: "학습 로드맵", icon: User },
//     { path: "/settings", label: "설정", icon: Settings },
//   ];

//   const handleLogout = async () => {
//     await logout();          // 로그아웃 처리
//     setIsOpen(false);        // 모바일 메뉴 닫기
//     navigate("/");           // ✅ index 페이지로 이동
//   };

//   return (
//     <nav className={`bg-navbar-background backdrop-blur-sm border-b border-navbar-border sticky top-0 z-50`}>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex items-center">
//             <Link to="/" className="flex items-center space-x-2">
//               <Brain className="h-8 w-8 text-primary" />
//               <span className="text-xl font-bold text-foreground">AI Interview</span>
//             </Link>
//           </div>

//           <div className="hidden md:flex items-center space-x-4">
//             {user && navItems.map((item) => {
//               const Icon = item.icon;
//               return (
//                 <Link
//                   key={item.path}
//                   to={item.path}
//                   className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                     isActive(item.path)
//                       ? "bg-blue-100 text-primary"
//                       : "text-foreground hover:text-foreground hover:bg-slate-100"
//                   }`}
//                 >
//                   <Icon className="h-4 w-4" />
//                   <span>{item.label}</span>
//                 </Link>
//               );
//             })}

//             {user ? (
//               <div className="flex items-center space-x-2">
//                 <span className="text-sm text-foreground">안녕하세요, {user.name}      </span>
//                 <Button size="sm" variant="outline" onClick={handleLogout}>
//                   <LogOut className="h-4 w-4 mr-1" />
//                   로그아웃
//                 </Button>
//               </div>
//             ) : (
//               <Link to="/login">
//                 <Button size="sm" className="bg-primary hover:bg-primary/90">
//                   로그인
//                 </Button>
//               </Link>
//             )}
//           </div>

//           <div className="md:hidden flex items-center">
//             <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
//               {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//             </Button>
//           </div>
//         </div>

//         {isOpen && (
//           <div className="md:hidden">
//             <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//               {user && navItems.map((item) => {
//                 const Icon = item.icon;
//                 return (
//                   <Link
//                     key={item.path}
//                     to={item.path}
//                     className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
//                       isActive(item.path)
//                         ? "bg-blue-100 text-primary"
//                         : "text-foreground hover:text-foreground hover:bg-slate-100"
//                     }`}
//                     onClick={() => setIsOpen(false)}
//                   >
//                     <Icon className="h-5 w-5" />
//                     <span>{item.label}</span>
//                   </Link>
//                 );
//               })}

//               {user ? (
//                 <div className="px-3 py-2 space-y-2">
//                   <p className="text-sm text-foreground">안녕하세요, {user.name}      </p>
//                   <Button size="sm" variant="outline" onClick={handleLogout} className="w-full">
//                     <LogOut className="h-4 w-4 mr-1" />
//                     로그아웃
//                   </Button>
//                 </div>
//               ) : (
//                 <Link to="/login" onClick={() => setIsOpen(false)}>
//                   <Button size="sm" className="bg-primary hover:bg-primary/90 w-full mx-3">
//                     로그인
//                   </Button>
//                 </Link>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // ✅ navigate 추가
import { Button } from "@/components/ui/button";
import { Brain, Menu, X, User, Settings, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // ✅ navigate 사용
  const { user, logout } = useAuth();
  const { actualTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", label: "대시보드", icon: BarChart3 },
    { path: "/interview", label: "면접 시작", icon: Brain },
    { path: "/improvement", label: "학습 로드맵", icon: User },
    { path: "/settings", label: "설정", icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();          // 로그아웃 처리
    setIsOpen(false);        // 모바일 메뉴 닫기
    navigate("/");           // ✅ index 페이지로 이동
  };

  return (
    <nav className={`bg-navbar-background backdrop-blur-sm border-b border-navbar-border sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/kong.png" className="h-12 w-12 object-contain" />
              {/* <Brain className="h-8 w-8 text-primary" /> */}
              <span className="text-xl font-bold text-foreground">AI Interview</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user && navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-100 text-primary"
                      : "text-foreground hover:text-foreground hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-foreground">안녕하세요, {user.name}      </span>
                <Button size="sm" variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  로그아웃
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  로그인
                </Button>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user && navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive(item.path)
                        ? "bg-blue-100 text-primary"
                        : "text-foreground hover:text-foreground hover:bg-slate-100"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {user ? (
                <div className="px-3 py-2 space-y-2">
                  <p className="text-sm text-foreground">안녕하세요, {user.name}      </p>
                  <Button size="sm" variant="outline" onClick={handleLogout} className="w-full">
                    <LogOut className="h-4 w-4 mr-1" />
                    로그아웃
                  </Button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 w-full mx-3">
                    로그인
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
