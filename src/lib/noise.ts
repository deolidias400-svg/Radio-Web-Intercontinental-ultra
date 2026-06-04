/**
 * Procedural Audio Buffer generators for Immersive Background Noise
 * 100% Client-side, works offline, zero CORS issues, perfect zero-delay loop
 */

export function createRainBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const numSamples = sampleRate * seconds;
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);
  
  let lastOut = 0.0;
  for (let i = 0; i < numSamples; i++) {
    // Generate pink noise approximation (spectral density decreases 3dB per octave)
    const white = Math.random() * 2 - 1;
    lastOut = 0.95 * lastOut + 0.05 * white;
    
    // Add realistic rain droplets (sudden micro shifts in frequency)
    let drop = 0;
    if (Math.random() < 0.0018) {
      // Physical wave dispersion of a droplet hitting a leaf/surface
      drop = (Math.random() * 0.3) * Math.sin(i * 0.08) * Math.exp(-0.006 * (i % 600));
    }
    
    // Filtered pinkish wash + dynamic droplets
    data[i] = lastOut * 0.45 + drop * 0.55;
  }
  
  return buffer;
}

export function createVintageStaticBuffer(ctx: AudioContext, seconds = 5): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const numSamples = sampleRate * seconds;
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < numSamples; i++) {
    // Standard tape hiss / thermal static
    const white = Math.random() * 2 - 1;
    let hiss = white * 0.035;
    
    // Vinyl crackle pops (isolated random spike impulses)
    let crackle = 0;
    if (Math.random() < 0.00025) {
      // Crackle pops with random polarities and fast decay
      const polarity = Math.random() > 0.5 ? 1 : -1;
      const amplitude = Math.random() * 0.8;
      crackle = polarity * amplitude;
    }
    
    data[i] = hiss + crackle;
  }
  
  // Smooth the static slightly to emulate older hardware or magnetic tape roll-off
  let lastValue = 0;
  for (let i = 0; i < numSamples; i++) {
    data[i] = 0.8 * data[i] + 0.2 * lastValue;
    lastValue = data[i];
  }
  
  return buffer;
}

export function createStudioHumBuffer(ctx: AudioContext, seconds = 6): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const numSamples = sampleRate * seconds;
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    
    // 60Hz hum representing mains power leakage
    const hum60 = Math.sin(2 * Math.PI * 60 * t);
    // Harmonic distortion at 120Hz and 180Hz
    const hum120 = Math.sin(2 * Math.PI * 120 * t) * 0.3;
    const hum180 = Math.sin(2 * Math.PI * 180 * t) * 0.12;
    
    // Smooth white/pink leakage for analog console floor rumble
    const rumble = (Math.random() * 2 - 1) * 0.07;
    
    data[i] = (hum60 + hum120 + hum180) * 0.15 + rumble * 0.85;
  }
  
  // High frequency filter wash to simulate low-faded background ventilation/HVAC
  let lastVal = 0;
  for (let i = 0; i < numSamples; i++) {
    data[i] = 0.92 * lastVal + 0.08 * data[i];
    lastVal = data[i];
  }
  
  return buffer;
}
