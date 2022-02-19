
module.exports = class DinoFactory {
    dinoObject = {
        "CharacterClass": null,
        "DNA": null,
        "Location_Isle_V3": null,
        "Rotation_Isle_V3": null,
        "Growth": null,
        "Hunger": null,
        "Thirst": null,
        "Stamina": null,
        "Health": null,
        "BleedingRate": null,
        "Oxygen": null,
        "bGender": null,
        "bIsResting": null,
        "bBrokenLegs": null,
        "ProgressionPoints": null,
        "ProgressionTier": null,
        "UnlockedCharacters": null,
        "CameraRotation_Isle_V3": null,
        "CameraDistance_Isle_V3": null,
        "SkinPaletteSection1": null,
        "SkinPaletteSection2": null,
        "SkinPaletteSection3": null,
        "SkinPaletteSection4": null,
        "SkinPaletteSection5": null,
        "SkinPaletteSection6": null,
        "SkinPaletteVariation": null
    };
    
    constructor(){

    }

    setCharacterClass(dinoClass){
        if(dinoClass === null) return this;
        this.dinoObject['characterClass'] = dinoClass;
        return this;
    }

    setCharacterPosition(position){
        if(position === null) return this;
    }

    setCharacterRotation(rotation){
        if(rotation === null) return this;
    }

    setCharacterGrowth(growth){
        if(growth === null) return this;
    }

    setCharacterHunger(hunger){
        if(hunger === null) return this;
    }

    setCharacterThirst(thirst){
        if(thirst === null) return this;
    }

    setCharacterStamina(stamina){
        if(stamina === null) return this;
    }

    setCharacterHealth(health){
        if(health === null) return this;
    }

    setCharacterBleedRate(bleed){
        if(bleed === null) return this;
    }

    setCharacterOxygen(oxygen){
        if(oxygen === null) return this;
    }

    setCharacterGender(gender){
        if(gender === null) return this;
    }

    setCharacterResting(resting){
        if(resting === null) return this;
    }

    setCharacterBrokenLegs(broken){
        if(broken === null) return this;
    }

    setCharacterProgressionPoints(points){
        if(points === null) return this;
    }

    setCharacterProgressionTier(tier){
        if(tier === null) return this;
    }

    setCharacterUnlockedCharacters(characters){
        if(characters === null) return this;
    }

    setCharacterCamerRotation(rotation){
        if(rotation === null) return this;
    }

    setCharacterCameraDistance(distance){
        if(distance === null) return this;
    }

    setCharacterSkinPaletteSectionOne(palette){
        if(palette === null) return this;
    }

    setCharacterSkinPaletteSectionTwo(palette){
        if(palette === null) return this;
    }

    setCharacterSkinPaletteSectionThree(palette){
        if(palette === null) return this;
    }

    setCharacterSkinPaletteSectionFour(palette){
        if(palette === null) return this;
    }

    setCharacterSkinPaletteSectionFive(palette){
        if(palette === null) return this;
    }

    setCharacterSkinPaletteSectionSix(palette){
        if(palette === null) return this;
    }

    setCharacterSkinPaletteVariation(palette){
        if(palette === null) return this;
    }

    render(){
        return this.dinoObject;
    }
};