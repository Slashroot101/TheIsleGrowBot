const colors = require('../commands/commandData/colorMap.json');

const colorMap = new Map();

exports.initColorMap = () => {
  for (const colorRange in colors.Colors){
    const rangeValue = colors.Colors[colorRange];
    if(Array.isArray(rangeValue)){
      for(let color of rangeValue){
        colorMap.set(`${color.name}`, color.value);
      }

    } else {
      for(let i = rangeValue.start; i <= rangeValue.end; i++){
        colorMap.set(`${colorRange}${i-rangeValue.start + 1}`, i);
      }
    }
  }
}

exports.allowedHerbivoreColors = {
  SkinPalleteSection1: {
    description: 'Detail/Crest',
    allowedValues: ["Diablo2", "Allo1", "Cerato1", "Giga1", "Diablo1", "Gallie1", "Para1", "Trike1", "Carnivore Red", "Carnivore Blue", "Carnivore Yellow", "Carnivore Orange"],
  },
  SkinPalleteSection2: {
    description: 'Underbelly',
    allowedValues: ["Allo4",	"Carno2",	"Carno3",	"Carno4",	"Rex3",
      "Rex4",	"Cerato2",	"Cerato3",	"Cerato4",	"Cerato5",
      "Giga1",	"Giga2",	"Giga3",	"Giga4",	"Utah1",
      "Utah4",	"Utah5",	"Diablo1",	"Diablo2",	"Diablo3",
      "Diablo4",	"Diablo5",	"Dryo1",	"Dryo2",	"Dryo3",
      "Dryo4",	"Dryo5",	"Gallie2",	"Gallie3",	"Gallie4",
      "Gallie5",	"Maia1",	"Maia2",	"Maia3",	"Maia4",
      "Maia5",	"Para3",	"Para4",	"Para5",	"Trike1",
      "Trike2",	"Trike3",	"Trike4",	"Trike5"],
  },
  SkinPalleteSection3: {
    description: 'Body 1',
    allowedValues: ["Allo4",	"Carno2",	"Carno3",	"Carno4",	"Rex3",
    "Rex4",	"Cerato2",	"Cerato3",	"Cerato4",	"Cerato5",
    "Giga1",	"Giga2",	"Giga3",	"Giga4",	"Utah1",
    "Utah4",	"Utah5",	"Diablo1",	"Diablo2",	"Diablo3",
    "Diablo4",	"Diablo5",	"Dryo1",	"Dryo2",	"Dryo3",
    "Dryo4",	"Dryo5",	"Gallie2",	"Gallie3",	"Gallie4",
    "Gallie5",	"Maia1",	"Maia2",	"Maia3",	"Maia4",
    "Maia5",	"Para3",	"Para4",	"Para5",	"Trike1",
    "Trike2",	"Trike3",	"Trike4",	"Trike5"],
  },
  SkinPalleteSection4: {
    description: 'Body 2',
    allowedValues: ["Allo4",	"Carno2",	"Carno3",	"Carno4",	"Rex3",
    "Rex4",	"Cerato2",	"Cerato3",	"Cerato4",	"Cerato5",
    "Giga1",	"Giga2",	"Giga3",	"Giga4",	"Utah1",
    "Utah4",	"Utah5",	"Diablo1",	"Diablo2",	"Diablo3",
    "Diablo4",	"Diablo5",	"Dryo1",	"Dryo2",	"Dryo3",
    "Dryo4",	"Dryo5",	"Gallie2",	"Gallie3",	"Gallie4",
    "Gallie5",	"Maia1",	"Maia2",	"Maia3",	"Maia4",
    "Maia5",	"Para3",	"Para4",	"Para5",	"Trike1",
    "Trike2",	"Trike3",	"Trike4",	"Trike5"],
  },
  SkinPalleteSection5: {
    description: 'Body 3',
    allowedValues: ["Allo5",	"Carno5",	"Rex5",	"Cerato5",	"Giga3",
    "Giga4",	"Giga5",	"Utah4",	"Utah5",	"Diablo1",
    "Diablo3",	"Diablo4",	"Diablo5",	"Dryo5"],
  },
}

exports.allowedCarnivoreColors = {
  SkinPalleteSection1: {
    description: 'Detail/Crest',
    allowedValues: ['Red Crest', 'Blue Crest', 'Yellow Crest', 'Orange Crest', 'Lime Crest'],
  },
  SkinPalleteSection2: {
    description: 'Underbelly',
    allowedValues: ["Allo2",	"Allo3",	"Allo4",	"Carno2",	"Carno3",
    ,"Carno4",	"Rex2",	"Rex3",	"Rex4",	"Cerato2",
      "Cerato3",	"Cerato4",	"Cerato5",	"Giga1",	"Giga2",
      "Giga3",	"Giga4",	"Utah1",	"Utah2",	"Utah3",
      "Utah5",	"Diablo1",	"Diablo2",	"Diablo3",	"Diablo4",
      "Diablo5"],
  },
  SkinPalleteSection3: {
    description: 'Body 1',
    allowedValues: ["Allo2",	"Allo3",	"Allo4",	"Carno2",	"Carno3",
    ,"Carno4",	"Rex2",	"Rex3",	"Rex4",	"Cerato2",
      "Cerato3",	"Cerato4",	"Cerato5",	"Giga1",	"Giga2",
      "Giga3",	"Giga4",	"Utah1",	"Utah2",	"Utah3",
      "Utah5",	"Diablo1",	"Diablo2",	"Diablo3",	"Diablo4",
      "Diablo5"],
  },
  SkinPalleteSection4: {
    description: 'Body 2',
    allowedValues: ["Allo2",	"Allo3",	"Allo4",	"Carno2",	"Carno3",
    ,"Carno4",	"Rex2",	"Rex3",	"Rex4",	"Cerato2",
      "Cerato3",	"Cerato4",	"Cerato5",	"Giga1",	"Giga2",
      "Giga3",	"Giga4",	"Utah1",	"Utah2",	"Utah3",
      "Utah5",	"Diablo1",	"Diablo2",	"Diablo3",	"Diablo4",
      "Diablo5"],
  },
  SkinPalleteSection5: {
    description: 'Body 3',
    allowedValues: ["Allo3",	"Allo4",	"Allo5",	"Carno2",	"Carno3",
      "Carno4",	"Carno5",	"Rex3",	"Rex5",	"Cerato3",
      "Cerato5", "Giga1",	"Giga2",	"Giga3",	"Giga4",
      "Giga5","Utah1",	"Utah4",	"Utah5",	"Diablo1",
      "Diablo3",	"Diablo4",	"Diablo5"],
  },
};

exports.skinVariation = [
  {
    name: "Off/No Variation",
    value: 0.0
  },
  {
    name: "Small Variation",
    value: 8.0 
  },
  {
    name: "Medium Variation",
    value: 6.0
  },
  {
    name: "Large Variation",
    value: 4.0
  },
];

exports.colorMap = colorMap;