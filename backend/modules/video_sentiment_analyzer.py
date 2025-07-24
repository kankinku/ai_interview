import os
import tkinter as tk
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties
import datetime
from PIL import Image, ImageTk
import cv2
from deepface import DeepFace
import threading
import queue
import numpy as np

class VideoSentimentAnalyzer:
    def __init__(self):
        # AI 면접 시나리오에 맞춘 감정별 가감 점수
        self.emotion_scores = {
            'happy': 5,     # 긍정적 태도
            'surprise': 3,  # 흥미 및 관심 표현
            'neutral': 3,   # 안정감, 침착함 (약간 긍정)
            'sad': -3,      # 자신감 부족, 무기력함
            'angry': -4,    # 부적절한 감정 표출
            'disgust': -4,  # 부적절한 감정 표출
            'fear': -4      # 불안, 자신감 부족
        }
        # 감정 분포에서 점수 계산에 포함할 최소 비율
        self.emotion_ratio_threshold = 15.0  # 15%

    def analyze_frame_for_score_delta(self, frame):
        """프레임의 감정 분포를 분석하여 (점수 변동치, 원인 감정 dict)를 반환합니다."""
        try:
            results = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False, silent=True)
            
            if isinstance(results, list) and len(results) > 0:
                emotion_distribution = results[0]['emotion']
                frame_score_delta = 0
                contributors = {}
                
                for emotion, percentage in emotion_distribution.items():
                    if percentage >= self.emotion_ratio_threshold:
                        frame_score_delta += self.emotion_scores.get(emotion, 0)
                        contributors[emotion] = percentage
                
                return frame_score_delta, contributors
        except Exception as e:
            pass
        return 0, {}

    def plot_history(self, scores, times, log_data):
        """프로그램 종료 시, 클릭 가능한 인터랙티브 점수 변화 그래프를 보여줍니다."""
        if not scores:
            return
            
        history_df = pd.DataFrame({'time': times, 'score': scores})

        try:
            font = FontProperties(fname="c:/Windows/Fonts/malgun.ttf")
        except:
            font = FontProperties(fname="/System/Library/Fonts/AppleSDGothicNeo.ttc")

        fig, ax = plt.subplots(figsize=(14, 7))
        line, = ax.plot(history_df['time'], history_df['score'], marker='o', linestyle='-', picker=5)
        
        plt.title('시간에 따른 감성 점수 변화 (점을 클릭하여 상세 정보 확인)', fontproperties=font, fontsize=16)
        plt.xlabel('시간', fontproperties=font)
        plt.ylabel('감성 점수', fontproperties=font)
        plt.grid(True)
        plt.xticks(rotation=30, ha='right')
        plt.tight_layout(pad=3.0)

        annot = ax.annotate("", xy=(0,0), xytext=(20,20), textcoords="offset points",
                            bbox=dict(boxstyle="round", fc="yellow", alpha=0.8),
                            arrowprops=dict(arrowstyle="->"))
        annot.set_visible(False)

        def update_annot(ind):
            point_index = ind[0]
            pos = line.get_data()
            annot.xy = (pos[0][point_index], pos[1][point_index])
            
            contributors = log_data[point_index]
            text = f"시간: {times[point_index].strftime('%H:%M:%S')}\n점수: {scores[point_index]:.2f}"
            
            if contributors:
                text += "\n\n기여 감정 (5프레임 평균):"
                for emotion, percent in contributors.items():
                    text += f"\n- {emotion.capitalize()}: {percent:.1f}%"
            elif point_index > 0:
                text += "\n\n(유의미한 감정 감지되지 않음)"

            annot.set_text(text)

        def on_pick(event):
            if event.artist is line:
                vis = annot.get_visible()
                update_annot(event.ind)
                annot.set_visible(True)
                fig.canvas.draw_idle()

        fig.canvas.mpl_connect("pick_event", on_pick)
        plt.show()

class Application(tk.Frame):
    def __init__(self, master=None):
        super().__init__(master)
        self.master = master
        self.master.title("AI 면접 감성 분석기")
        self.master.geometry("800x650")
        self.pack(pady=10, padx=10)
        
        self.analyzer = VideoSentimentAnalyzer()
        self.cap = cv2.VideoCapture(0)
        self.running = True

        self.cumulative_score = 100
        self.score_history = [self.cumulative_score]
        self.score_times = [datetime.datetime.now()]
        self.log_data = [{}] # 각 점수 시점의 상세 데이터를 저장
        
        self.frame_queue = queue.Queue(maxsize=1)
        self.score_delta_queue = queue.Queue()

        self.create_widgets()
        
        self.analysis_thread = threading.Thread(target=self.analysis_worker, daemon=True)
        self.analysis_thread.start()

        self.update_frame()
        self.update_results()

    def create_widgets(self):
        self.video_label = tk.Label(self)
        self.video_label.pack(pady=10)

        self.score_label = tk.Label(self, text="현재 점수: 100.00", font=("Arial", 18, "bold"))
        self.score_label.pack(pady=15)
        
        self.quit_button = tk.Button(self, text="종료 및 분석 결과 보기", fg="white", bg="red", font=("Arial", 12), command=self.quit_app)
        self.quit_button.pack(pady=10)
    
    def analysis_worker(self):
        """백그라운드에서 실행될 감정 분석 작업. 5프레임의 평균 점수 변동을 계산합니다."""
        delta_buffer = []
        contributors_buffer = []
        FRAME_BATCH_SIZE = 5

        while self.running:
            try:
                frame = self.frame_queue.get(timeout=1)
                score_delta, contributors = self.analyzer.analyze_frame_for_score_delta(frame)
                
                delta_buffer.append(score_delta)
                if contributors:
                    contributors_buffer.append(contributors)

                if len(delta_buffer) >= FRAME_BATCH_SIZE:
                    avg_delta = np.mean(delta_buffer)
                    
                    final_contributors = {}
                    if contributors_buffer:
                        agg_emotions = {}
                        for contrib_dict in contributors_buffer:
                            for emotion, percent in contrib_dict.items():
                                if emotion not in agg_emotions:
                                    agg_emotions[emotion] = []
                                agg_emotions[emotion].append(percent)
                        
                        for emotion, p_list in agg_emotions.items():
                            final_contributors[emotion] = np.mean(p_list)

                    self.score_delta_queue.put({"delta": avg_delta, "contributors": final_contributors})
                    delta_buffer.clear()
                    contributors_buffer.clear()

            except queue.Empty:
                continue

    def update_frame(self):
        """주기적으로 웹캠 프레임을 읽어와 화면에 표시하고 큐에 넣습니다."""
        if not self.running:
            return

        ret, frame = self.cap.read()
        if ret:
            cv2image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(cv2image)
            imgtk = ImageTk.PhotoImage(image=img)
            self.video_label.imgtk = imgtk
            self.video_label.configure(image=imgtk)

            if self.frame_queue.empty():
                self.frame_queue.put(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        
        self.master.after(33, self.update_frame)
    
    def update_results(self):
        """주기적으로 점수 변동 큐를 확인하여 누적 점수를 업데이트합니다."""
        if not self.running:
            return
        
        try:
            data = self.score_delta_queue.get_nowait()
            score_delta = data["delta"]
            
            self.cumulative_score += score_delta
            
            if self.cumulative_score > 100: self.cumulative_score = 100
            if self.cumulative_score < 0: self.cumulative_score = 0
                
            self.score_history.append(self.cumulative_score)
            self.score_times.append(datetime.datetime.now())
            self.log_data.append(data["contributors"])
            
            self.score_label.config(text=f"현재 점수: {self.cumulative_score:.2f}")
            
        except queue.Empty:
            pass
        
        self.master.after(500, self.update_results)

    def generate_log_file(self):
        """세션 분석 결과를 로그 파일로 저장합니다."""
        with open("analysis_log.txt", "w", encoding="utf-8") as f:
            f.write("AI 면접 감성 분석 로그\n")
            f.write(f"분석 일시: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("="*40 + "\n\n")

            for i in range(1, len(self.score_history)):
                timestamp = self.score_times[i].strftime('%H:%M:%S')
                prev_score = self.score_history[i-1]
                curr_score = self.score_history[i]
                delta = curr_score - prev_score
                contributors = self.log_data[i]

                f.write(f"[{timestamp}] 점수: {prev_score:.2f} -> {curr_score:.2f} (변동: {delta:+.2f})\n")
                
                reason = "유의미한 감정 변화 감지되지 않음"
                if contributors:
                    reason_parts = [f"{e.capitalize()} ({p:.1f}%)" for e, p in contributors.items()]
                    reason = f"주요 감정(5프레임 평균): {', '.join(reason_parts)}"
                
                f.write(f"  └ 원인: {reason}\n\n")
            
            final_score = self.score_history[-1]
            f.write("="*40 + "\n")
            f.write(f"최종 점수: {final_score:.2f}\n")

    def quit_app(self):
        self.running = False
        self.analysis_thread.join(timeout=2)
        self.cap.release()
        
        # 로그 파일 생성 및 그래프 표시
        self.generate_log_file()
        self.analyzer.plot_history(self.score_history, self.score_times, self.log_data)
        
        self.master.destroy()

def main():
    root = tk.Tk()
    app = Application(master=root)
    root.protocol("WM_DELETE_WINDOW", app.quit_app)
    app.mainloop()

if __name__ == "__main__":
    main() 