import { useState, useRef, useCallback, useEffect } from 'react';

export interface LiveChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
}

export interface UseGeminiLiveReturn {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  isModelSpeaking: boolean;
  isMicMuted: boolean;
  micLevel: number;
  modelLevel: number;
  messages: LiveChatMessage[];
  currentModelTurnText: string;
  errorMessage: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleMicMute: () => void;
  stopAllPlayback: () => void;
  sendTextMessage: (text: string) => void;
}

// Helper to convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function useGeminiLive(): UseGeminiLiveReturn {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [modelLevel, setModelLevel] = useState(0);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [currentModelTurnText, setCurrentModelTurnText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);
  const isMicMutedRef = useRef(false);
  const levelIntervalRef = useRef<number | null>(null);

  // Keep ref in sync
  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  const stopAllPlayback = useCallback(() => {
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Ignore errors if already stopped
      }
    });
    activeSourcesRef.current = [];
    nextPlayTimeRef.current = 0;
    setIsModelSpeaking(false);
    setModelLevel(0);
  }, []);

  const cleanupAudio = useCallback(() => {
    stopAllPlayback();

    if (micProcessorRef.current) {
      micProcessorRef.current.disconnect();
      micProcessorRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // Ignore
      }
      audioContextRef.current = null;
    }

    if (levelIntervalRef.current) {
      window.clearInterval(levelIntervalRef.current);
      levelIntervalRef.current = null;
    }

    setMicLevel(0);
    setModelLevel(0);
  }, [stopAllPlayback]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // Ignore
      }
      wsRef.current = null;
    }
    cleanupAudio();
    setStatus('disconnected');
    setCurrentModelTurnText('');
  }, [cleanupAudio]);

  const playPcmChunk = useCallback((base64Data: string, sampleRate = 24000) => {
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx({ sampleRate });
      }

      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const rawBuffer = base64ToArrayBuffer(base64Data);
      const int16Array = new Int16Array(rawBuffer);
      if (int16Array.length === 0) return;

      const float32Array = new Float32Array(int16Array.length);
      let sumSq = 0;
      for (let i = 0; i < int16Array.length; i++) {
        const sample = int16Array[i] / 32768.0;
        float32Array[i] = sample;
        sumSq += sample * sample;
      }

      const rms = Math.sqrt(sumSq / int16Array.length);
      const level = Math.min(100, Math.round(rms * 250));
      setModelLevel(level);

      const audioBuffer = audioCtx.createBuffer(1, float32Array.length, sampleRate);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      const startTime = Math.max(now, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;

      activeSourcesRef.current.push(source);
      setIsModelSpeaking(true);

      source.onended = () => {
        const idx = activeSourcesRef.current.indexOf(source);
        if (idx !== -1) {
          activeSourcesRef.current.splice(idx, 1);
        }
        if (activeSourcesRef.current.length === 0) {
          setIsModelSpeaking(false);
          setModelLevel(0);
        }
      };
    } catch (err) {
      console.warn('[useGeminiLive] Audio playback error:', err);
    }
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const userMsg: LiveChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'text',
        text: text.trim(),
      }));
    }
  }, []);

  const toggleMicMute = useCallback(() => {
    setIsMicMuted(prev => {
      const next = !prev;
      isMicMutedRef.current = next;
      if (micStreamRef.current) {
        micStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = !next;
        });
      }
      return next;
    });
  }, []);

  const setupMicrophone = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('getUserMedia not supported in this environment');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const recordAudioCtx = new AudioCtx({ sampleRate: 16000 });
      const source = recordAudioCtx.createMediaStreamSource(stream);

      // 4096 buffer size
      const processor = recordAudioCtx.createScriptProcessor(4096, 1, 1);
      micProcessorRef.current = processor;

      processor.onaudioprocess = e => {
        if (isMicMutedRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          setMicLevel(0);
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);
        let sumSq = 0;
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const sample = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
          sumSq += sample * sample;
        }

        const rms = Math.sqrt(sumSq / inputData.length);
        const level = Math.min(100, Math.round(rms * 300));
        setMicLevel(level);

        // Send base64 audio chunk to server
        const base64Audio = arrayBufferToBase64(pcm16.buffer);
        wsRef.current.send(JSON.stringify({
          type: 'audio',
          audio: base64Audio,
          mimeType: 'audio/pcm;rate=16000',
        }));
      };

      source.connect(processor);
      processor.connect(recordAudioCtx.destination);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[useGeminiLive] Microphone access error:', message);
      setErrorMessage('Microphone access unavailable. You can still type queries or tap prompt buttons.');
    }
  }, []);

  const connect = useCallback(async () => {
    if (status === 'connecting' || status === 'connected') return;

    setStatus('connecting');
    setErrorMessage(null);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/live`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[useGeminiLive] Connected to Live WebSocket server');
        setStatus('connected');
        setupMicrophone();
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'audio' && data.audio) {
            playPcmChunk(data.audio, 24000);
          } else if (data.type === 'text' && data.text) {
            setCurrentModelTurnText(prev => prev + data.text);
          } else if (data.type === 'interrupted') {
            stopAllPlayback();
            setCurrentModelTurnText('');
          } else if (data.type === 'turnComplete') {
            setCurrentModelTurnText(currentText => {
              if (currentText.trim()) {
                const modelMsg: LiveChatMessage = {
                  id: 'model-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
                  role: 'model',
                  text: currentText.trim(),
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages(prev => [...prev, modelMsg]);
              }
              return '';
            });
          } else if (data.type === 'status' && data.status === 'no_key') {
            setErrorMessage('Gemini API key is not configured. Running in local simulated assistance mode.');
          } else if (data.type === 'error') {
            setErrorMessage(data.error || 'Live API encountered an error');
          }
        } catch (e) {
          console.error('[useGeminiLive] Message parsing error:', e);
        }
      };

      ws.onerror = err => {
        console.error('[useGeminiLive] WebSocket error:', err);
        setStatus('error');
        setErrorMessage('Failed to connect to Live Voice service. Please check network connection.');
      };

      ws.onclose = () => {
        console.log('[useGeminiLive] WebSocket closed');
        setStatus('disconnected');
        cleanupAudio();
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[useGeminiLive] Connection error:', message);
      setStatus('error');
      setErrorMessage('Could not establish Live API connection.');
    }
  }, [cleanupAudio, playPcmChunk, setupMicrophone, status, stopAllPlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    status,
    isModelSpeaking,
    isMicMuted,
    micLevel,
    modelLevel,
    messages,
    currentModelTurnText,
    errorMessage,
    connect,
    disconnect,
    toggleMicMute,
    stopAllPlayback,
    sendTextMessage,
  };
}
