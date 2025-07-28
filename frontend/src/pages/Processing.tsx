import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Processing = () => {
    const { interviewId } = useParams<{ interviewId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!user || !interviewId) {
            navigate("/dashboard"); // 필수 정보 없으면 대시보드로
            return;
        }

        socketRef.current = io(`${BASE_URL}`);

        socketRef.current.on('connect', () => {
            console.log("Socket.IO connected for processing page");
            socketRef.current?.emit('join', { userId: user.id });
        });

        socketRef.current.on('evaluation-complete', (data: { interviewId: number }) => {
            if (data.interviewId.toString() === interviewId) {
                console.log("✅ 평가 완료! 결과 페이지로 이동합니다.");
                navigate(`/results/${interviewId}`);
            }
        });

        // 안전장치: 5분 후에도 아무 소식이 없으면 대시보드로 이동
        const timeout = setTimeout(() => {
            console.error("평가 시간 초과. 대시보드로 이동합니다.");
            navigate("/dashboard");
        }, 300000); // 5분

        return () => {
            clearTimeout(timeout);
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };

    }, [interviewId, user, navigate]);

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center bg-slate-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-6"></div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">AI가 결과를 분석하고 있습니다.</h2>
            <p className="text-slate-600 text-lg">이 과정은 최대 몇 분이 소요될 수 있습니다. 페이지를 닫지 마세요.</p>
        </div>
    );
};

export default Processing; 