import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Camera, 
  Mic, 
  Bell, 
  Shield, 
  Trash2,
  Save,
  Settings as SettingsIcon,
  Monitor,
  Volume2,
  Globe,
  Upload,
  X,
  FileText,
  Building2,
  Info
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { toast as sonnerToast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    position: "",
    experience: "",
    targetCompany: "",
    targetSalary: ""
  });

  const [companies, setCompanies] = useState<{ company_id: number; company_name: string; talent_url: string | null }[]>([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const response = await axios.get(`/api/auth/profile/${user.id}`);
          setProfile(prevProfile => ({ ...prevProfile, ...response.data }));
        } catch (error) {
          console.error("사용자 프로필 로딩 실패:", error);
          toast({
            title: "프로필 로딩 실패",
            description: "사용자 정보를 가져오는 데 문제가 발생했습니다.",
            variant: "destructive",
          });
        }
      }
    };

    const fetchCompanies = async () => {
      try {
        const response = await axios.get("/api/companies");
        setCompanies(response.data.companies);
      } catch (error) {
        console.error("회사 목록 로딩 실패:", error);
        toast({
          title: "회사 목록 로딩 실패",
          description: "서버에서 회사 목록을 가져오는 데 문제가 발생했습니다.",
          variant: "destructive",
        });
      }
    };
    fetchUserProfile();
    fetchCompanies();
  }, [toast, user]);

  const handleTargetCompanyChange = (value: string) => {
    const selectedCompany = companies.find(c => c.company_name === value);
    
    setProfile({ ...profile, targetCompany: value });
    
    if (selectedCompany) {
      setCompanyInfo({
        ...companyInfo,
        desiredCompany: selectedCompany.company_name,
        talentRequirementsUrl: selectedCompany.talent_url || "",
      });
    }
  };

  const [companyInfo, setCompanyInfo] = useState({
    desiredCompany: "",
    talentRequirementsUrl: "",
    coverLetterFile: null as File | null
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    language: "ko"
  });

  const [deviceSettings, setDeviceSettings] = useState({
    camera: "HD Webcam",
    microphone: "Built-in Microphone",
    speaker: "External Speakers",
    volume: 50
  });

  const handleProfileUpdate = async () => {
    if (!user) {
      toast({
        title: "오류",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.put("/api/auth/profile", {
        userId: user.id,
        ...profile,
      });

      if (response.status === 200) {
        toast({
          title: "프로필이 업데이트되었습니다",
          description: "변경사항이 성공적으로 저장되었습니다."
        });
      }
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
      toast({
        title: "프로필 업데이트 실패",
        description: "서버와 통신 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCompanyInfoSave = async () => {
    if (!companyInfo.desiredCompany.trim()) {
      toast({
        title: "기업명을 입력해주세요",
        description: "원하는 기업의 이름을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    if (!companyInfo.talentRequirementsUrl.trim()) {
        toast({
            title: "기업 인재상 URL을 입력해주세요",
            description: "기업 인재상 URL을 입력해주세요.",
            variant: "destructive",
        });
        return;
    }
    if (!companyInfo.coverLetterFile) {
        toast({
            title: "자기소개서 파일을 업로드해주세요",
            description: "PDF 형식의 자기소개서 파일을 업로드해주세요.",
            variant: "destructive",
        });
        return;
    }

    const formData = new FormData();
    formData.append("url", companyInfo.talentRequirementsUrl);
    formData.append("resume", companyInfo.coverLetterFile);
    formData.append("company_name", companyInfo.desiredCompany); // 추가
    if(user) {
      formData.append("user_id", user.id.toString());
    }

    setIsGenerating(true);
    try {
        const response = await axios.post("/api/interview/generate-questions", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        console.log("생성된 질문:", response.data.questions);

        toast({
            title: "질문 생성이 완료되었습니다",
            description: "생성된 면접 질문을 확인해보세요.",
        });

        window.location.reload();

    } catch (error) {
        console.error("질문 생성 실패:", error);
        toast({
            title: "질문 생성에 실패했습니다",
            description: "서버와 통신 중 오류가 발생했습니다.",
            variant: "destructive",
        });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "파일 형식 오류",
          description: "PDF 파일만 업로드 가능합니다.",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB 제한
        toast({
          title: "파일 크기 초과",
          description: "파일 크기는 10MB 이하여야 합니다.",
          variant: "destructive"
        });
        return;
      }

      setCompanyInfo({...companyInfo, coverLetterFile: file});
      toast({
        title: "파일 업로드 완료",
        description: `${file.name} 파일이 업로드되었습니다.`
      });
    }
  };

  const handleFileRemove = () => {
    setCompanyInfo({...companyInfo, coverLetterFile: null});
    toast({
      title: "파일 삭제",
      description: "업로드된 파일이 삭제되었습니다."
    });
  };

  const handleDeviceTest = (deviceType: string) => {
    toast({
      title: `${deviceType} 테스트`,
      description: `${deviceType}가 성공적으로 작동합니다.`,
    });
  };

  const handleDataExport = () => {
    toast({
      title: "데이터 내보내기",
      description: "모든 사용자 데이터가 내보내졌습니다.",
    });
  };

  const handleAccountDelete = () => {
    toast({
      title: "계정 삭제",
      description: "계정이 성공적으로 삭제되었습니다.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <Alert className="mb-8 border-blue-200 bg-blue-50 text-blue-800">
        <Info className="h-4 w-4" />
        <AlertTitle>질문 생성 안내</AlertTitle>
        <AlertDescription>
          프로필 저장과 기업 정보 저장 및 자기소개서를 입력하고 기업정보 저장을 완료하면 자동으로 질문이 생성됩니다.
        </AlertDescription>
      </Alert>
      {isGenerating && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
          <p className="text-lg font-semibold text-slate-900">면접 질문 생성중...</p>
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">설정</h1>
        <p className="text-slate-600">프로필과 면접 환경을 관리하세요</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            프로필
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            장치 설정
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            환경 설정
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            개인정보
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">희망 직무</Label>
                  <Select value={profile.position} onValueChange={(value) => setProfile({...profile, position: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="프론트엔드 개발자">프론트엔드 개발자</SelectItem>
                      <SelectItem value="백엔드 개발자">백엔드 개발자</SelectItem>
                      <SelectItem value="풀스택 개발자">풀스택 개발자</SelectItem>
                      <SelectItem value="데이터 분석가">데이터 분석가</SelectItem>
                      <SelectItem value="DevOps 엔지니어">DevOps 엔지니어</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experience">경력</Label>
                  <Select value={profile.experience} onValueChange={(value) => setProfile({...profile, experience: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="신입">신입</SelectItem>
                      <SelectItem value="1-3년">1-3년</SelectItem>
                      <SelectItem value="3-5년">3-5년</SelectItem>
                      <SelectItem value="5-10년">5-10년</SelectItem>
                      <SelectItem value="10년 이상">10년 이상</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetCompany">목표 회사</Label>
                  <Select
                    value={profile.targetCompany || ""}
                    onValueChange={handleTargetCompanyChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="회사를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies
                        .filter((company) => company.company_name)
                        .map((company) => (
                          <SelectItem key={company.company_id} value={company.company_name}>
                            {company.company_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetSalary">희망 연봉</Label>
                  <Select value={profile.targetSalary} onValueChange={(value) => setProfile({...profile, targetSalary: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3000만원 이하">3000만원 이하</SelectItem>
                      <SelectItem value="3000-4000만원">3000-4000만원</SelectItem>
                      <SelectItem value="4000-5000만원">4000-5000만원</SelectItem>
                      <SelectItem value="5000-7000만원">5000-7000만원</SelectItem>
                      <SelectItem value="7000만원 이상">7000만원 이상</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleProfileUpdate} className="w-full md:w-auto">
                <Save className="mr-2 h-4 w-4" />
                프로필 저장
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                기업 정보 및 자기소개서
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="desiredCompany">원하는 기업명</Label>
                <Input
                  id="desiredCompany"
                  placeholder="예: 삼성전자, 네이버, 카카오 등"
                  value={companyInfo.desiredCompany}
                  onChange={(e) => setCompanyInfo({...companyInfo, desiredCompany: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="talentRequirementsUrl">기업 인재상 URL</Label>
                <Input
                  id="talentRequirementsUrl"
                  placeholder="[ 원하는 기업의 이름 ] + 인재상으로 검색해서 기업의 인재상 URL을 입력해주세요"
                  value={companyInfo.talentRequirementsUrl}
                  onChange={(e) => setCompanyInfo({...companyInfo, talentRequirementsUrl: e.target.value})}
                />
                <p className="text-sm text-slate-600 mt-1">
                  예: https://www.samsung.com/sec/aboutsamsung/careers/core-values/
                </p>
              </div>

              <div>
                <Label htmlFor="coverLetter">자기소개서 (PDF)</Label>
                <div className="mt-2">
                  {companyInfo.coverLetterFile ? (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-slate-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {companyInfo.coverLetterFile.name}
                          </p>
                          <p className="text-xs text-slate-600">
                            {(companyInfo.coverLetterFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFileRemove}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-slate-600" />
                          <p className="mb-2 text-sm text-slate-600">
                            <span className="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭
                          </p>
                          <p className="text-xs text-slate-500">PDF 파일 (최대 10MB)</p>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".pdf"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={handleCompanyInfoSave} className="w-full md:w-auto" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    <span>생성 중...</span>
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    <span>기업 정보 저장</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Device Settings */}
        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="mr-2 h-5 w-5" />
                장치 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="camera">카메라</Label>
                <Select value={deviceSettings.camera} onValueChange={(value) => setDeviceSettings({...deviceSettings, camera: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HD Webcam">HD Webcam</SelectItem>
                    <SelectItem value="Integrated Camera">Integrated Camera</SelectItem>
                    <SelectItem value="Virtual Camera">Virtual Camera</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => handleDeviceTest("카메라")} variant="outline" size="sm" className="mt-2">
                  카메라 테스트
                </Button>
              </div>

              <div>
                <Label htmlFor="microphone">마이크</Label>
                <Select value={deviceSettings.microphone} onValueChange={(value) => setDeviceSettings({...deviceSettings, microphone: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Built-in Microphone">Built-in Microphone</SelectItem>
                    <SelectItem value="External Microphone">External Microphone</SelectItem>
                    <SelectItem value="USB Microphone">USB Microphone</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => handleDeviceTest("마이크")} variant="outline" size="sm" className="mt-2">
                  마이크 테스트
                </Button>
              </div>

              <div>
                <Label htmlFor="speaker">스피커</Label>
                <Select value={deviceSettings.speaker} onValueChange={(value) => setDeviceSettings({...deviceSettings, speaker: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="External Speakers">External Speakers</SelectItem>
                    <SelectItem value="Built-in Speakers">Built-in Speakers</SelectItem>
                    <SelectItem value="Headphones">Headphones</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => handleDeviceTest("스피커")} variant="outline" size="sm" className="mt-2">
                  스피커 테스트
                </Button>
              </div>

              <div>
                <Label htmlFor="volume">볼륨</Label>
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4" />
                  <Input
                    id="volume"
                    type="range"
                    min="0"
                    max="100"
                    value={deviceSettings.volume}
                    onChange={(e) => setDeviceSettings({...deviceSettings, volume: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="mr-2 h-5 w-5" />
                환경 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">이메일 알림</Label>
                <Switch
                  id="email-notifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => setPreferences({...preferences, emailNotifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">푸시 알림</Label>
                <Switch
                  id="push-notifications"
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => setPreferences({...preferences, pushNotifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">다크 모드</Label>
                <Switch
                  id="dark-mode"
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => setPreferences({...preferences, darkMode: checked})}
                />
              </div>

              <div>
                <Label htmlFor="language">언어</Label>
                <Select value={preferences.language} onValueChange={(value) => setPreferences({...preferences, language: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="en">영어</SelectItem>
                    <SelectItem value="ja">일본어</SelectItem>
                    <SelectItem value="zh">중국어</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                개인정보 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="data-export">데이터 내보내기</Label>
                <Button onClick={handleDataExport} variant="outline" size="sm">
                  내보내기
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="account-delete" className="text-red-600">계정 삭제</Label>
                <Button onClick={handleAccountDelete} variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
