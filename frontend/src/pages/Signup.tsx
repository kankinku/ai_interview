import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Brain, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
    const navigate = useNavigate();
    const { signUp, user } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        user_identifier: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
        agreePrivacy: false,
    });

    if (user) {
        navigate("/dashboard");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (formData.password.length < 6) {
            alert("비밀번호는 최소 6자 이상이어야 합니다.");
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await signUp(
                formData.user_identifier,
                formData.password,
                formData.name
            );

            if (!error) {
                navigate("/login");
            } else {
                alert("회원가입 실패: " + error);
            }
        } catch (error) {
            console.error("회원가입 중 오류:", error);
            alert("회원가입 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                        <Brain className="h-10 w-10 text-blue-600" />
                        <span className="text-2xl font-bold text-slate-900">
                            AI Interview
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">회원가입</h1>
                    <p className="text-slate-600">새 계정을 만들어 AI 면접을 시작하세요</p>
                </div>

                <Card className="shadow-lg border-0">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl text-center">회원가입</CardTitle>
                        <CardDescription className="text-center">
                            필요한 정보를 입력하여 계정을 만들어보세요
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">이름</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="이름을 입력하세요"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user_identifier">이메일(ID)</Label>
                                <Input
                                    id="user_identifier"
                                    type="email"
                                    value={formData.user_identifier}
                                    onChange={(e) =>
                                        handleInputChange("user_identifier", e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">비밀번호</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) =>
                                            handleInputChange("password", e.target.value)
                                        }
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-slate-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-slate-400" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500">최소 6자 이상</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) =>
                                            handleInputChange("confirmPassword", e.target.value)
                                        }
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-slate-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-slate-400" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="agreeTerms"
                                        type="checkbox"
                                        className="rounded border-slate-300"
                                        checked={formData.agreeTerms}
                                        onChange={(e) =>
                                            handleInputChange("agreeTerms", e.target.checked)
                                        }
                                        required
                                    />
                                    <Label htmlFor="agreeTerms" className="text-sm text-slate-600">
                                        <Link to="/terms" className="text-blue-600 hover:text-blue-700">
                                            이용약관
                                        </Link>
                                        에 동의합니다 *
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        id="agreePrivacy"
                                        type="checkbox"
                                        className="rounded border-slate-300"
                                        checked={formData.agreePrivacy}
                                        onChange={(e) =>
                                            handleInputChange("agreePrivacy", e.target.checked)
                                        }
                                        required
                                    />
                                    <Label htmlFor="agreePrivacy" className="text-sm text-slate-600">
                                        <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
                                            개인정보처리방침
                                        </Link>
                                        에 동의합니다 *
                                    </Label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={
                                    !formData.agreeTerms ||
                                    !formData.agreePrivacy ||
                                    isLoading
                                }
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {isLoading ? "계정 생성 중..." : "계정 만들기"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-slate-600">이미 계정이 있으신가요? </span>
                            <Link
                                to="/login"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                로그인
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Signup;