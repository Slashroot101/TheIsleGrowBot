const logger = require('../lib/logger');

module.exports = class DinoFactory {
	dinoObject = {};
	constructor() {
		this.dinoObject = {
			'CharacterClass': null,
			'DNA': null,
			'Location_Isle_V3': null,
			'Rotation_Isle_V3': null,
			'Growth': null,
			'Hunger': null,
			'Thirst': null,
			'Stamina': null,
			'Health': null,
			'BleedingRate': null,
			'Oxygen': null,
			'bGender': null,
			'bIsResting': null,
			'bBrokenLegs': null,
			'ProgressionPoints': null,
			'ProgressionTier': null,
			'UnlockedCharacters': null,
			'CameraRotation_Isle_V3': null,
			'CameraDistance_Isle_V3': null,
			'SkinPaletteSection1': null,
			'SkinPaletteSection2': null,
			'SkinPaletteSection3': null,
			'SkinPaletteSection4': null,
			'SkinPaletteSection5': null,
			'SkinPaletteSection6': null,
			'SkinPaletteVariation': null,
		};
	}

	setCharacterClass(dinoClass) {
		if (dinoClass === null) return this;
		this.dinoObject['characterClass'] = dinoClass;
		return this;
	}

	setCharacterPosition(position) {
		if (position === null) return this;
		this.dinoObject['Location_Isle_V3'] = position;
		return this;
	}

	setCharacterRotation(rotation) {
		if (rotation === null) return this;
		this.dinoObject['Rotation_Isle_V3'] = rotation;
		return this;
	}

	setCharacterGrowth(growth) {
		if (growth === null) return this;
		this.dinoObject['Growth'] = growth;
		return this;
	}

	setCharacterHunger(hunger) {
		if (hunger === null) return this;
		this.dinoObject['Hunger'] = hunger;
		return this;
	}

	setCharacterThirst(thirst) {
		if (thirst === null) return this;
		this.dinoObject['Thirst'] = thirst;
		return this;
	}

	setCharacterStamina(stamina) {
		if (stamina === null) return this;
		this.dinoObject['Stamina'] = stamina;
		return this;
	}

	setCharacterHealth(health) {
		if (health === null) return this;
		this.dinoObject['Health'] = health;
		return this;
	}

	setCharacterBleedRate(bleed) {
		if (bleed === null) return this;
		this.dinoObject['BleedingRate'] = bleed;
		return this;
	}

	setCharacterOxygen(oxygen) {
		if (oxygen === null) return this;
		this.dinoObject['Oxygen'] = oxygen;
		return this;
	}

	setCharacterGender(gender) {
		if (gender === null) return this;
		this.dinoObject['bGender'] = gender;
		return this;
	}

	setCharacterResting(resting) {
		if (resting === null) return this;
		this.dinoObject['bIsResting'] = resting;
		return this;
	}

	setCharacterBrokenLegs(broken) {
		if (broken === null) return this;
		this.dinoObject['bBrokenLegs'] = broken;
		return this;
	}

	setCharacterProgressionPoints(points) {
		if (points === null) return this;
		this.dinoObject['ProgressionPoints'] = points;
		return this;
	}

	setCharacterProgressionTier(tier) {
		if (tier === null) return this;
		this.dinoObject['ProgressionTier'] = tier;
		return this;
	}

	setCharacterUnlockedCharacters(characters) {
		if (characters === null) return this;
		this.dinoObject['UnlockedCharacters'] = characters;
		return this;
	}

	setCharacterCamerRotation(rotation) {
		if (rotation === null) return this;
		this.dinoObject['CameraRotation_Isle_V3'] = rotation;
		return this;
	}

	setCharacterCameraDistance(distance) {
		if (distance === null) return this;
		this.dinoObject['CameraDistance_Isle_V3'] = distance;
		return this;
	}

	setCharacterSkinPaletteSectionOne(palette) {
		if (palette === null) return this;
		this.dinoObject['SkinPaletteSection1'] = palette;
		return this;
	}

	setCharacterSkinPaletteSectionTwo(palette) {
		if (palette === null) return this;
		this.dinoObject['SkinPaletteSection2'] = palette;
		return this;
	}

	setCharacterSkinPaletteSectionThree(palette) {
		if (palette === null) return this;
		this.dinoObject['SkinPaletteSection3'] = palette;
		return this;
	}

	setCharacterSkinPaletteSectionFour(palette) {
		if (palette === null) return this;
		this.dinoObject['SkinPaletteSection4'] = palette;
		return this;
	}

	setCharacterSkinPaletteSectionFive(palette) {
		if (palette === null) return this;
		this.dinoObject['SkinPaletteSection5'] = palette;
		return this;
	}

	setCharacterSkinPaletteSectionSix(palette) {
		if (palette === null) return this;
		this.dinoObject['SkinPaletteSection6'] = palette;
		return this;
	}

	setCharacterSkinPaletteVariation(palette) {
		if (palette === null) return this;
		this.dinoObject['SkinPaletteVariation'] = palette;
		return this;
	}

	render() {
		return JSON.stringify(this.dinoObject);
	}
};