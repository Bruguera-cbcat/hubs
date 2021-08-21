import { SourceType, MediaAudioDefaults, AvatarAudioDefaults, TargetAudioDefaults } from "./components/audio-params";

const defaultSettingsForSourceType = Object.freeze(
  new Map([
    [SourceType.MEDIA_VIDEO, MediaAudioDefaults],
    [SourceType.AVATAR_AUDIO_SOURCE, AvatarAudioDefaults],
    [SourceType.AUDIO_TARGET, TargetAudioDefaults]
  ])
);

function applySettings(audio, settings) {
  if (audio.panner) {
    audio.setDistanceModel(settings.distanceModel);
    audio.setRolloffFactor(settings.rolloffFactor);
    audio.setRefDistance(settings.refDistance);
    audio.setMaxDistance(settings.maxDistance);
    audio.panner.coneInnerAngle = settings.coneInnerAngle;
    audio.panner.coneOuterAngle = settings.coneOuterAngle;
    audio.panner.coneOuterGain = settings.coneOuterGain;
  }
  audio.gain.gain.setTargetAtTime(settings.gain, audio.context.currentTime, 0.1);
}

export function getCurrentAudioSettings(el) {
  // TODO: Add the DEBUG PANEL settings.
  const sourceType = APP.sourceType.get(el);
  const defaults = defaultSettingsForSourceType.get(sourceType);
  const sceneOverrides = APP.sceneAudioDefaults.get(sourceType);
  const audioOverrides = APP.audioOverrides.get(el);
  const zoneSettings = APP.zoneOverrides.get(el);
  const settings = Object.assign({}, defaults, sceneOverrides, audioOverrides, zoneSettings);

  if (APP.clippingState.has(el) || APP.linkedMutedState.has(el)) {
    settings.gain = 0;
  } else if (APP.gainMultipliers.has(el)) {
    settings.gain = settings.gain * APP.gainMultipliers.get(el);
  }

  return settings;
}

// TODO: Change this name or the name of the function on audio-settings-system
export function updateAudioSettings(el, audio) {
  // Follow these rules and you'll have a good time:
  // - If a THREE.Audio or THREE.PositionalAudio is created, call this function.
  // - If you audio settings change, call this function.
  applySettings(audio, getCurrentAudioSettings(el));
}
