/**
 * Procedural Web Audio Ambient Noise Generator.
 * Creates continuous, soothing, low-fidelity background noise without external audio files.
 */

export type AmbientTrack = 'rain' | 'clock' | 'server' | 'office';

export interface AmbientTrackInfo {
  id: AmbientTrack;
  label: string;
  icon: string;
  description: string;
}

export const AMBIENT_TRACKS: AmbientTrackInfo[] = [
  {
    id: 'rain',
    label: 'Rain on Window',
    icon: '🌧️',
    description: 'Cozy rain showers and gentle droplet taps on a glass pane.',
  },
  {
    id: 'clock',
    label: 'Distant Ticking Clock',
    icon: '🕰️',
    description: 'A monotonous, steady mechanical pendulum measuring squandered time.',
  },
  {
    id: 'server',
    label: 'Humming Server Room',
    icon: '🖥️',
    description: 'Low 60Hz fan airflow, steady cooling hum, and faint server chirps.',
  },
  {
    id: 'office',
    label: 'Fluorescent Office Drone',
    icon: '💡',
    description: 'The hypnotic, soul-draining buzz of an empty 9-to-5 hallway.',
  },
];

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private activeTrack: AmbientTrack = 'rain';
  private volume: number = 0.45; // 0 to 1

  private masterGain: GainNode | null = null;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private intervalIds: number[] = [];

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.ctx && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getActiveTrack(): AmbientTrack {
    return this.activeTrack;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    localStorage.setItem('chronosink_ambient_vol', this.volume.toString());
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start(this.activeTrack);
      return true;
    }
  }

  public setTrack(track: AmbientTrack) {
    this.activeTrack = track;
    localStorage.setItem('chronosink_ambient_track', track);
    if (this.isPlaying) {
      this.stop();
      this.start(track);
    }
  }

  public start(track: AmbientTrack = this.activeTrack) {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.stop();
    this.activeTrack = track;
    this.isPlaying = true;

    if (track === 'rain') {
      this.startRain();
    } else if (track === 'clock') {
      this.startClock();
    } else if (track === 'server') {
      this.startServer();
    } else if (track === 'office') {
      this.startOffice();
    }
  }

  public stop() {
    this.isPlaying = false;
    // Clear recurring intervals
    this.intervalIds.forEach((id) => clearInterval(id));
    this.intervalIds = [];

    // Disconnect active generator nodes
    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {
        // Safe discard
      }
    });
    this.activeNodes = [];
  }

  // --- Track 1: Rain on Window ---
  private startRain() {
    if (!this.ctx || !this.masterGain) return;

    // Continuous pink/brown background rain noise
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.4;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to soft rain frequency
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.55, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, rainGain);

    // Random droplet taps on window glass
    const dropInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();

      const freq = 1200 + Math.random() * 1600;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.035);

      const vol = 0.08 + Math.random() * 0.12;
      dropGain.gain.setValueAtTime(vol, now);
      dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(dropGain);
      dropGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.035);
    }, 140);

    this.intervalIds.push(dropInterval);
  }

  // --- Track 2: Distant Ticking Clock ---
  private startClock() {
    if (!this.ctx || !this.masterGain) return;

    let isTick = true;

    const tick = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Alternate pitch between tick (820Hz) and tock (640Hz)
      const baseFreq = isTick ? 840 : 660;
      isTick = !isTick;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.04);
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    this.intervalIds.push(interval);
  }

  // --- Track 3: Humming Server Room ---
  private startServer() {
    if (!this.ctx || !this.masterGain) return;

    // 60Hz mains hum
    const hum60 = this.ctx.createOscillator();
    const hum120 = this.ctx.createOscillator();
    const humGain = this.ctx.createGain();

    hum60.type = 'sine';
    hum60.frequency.setValueAtTime(60, this.ctx.currentTime);

    hum120.type = 'sine';
    hum120.frequency.setValueAtTime(120, this.ctx.currentTime);

    humGain.gain.setValueAtTime(0.28, this.ctx.currentTime);

    hum60.connect(humGain);
    hum120.connect(humGain);
    humGain.connect(this.masterGain);

    hum60.start();
    hum120.start();
    this.activeNodes.push(hum60, hum120, humGain);

    // Fan airflow noise
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.25;
    }

    const fanNoise = this.ctx.createBufferSource();
    fanNoise.buffer = noiseBuffer;
    fanNoise.loop = true;

    const fanFilter = this.ctx.createBiquadFilter();
    fanFilter.type = 'bandpass';
    fanFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    fanFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    const fanGain = this.ctx.createGain();
    fanGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    fanNoise.connect(fanFilter);
    fanFilter.connect(fanGain);
    fanGain.connect(this.masterGain);

    fanNoise.start();
    this.activeNodes.push(fanNoise, fanFilter, fanGain);

    // Occasional server hard-drive chatter
    const seekInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      if (Math.random() > 0.45) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const seekGain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(2200 + Math.random() * 800, now);

      seekGain.gain.setValueAtTime(0.04, now);
      seekGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(seekGain);
      seekGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.02);
    }, 400);

    this.intervalIds.push(seekInterval);
  }

  // --- Track 4: Fluorescent Office Drone ---
  private startOffice() {
    if (!this.ctx || !this.masterGain) return;

    const buzz = this.ctx.createOscillator();
    const buzzHarmonic = this.ctx.createOscillator();
    const buzzGain = this.ctx.createGain();

    buzz.type = 'sawtooth';
    buzz.frequency.setValueAtTime(100, this.ctx.currentTime);

    buzzHarmonic.type = 'triangle';
    buzzHarmonic.frequency.setValueAtTime(200, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);

    buzzGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    buzz.connect(filter);
    buzzHarmonic.connect(filter);
    filter.connect(buzzGain);
    buzzGain.connect(this.masterGain);

    buzz.start();
    buzzHarmonic.start();
    this.activeNodes.push(buzz, buzzHarmonic, filter, buzzGain);
  }
}

export const ambientSound = new AmbientEngine();
