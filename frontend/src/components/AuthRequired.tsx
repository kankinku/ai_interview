
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LogIn, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AuthRequiredProps {
  children: React.ReactNode;
}

const AuthRequired = ({ children }: AuthRequiredProps) => {
  const navigate = useNavigate();
  
  // 임시로 로그인 상태를 false로 설정 (실제로는 auth context에서 가져와야 함)
  const isAuthenticated = false;

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "로그인이 필요합니다",
        description: "이 기능을 사용하려면 먼저 로그인해주세요.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">로그인이 필요합니다</h3>
                  <p className="text-sm">
                    AI 면접 서비스를 이용하려면 먼저 로그인해주세요. 
                    아직 계정이 없으시다면 회원가입을 진행해주세요.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={() => navigate("/login")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    로그인
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/signup")}
                    className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    회원가입
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthRequired;
