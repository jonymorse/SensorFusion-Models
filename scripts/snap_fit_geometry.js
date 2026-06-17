const snapProfiles = {
  current: {
    frameDepth: 16,
    frameWall: 3,
    backThickness: 3,
    snapTabWidth: 18,
    snapTabThickness: 2.2,
    snapTabDepth: 8,
    snapBarbHeight: 1.8,
    snapBarbProjection: 1.0,
    snapWindowClearance: {
      tight: 0.6,
      current: 0.9,
      loose: 1.2,
    },
  },
  // Clone this profile when testing revised snap behavior without changing the baseline build.
  candidate: {
    frameDepth: 16,
    frameWall: 3,
    backThickness: 3,
    snapTabWidth: 18,
    snapTabThickness: 2.2,
    snapTabDepth: 8,
    snapBarbHeight: 1.7999999999999998,
    snapBarbProjection: 1,
    snapWindowClearance: {
      tight: 0.45,
      current: 0.9,
      loose: 1,
    },
  },
};

function resolveSnapProfile(profileName = "current") {
  return snapProfiles[profileName] || snapProfiles.current;
}

function resolveSnapWindowClearance(profileName = "current", clearanceVariant = "current") {
  const profile = resolveSnapProfile(profileName);
  return profile.snapWindowClearance[clearanceVariant] ?? profile.snapWindowClearance.current;
}

function resolveSnapZPositions(profileName = "current", backPlateZ) {
  const profile = resolveSnapProfile(profileName);
  const neckZ = backPlateZ - profile.snapTabDepth;
  const hookTipZ = neckZ + profile.snapBarbHeight * 0.55;
  const hookTopZ = neckZ + profile.snapBarbHeight;
  const frameWindowZ = neckZ + profile.snapBarbHeight / 2;

  return {
    neckZ,
    hookTipZ,
    hookTopZ,
    frameWindowZ,
  };
}

module.exports = {
  snapProfiles,
  resolveSnapProfile,
  resolveSnapWindowClearance,
  resolveSnapZPositions,
};
