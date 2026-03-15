/* ====================================================
   DreamLens - voice.js
   语音输入模块：Web Speech API + 可视化动画
==================================================== */

(function () {

    /* ---- 状态变量 ---- */
    let recognition = null;       // SpeechRecognition 实例
    let isRecording = false;      // 当前是否正在录音
    let finalTranscript = '';     // 已确认的文字
    let silenceTimer = null;      // 静默自动停止计时器
    let audioCtx = null;          // AudioContext（实时音量）
    let analyserNode = null;
    let mediaStream = null;
    let animFrameId = null;
    let currentMode = 'text';     // 'text' | 'voice'

    /* ---- DOM 快捷引用 ---- */
    const $ = id => document.getElementById(id);

    /* ---- 检测浏览器支持 ---- */
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition || null;

    /* ====================================================
       模式切换
    ==================================================== */
    function switchMode(mode) {
        currentMode = mode;

        const tabText  = $('tabText');
        const tabVoice = $('tabVoice');
        const textArea  = $('textInputArea');
        const voiceArea = $('voiceInputArea');

        if (mode === 'text') {
            tabText.classList.add('az-mode-tab--active');
            tabVoice.classList.remove('az-mode-tab--active');
            textArea.style.display  = 'block';
            voiceArea.style.display = 'none';
            // 如果正在录音，先停止
            if (isRecording) stopRecognition();
        } else {
            // 先检测支持
            if (!SpeechRecognition) {
                $('voiceUnsupportModal').style.display = 'flex';
                return;
            }
            tabVoice.classList.add('az-mode-tab--active');
            tabText.classList.remove('az-mode-tab--active');
            textArea.style.display  = 'none';
            voiceArea.style.display = 'block';
        }
    }

    /* ====================================================
       初始化 SpeechRecognition
    ==================================================== */
    function initRecognition() {
        if (!SpeechRecognition) return null;

        const r = new SpeechRecognition();
        r.lang = 'zh-CN';
        r.continuous = true;          // 持续识别
        r.interimResults = true;      // 返回中间结果
        r.maxAlternatives = 1;

        /* 收到识别结果 */
        r.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const text = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += text;
                    resetSilenceTimer();
                } else {
                    interim += text;
                }
            }
            renderTranscript(finalTranscript, interim);
        };

        /* 开始 */
        r.onstart = () => {
            isRecording = true;
            setRecordingUI(true);
            startAudioVisualize();
        };

        /* 结束（可能自动或手动） */
        r.onend = () => {
            // 如果 isRecording 还是 true，说明是被浏览器自动中断，需要续接
            if (isRecording) {
                try { r.start(); } catch(e) { /* 防止快速重启报错 */ }
            } else {
                setRecordingUI(false);
                stopAudioVisualize();
            }
        };

        r.onerror = (event) => {
            const ignorable = ['no-speech', 'aborted'];
            if (ignorable.includes(event.error)) return;
            console.warn('Speech error:', event.error);
            if (event.error === 'not-allowed') {
                showToast('❌ 麦克风权限被拒绝，请在浏览器设置中允许');
                stopRecognition();
            } else if (event.error === 'network') {
                showToast('⚠️ 网络错误，请检查连接后重试');
            }
        };

        return r;
    }

    /* ====================================================
       开始 / 停止 切换
    ==================================================== */
    function toggleVoice() {
        if (isRecording) {
            stopRecognition();
        } else {
            startRecognition();
        }
    }

    function startRecognition() {
        finalTranscript = $('voiceTranscript').textContent || '';
        recognition = initRecognition();
        if (!recognition) return;

        isRecording = true;
        $('inputCard') && $('inputCard').classList.add('voice-active');
        $('voiceTranscriptBox').classList.add('recording');
        $('voicePlaceholder').classList.add('hidden');

        try {
            recognition.start();
        } catch (e) {
            console.warn('Recognition start error:', e);
        }

        // 请求麦克风用于可视化音量
        requestMicVisualize();
    }

    function stopRecognition() {
        isRecording = false;
        clearTimeout(silenceTimer);
        if (recognition) {
            try { recognition.stop(); } catch(e) {}
            recognition = null;
        }
        setRecordingUI(false);
        stopAudioVisualize();
        $('voiceTranscriptBox').classList.remove('recording');

        // 有内容则展示操作按钮
        if (finalTranscript.trim()) {
            showActionBtns();
        }
    }

    /* ====================================================
       UI 状态切换
    ==================================================== */
    function setRecordingUI(recording) {
        const micBtn   = $('voiceMicBtn');
        const micIcon  = $('voiceMicIcon');
        const waveCont = $('voiceWaveContainer');
        const bars     = $('voiceBars');
        const status   = $('voiceStatusText');

        if (recording) {
            micBtn.classList.add('recording');
            micIcon.className = 'fas fa-stop';
            waveCont.classList.add('active');
            bars.classList.add('active');
            status.textContent = '正在聆听你的梦境...';
        } else {
            micBtn.classList.remove('recording');
            micIcon.className = 'fas fa-microphone';
            waveCont.classList.remove('active');
            bars.classList.remove('active');
            // 重置柱子高度
            document.querySelectorAll('.az-wbar').forEach(b => b.style.height = '4px');
            status.textContent = finalTranscript.trim()
                ? '录音已完成 — 请确认或继续录制'
                : '点击麦克风开始录音';
        }
    }

    /* 渲染转写文字 */
    function renderTranscript(final, interim) {
        const transcriptEl = $('voiceTranscript');
        const interimEl    = $('voiceInterim');
        const placeholder  = $('voicePlaceholder');
        const box          = $('voiceTranscriptBox');

        transcriptEl.textContent = final;
        interimEl.textContent    = interim;

        const hasContent = final.trim() || interim.trim();
        placeholder.classList.toggle('hidden', !!hasContent);
        box.classList.toggle('has-text', !!final.trim());

        // 自动滚动到底部
        box.scrollTop = box.scrollHeight;
    }

    /* 显示操作按钮 */
    function showActionBtns() {
        const btns = $('voiceActionBtns');
        if (btns) {
            btns.style.display = 'flex';
            btns.style.animation = 'fadeInUp 0.3s ease both';
        }
    }

    /* 静默自动停止（5秒无输入则停） */
    function resetSilenceTimer() {
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
            if (isRecording) {
                stopRecognition();
                showToast('🌙 检测到停顿，已自动停止录音');
            }
        }, 5000);
    }

    /* ====================================================
       Web Audio API 实时音量可视化
    ==================================================== */
    function requestMicVisualize() {
        if (!navigator.mediaDevices) return;
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => {
                mediaStream = stream;
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                analyserNode = audioCtx.createAnalyser();
                analyserNode.fftSize = 64;
                const source = audioCtx.createMediaStreamSource(stream);
                source.connect(analyserNode);
                animateVolumeBars();
            })
            .catch(() => {
                // 无法获取麦克风时仍能用 CSS 动画代替
            });
    }

    function animateVolumeBars() {
        if (!analyserNode) return;
        const bars = document.querySelectorAll('.az-wbar');
        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

        function draw() {
            animFrameId = requestAnimationFrame(draw);
            if (!isRecording) return;
            analyserNode.getByteFrequencyData(dataArray);

            bars.forEach((bar, i) => {
                const idx = Math.floor(i * dataArray.length / bars.length);
                const value = dataArray[idx] || 0;
                const height = Math.max(4, (value / 255) * 32);
                bar.style.height = height + 'px';
                bar.style.animation = 'none'; // 用真实数据代替 CSS 动画
            });
        }
        draw();
    }

    function stopAudioVisualize() {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
        if (mediaStream) {
            mediaStream.getTracks().forEach(t => t.stop());
            mediaStream = null;
        }
        if (audioCtx) {
            audioCtx.close().catch(() => {});
            audioCtx = null;
        }
        analyserNode = null;
    }

    /* ====================================================
       操作：清空 / 确认使用
    ==================================================== */
    function clearVoiceText() {
        finalTranscript = '';
        renderTranscript('', '');
        $('voiceActionBtns').style.display = 'none';
        $('voiceStatusText').textContent = '点击麦克风开始录音';
        $('voiceTranscriptBox').classList.remove('has-text');
        $('voicePlaceholder').classList.remove('hidden');
        showToast('已清空，可以重新录制');
    }

    function confirmVoiceText() {
        const text = finalTranscript.trim();
        if (!text) {
            showToast('暂无识别内容，请先录音');
            return;
        }

        // 将语音文字填入文字输入框
        const dreamInput = $('dreamInput');
        if (dreamInput) {
            dreamInput.value = text;
            // 触发字数更新
            dreamInput.dispatchEvent(new Event('input'));
        }

        // 切回文字模式，让用户确认/编辑
        switchMode('text');

        // 显示成功提示
        showToast('✅ 语音内容已填入，可以继续编辑或直接解析');

        // 高亮文字框
        if (dreamInput) {
            dreamInput.focus();
            dreamInput.style.borderColor = 'rgba(167,139,250,0.6)';
            setTimeout(() => {
                dreamInput.style.borderColor = '';
            }, 2000);
        }
    }

    /* ====================================================
       暴露全局接口
    ==================================================== */
    window.switchMode  = switchMode;
    window.toggleVoice = toggleVoice;
    window.clearVoiceText   = clearVoiceText;
    window.confirmVoiceText = confirmVoiceText;

    /* 页面加载后初始化 */
    document.addEventListener('DOMContentLoaded', () => {
        // 如果浏览器不支持，禁用语音Tab提示
        if (!SpeechRecognition) {
            const tabVoice = $('tabVoice');
            if (tabVoice) {
                tabVoice.title = '当前浏览器不支持语音识别，请使用Chrome/Edge';
            }
        }
    });

})();
