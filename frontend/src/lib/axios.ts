import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000", // 백엔드 서버 주소
    withCredentials: true             // 쿠키 인증 필요 시 사용
});

export default instance;