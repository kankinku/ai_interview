
import { useState } from "react";
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
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: "김면접자",
    email: "interview@example.com",
    position: "프론트엔드 개발자",
    experience: "3-5년",
    targetCompany: "대기업",
    targetSalary: "5000-7000만원"
  });

  const [preferences, setPreferences] = useState({
    language: "ko",
    theme: "light",
    notifications: true,
    emailAlerts: false,
    weeklyReport: true,
    soundEnabled: true,
    autoRecord: true
  });

  const [deviceSettings, setDeviceSettings] = useState({
    camera: "기본 카메라",
    microphone: "기본 마이크",
    resolution: "1080p",
    framerate: "30fps"
  });

  const handleProfileUpdate = () => {
    toast({
      title: "프로필이 업데이트되었습니다",
      description: "변경사항이 성공적으로 저장되었습니다."
    });
  };

  const handleDeviceTest = (device: string) => {
    toast({
      title: `${device} 테스트`,
      description: `${device} 연결을 확인하고 있습니다...`
    });
  };

  const handleDataExport = () => {
    toast({
      title: "데이터 내보내기",
      description: "면접 기록을 내보내고 있습니다. 잠시만 기다려주세요."
    });
  };

  const handleAccountDelete = () => {
    toast({
      title: "계정 삭제 요청",
      description: "계정 삭제를 위해 확인 이메일을 발송했습니다.",
      variant: "destructive"
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <Label htmlFor="targetCompany">목표 회사 규모</Label>
                  <Select value={profile.targetCompany} onValueChange={(value) => setProfile({...profile, targetCompany: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="스타트업">스타트업</SelectItem>
                      <SelectItem value="중견기업">중견기업</SelectItem>
                      <SelectItem value="대기업">대기업</SelectItem>
                      <SelectItem value="외국계기업">외국계기업</SelectItem>
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
        </TabsContent>

        {/* Device Settings */}
        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="mr-2 h-5 w-5" />
                카메라 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>카메라 선택</Label>
                  <Select value={deviceSettings.camera} onValueChange={(value) => setDeviceSettings({...deviceSettings, camera: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="기본 카메라">기본 카메라</SelectItem>
                      <SelectItem value="외부 웹캠">외부 웹캠</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>해상도</Label>
                  <Select value={deviceSettings.resolution} onValueChange={(value) => setDeviceSettings({...deviceSettings, resolution: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p (HD)</SelectItem>
                      <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                      <SelectItem value="4K">4K (Ultra HD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleDeviceTest("카메라")}>
                  <Camera className="mr-2 h-4 w-4" />
                  카메라 테스트
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mic className="mr-2 h-5 w-5" />
                마이크 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>마이크 선택</Label>
                  <Select value={deviceSettings.microphone} onValueChange={(value) => setDeviceSettings({...deviceSettings, microphone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="기본 마이크">기본 마이크</SelectItem>
                      <SelectItem value="외부 마이크">외부 마이크</SelectItem>
                      <SelectItem value="헤드셋">헤드셋</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>음질</Label>
                  <Select defaultValue="high">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">표준 음질</SelectItem>
                      <SelectItem value="high">고음질</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleDeviceTest("마이크")}>
                  <Mic className="mr-2 h-4 w-4" />
                  마이크 테스트
                </Button>
                <Button variant="outline" onClick={() => handleDeviceTest("스피커")}>
                  <Volume2 className="mr-2 h-4 w-4" />
                  스피커 테스트
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                일반 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">언어</Label>
                  <p className="text-sm text-slate-600">인터페이스 언어를 선택하세요</p>
                </div>
                <Select value={preferences.language} onValueChange={(value) => setPreferences({...preferences, language: value})}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">테마</Label>
                  <p className="text-sm text-slate-600">화면 테마를 선택하세요</p>
                </div>
                <Select value={preferences.theme} onValueChange={(value) => setPreferences({...preferences, theme: value})}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">라이트</SelectItem>
                    <SelectItem value="dark">다크</SelectItem>
                    <SelectItem value="auto">시스템</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">사운드 효과</Label>
                  <p className="text-sm text-slate-600">면접 중 사운드 효과 재생</p>
                </div>
                <Switch
                  checked={preferences.soundEnabled}
                  onCheckedChange={(checked) => setPreferences({...preferences, soundEnabled: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">자동 녹화</Label>
                  <p className="text-sm text-slate-600">면접 시작 시 자동으로 녹화 시작</p>
                </div>
                <Switch
                  checked={preferences.autoRecord}
                  onCheckedChange={(checked) => setPreferences({...preferences, autoRecord: checked})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                알림 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">푸시 알림</Label>
                  <p className="text-sm text-slate-600">새로운 기능 및 업데이트 알림</p>
                </div>
                <Switch
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => setPreferences({...preferences, notifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">이메일 알림</Label>
                  <p className="text-sm text-slate-600">면접 결과 및 피드백 이메일 수신</p>
                </div>
                <Switch
                  checked={preferences.emailAlerts}
                  onCheckedChange={(checked) => setPreferences({...preferences, emailAlerts: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">주간 리포트</Label>
                  <p className="text-sm text-slate-600">주간 학습 진도 및 성과 요약</p>
                </div>
                <Switch
                  checked={preferences.weeklyReport}
                  onCheckedChange={(checked) => setPreferences({...preferences, weeklyReport: checked})}
                />
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
                데이터 관리
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">저장된 데이터</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">12</div>
                      <div className="text-sm text-slate-600">면접 기록</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">47</div>
                      <div className="text-sm text-slate-600">답변 영상</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">2.3GB</div>
                      <div className="text-sm text-slate-600">사용 용량</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">98</div>
                      <div className="text-sm text-slate-600">피드백 리포트</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleDataExport}>
                    데이터 내보내기
                  </Button>
                  <Button variant="outline">
                    개인정보 처리방침
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <Trash2 className="mr-2 h-5 w-5" />
                계정 관리
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-red-900 mb-2">계정 삭제</h3>
                <p className="text-sm text-red-700 mb-4">
                  계정을 삭제하면 모든 면접 기록, 분석 결과, 개인 데이터가 영구적으로 삭제됩니다. 
                  이 작업은 되돌릴 수 없습니다.
                </p>
                <Button variant="destructive" onClick={handleAccountDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  계정 삭제
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
