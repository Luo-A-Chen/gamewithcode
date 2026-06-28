export class AudioManager {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.masterVolume = 0.5;
    this.bgmVolume = 0.3;
    this.sfxVolume = 0.7;
    this.bgmPlaying = false;
    this.bgmNodes = [];
    this.currentBGM = null;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  playJump() { this.playTone(440, 0.1, 'square', 0.3, 600); }
  playDoubleJump() { this.playTone(550, 0.1, 'square', 0.3, 800); }
  playLand() { this.playNoise(0.08, 0.2, 200); }
  playCollect() {
    this.playTone(880, 0.08, 'sine', 0.4);
    var self = this;
    setTimeout(function() { self.playTone(1100, 0.08, 'sine', 0.3); }, 80);
  }
  playFragment() {
    var self = this;
    var notes = [523, 659, 784, 1047];
    notes.forEach(function(freq, i) {
      setTimeout(function() { self.playTone(freq, 0.15, 'sine', 0.3); }, i * 100);
    });
  }
  playHurt() { this.playTone(200, 0.2, 'sawtooth', 0.4, 100); }
  playEnemyDeath() {
    this.playTone(300, 0.15, 'square', 0.3, 100);
    var self = this;
    setTimeout(function() { self.playTone(200, 0.1, 'square', 0.2, 80); }, 100);
  }
  playBossHit() {
    this.playNoise(0.15, 0.5, 100);
    this.playTone(150, 0.2, 'sawtooth', 0.4, 80);
  }
  playMenuSelect() { this.playTone(660, 0.06, 'sine', 0.2); }
  playMenuConfirm() {
    this.playTone(523, 0.08, 'sine', 0.3);
    var self = this;
    setTimeout(function() { self.playTone(784, 0.1, 'sine', 0.3); }, 80);
  }

  // ─── 背景音乐 ───

  startBGM(levelName) {
    if (!this.initialized) return;
    if (this.currentBGM === levelName) return;
    this.stopBGM();
    this.currentBGM = levelName;
    this.bgmPlaying = true;
    this._playBGMForLevel(levelName);
  }

  stopBGM() {
    this.bgmPlaying = false;
    this.currentBGM = null;
    for (var i = 0; i < this.bgmNodes.length; i++) {
      try { this.bgmNodes[i].stop(); } catch(e) {}
    }
    this.bgmNodes = [];
  }

  _playBGMForLevel(levelName) {
    if (!this.bgmPlaying || !this.initialized) return;

    var melodies = {
      level1: [ // 机械风八音盒
        {f:330,d:0.25},{f:392,d:0.25},{f:440,d:0.35},{f:392,d:0.25},{f:330,d:0.35},{f:294,d:0.25},{f:262,d:0.35},{f:294,d:0.25},
        {f:330,d:0.45},{f:0,d:0.25},{f:392,d:0.25},{f:440,d:0.25},{f:523,d:0.35},{f:440,d:0.25},{f:392,d:0.35},{f:330,d:0.45},{f:0,d:0.35},
      ],
      level2: [ // 电子脉冲
        {f:220,d:0.15},{f:277,d:0.15},{f:330,d:0.15},{f:440,d:0.3},{f:0,d:0.15},{f:330,d:0.15},{f:277,d:0.15},{f:220,d:0.3},
        {f:0,d:0.15},{f:330,d:0.15},{f:440,d:0.15},{f:554,d:0.3},{f:0,d:0.15},{f:440,d:0.15},{f:330,d:0.15},{f:277,d:0.3},{f:0,d:0.3},
      ],
      level3: [ // 打字机节奏
        {f:523,d:0.12},{f:0,d:0.08},{f:523,d:0.12},{f:0,d:0.08},{f:659,d:0.2},{f:0,d:0.1},{f:523,d:0.12},{f:0,d:0.08},
        {f:784,d:0.2},{f:0,d:0.1},{f:659,d:0.2},{f:0,d:0.1},{f:523,d:0.3},{f:0,d:0.2},{f:392,d:0.2},{f:0,d:0.1},{f:440,d:0.3},{f:0,d:0.3},
      ],
      level4: [ // C语言编译音
        {f:262,d:0.3},{f:330,d:0.3},{f:392,d:0.3},{f:523,d:0.5},{f:0,d:0.2},{f:392,d:0.3},{f:330,d:0.3},{f:262,d:0.5},{f:0,d:0.3},
      ],
      level5: [ // 城市电子乐
        {f:330,d:0.2},{f:0,d:0.1},{f:440,d:0.2},{f:0,d:0.1},{f:523,d:0.2},{f:0,d:0.1},{f:440,d:0.2},{f:0,d:0.1},
        {f:392,d:0.3},{f:0,d:0.15},{f:330,d:0.3},{f:0,d:0.15},{f:294,d:0.3},{f:0,d:0.15},{f:330,d:0.5},{f:0,d:0.3},
      ],
      level6: [ // 网页加载声
        {f:440,d:0.15},{f:554,d:0.15},{f:659,d:0.15},{f:880,d:0.3},{f:0,d:0.15},{f:659,d:0.15},{f:554,d:0.15},{f:440,d:0.3},
        {f:0,d:0.2},{f:523,d:0.2},{f:659,d:0.2},{f:784,d:0.3},{f:0,d:0.15},{f:659,d:0.2},{f:523,d:0.3},{f:0,d:0.3},
      ],
      level7: [ // 神经网络脉冲
        {f:262,d:0.2},{f:330,d:0.2},{f:392,d:0.2},{f:523,d:0.2},{f:659,d:0.2},{f:784,d:0.3},{f:0,d:0.2},
        {f:784,d:0.2},{f:659,d:0.2},{f:523,d:0.2},{f:392,d:0.2},{f:330,d:0.2},{f:262,d:0.3},{f:0,d:0.3},
      ],
    };

    var melody = melodies[levelName] || melodies.level1;
    var time = this.ctx.currentTime + 0.1;
    var nodes = [];
    var self = this;
    var totalDuration = 0;

    for (var i = 0; i < melody.length; i++) {
      var note = melody[i];
      if (note.f > 0) {
        var osc = this.ctx.createOscillator();
        var gain = this.ctx.createGain();
        osc.type = levelName === 'level2' ? 'sawtooth' : (levelName === 'level7' ? 'triangle' : 'sine');
        osc.frequency.value = note.f;
        gain.gain.value = 0;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(this.bgmVolume * 0.15, time + 0.02);
        gain.gain.linearRampToValueAtTime(0, time + note.d);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + note.d);
        nodes.push(osc);
      }
      time += note.d;
      totalDuration += note.d;
    }

    this.bgmNodes = nodes;

    setTimeout(function() {
      if (self.bgmPlaying) self._playBGMForLevel(levelName);
    }, totalDuration * 1000);
  }

  // ─── 音效工具 ───

  playTone(freq, duration, type, volume, endFreq) {
    if (!this.initialized) return;
    type = type || 'sine';
    volume = volume !== undefined ? volume : 0.3;
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    if (endFreq) {
      osc.frequency.linearRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
    }
    gain.gain.value = this.sfxVolume * volume;
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playNoise(duration, volume, filterFreq) {
    if (!this.initialized) return;
    volume = volume !== undefined ? volume : 0.3;
    var bufferSize = this.ctx.sampleRate * duration;
    var buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    var source = this.ctx.createBufferSource();
    source.buffer = buffer;
    var filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq || 1000;
    var gain = this.ctx.createGain();
    gain.gain.value = this.sfxVolume * volume;
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();
    source.stop(this.ctx.currentTime + duration);
  }
}
