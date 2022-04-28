const {GrowDinoRequest, User} = require('../model');
const dinoData = require('../commands/commandData/dino.json');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js'); 
const {allowedCarnivoreColors, allowedHerbivoreColors, colorMap} = require('./ColorMap');

module.exports = class InjectionWorkflow {
  constructor(){
    this.initializeDino = this.initializeDino.bind(this);
    this.pickDino = this.pickDino.bind(this);
  }

  async next(userId, autocall){
    const steps = {
      1: this.initializeDino,
      2: this.pickDino,
      3: this.pickSkinPallete1,
      4: this.pickSkinPallete2,
      5: this.pickSkinPallete3,
      6: this.pickSkinPallete4,
      7: this.pickSkinPallete5,
      8: this.finalize,
    }
    const dinoRequests = await GrowDinoRequest.findAll({where: {UserId: userId}, order: [['id', 'desc'],['step', 'desc']]});

    const lastDinoRequest = dinoRequests[0];
    console.log(lastDinoRequest)

    if(lastDinoRequest === undefined){
      return steps[1];
    }

    if(lastDinoRequest.dataValues.step === 8 && lastDinoRequest.dataValues.isComplete){
      return steps[1];
    }


    console.log(lastDinoRequest.dataValues.isComplete, lastDinoRequest.dataValues.step)
    if(lastDinoRequest.dataValues.isComplete === true){
      return steps[lastDinoRequest.dataValues.step + 1];
    } else {
      return steps[lastDinoRequest.dataValues.step];
    }
  }

  async initializeDino(interaction, userId, value) {
    let existingRequest = await GrowDinoRequest.findOne({where: {step: 1, UserId: userId, isComplete: false}});
    if(value && existingRequest){
      await GrowDinoRequest.update({isComplete: true, value,},{where: {UserId: userId, id: existingRequest.id}});
      return await this.pickDino(interaction, userId, null);
    }

    if(!existingRequest){
      existingRequest = await new GrowDinoRequest({step: 1, isComplete: false, UserId: userId}).save();
    }

    await interaction.channel.send(`<@${interaction.user.id}>, your grow request has initiated! Follow along the next prompts to complete your grow! You may visit back later by typing /inject.`);

    return await this.initializeDino(interaction, userId, 'CreatedRequest');
  }

  async pickDino(interaction, userId, value){
    let existingRequest = await GrowDinoRequest.findOne({where: {step: 2, UserId: userId, isComplete: false}});
    if(value && existingRequest){
      await GrowDinoRequest.update({isComplete: true, value,},{where: {UserId: userId, id: existingRequest.dataValues.id}});
      return;
    }

    if(!existingRequest){
      existingRequest = await new GrowDinoRequest({step: 2, isComplete: false, UserId: userId}).save();
    }
		const dinos = [];
		for(const key in dinoData){
			dinos.push(dinoData[key])
		}
    const user = (await User.findOne({where: {id: userId}})).dataValues;
		const selectOptions = dinos
															.filter(x => x.isSandbox === true || x.requiresApex === (user.isApexApproved === 'Y'))
															.map(x => {
																	return {
																		label: x.displayName,
																		description: `Apex: ${x.requiresApex}`,
																		value: x.value
																	}
																}
															);

    const row = new MessageActionRow()
		.addComponents(
			new MessageSelectMenu()
				.setCustomId('DinoInjection')
				.setPlaceholder('Nothing selected')
				.addOptions(selectOptions),
		);
		
		await interaction.channel.send({ content: `<@${interaction.user.id}>, select your dino from the list below!`, components: [row] });
  }

  async pickSkinPallete1(interaction, userId, value){
    let existingRequest = await GrowDinoRequest.findOne({where: {step: 3, UserId: userId, isComplete: false}});
    if(value && existingRequest){
      await GrowDinoRequest.update({isComplete: true, value,},{where: {UserId: userId, id: existingRequest.dataValues.id}});
      return;
    }

    if(!existingRequest){
      existingRequest = await new GrowDinoRequest({step: 3, isComplete: false, UserId: userId}).save();
    }
    const pickedDino = await GrowDinoRequest.findOne({where: {UserId: userId, step: 2}, order: [['id', 'desc']]});
    const isHerbivore = dinoData[pickedDino.dataValues.value].diet === 'Herbivore';
		const selectOptions = (isHerbivore ? allowedHerbivoreColors.SkinPalleteSection1.allowedValues : allowedCarnivoreColors.SkinPalleteSection1.allowedValues)
      .map(x => {

          return {
            label: x,
            description: `Underbelly: ${x}`,
            value: colorMap.get(x).toString()
          }
        }
      );

		const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('DinoInjection')
          .setPlaceholder('Select Underbelly')
          .addOptions(selectOptions),
      );
		
		await interaction.channel.send({ content: `<@${interaction.user.id}>, select your underbelly skin from the list below!`, components: [row] });
  }

  async pickSkinPallete2(interaction, userId, value){
    let existingRequest = await GrowDinoRequest.findOne({where: {step: 4, UserId: userId, isComplete: false}});
    if(value && existingRequest){
      await GrowDinoRequest.update({isComplete: true, value,},{where: {UserId: userId, id: existingRequest.dataValues.id}});
      return;
    }

    if(!existingRequest){
      existingRequest = await new GrowDinoRequest({step: 4, isComplete: false, UserId: userId}).save();
    }
    const pickedDino = await GrowDinoRequest.findOne({where: {UserId: userId, step: 2}, order: [['id', 'desc']]});
    const isHerbivore = dinoData[pickedDino.dataValues.value].diet === 'Herbivore';
		const selectOptions = (isHerbivore ? allowedHerbivoreColors.SkinPalleteSection2.allowedValues : allowedCarnivoreColors.SkinPalleteSection2.allowedValues)
      .map(x => {
          return {
            label: x,
            description: `Body 1: ${x}`,
            value: `${colorMap.get(x)}`
          }
        }
      );
    let rows = [];
    const split = [];
    while (selectOptions.length > 0) {
        const chunk = selectOptions.splice(0, 25);
        split.push(chunk);
    }
    for(let i = 0; i < split.length; i++){
      rows.push(new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId(`DinoInjection${i}`)
            .setPlaceholder('Select Body 1')
            .addOptions(split[i]),
          )
      );
    } 

		
		await interaction.channel.send({ content: `<@${interaction.user.id}>, select your body 1 skin from the list below!`, components: rows });
  }

  async pickSkinPallete3(interaction, userId, value){
    let existingRequest = await GrowDinoRequest.findOne({where: {step: 5, UserId: userId, isComplete: false}});
    if(value && existingRequest){
      await GrowDinoRequest.update({isComplete: true, value,},{where: {UserId: userId, id: existingRequest.dataValues.id}});
      return;
    }

    if(!existingRequest){
      existingRequest = await new GrowDinoRequest({step: 5, isComplete: false, UserId: userId}).save();
    }
    const pickedDino = await GrowDinoRequest.findOne({where: {UserId: userId, step: 2}, order: [['id', 'desc']]});
    const isHerbivore = dinoData[pickedDino.dataValues.value].diet === 'Herbivore';
		const selectOptions = (isHerbivore ? allowedHerbivoreColors.SkinPalleteSection3.allowedValues : allowedCarnivoreColors.SkinPalleteSection3.allowedValues)
      .map(x => {
          return {
            label: x,
            description: `Body 2: ${x}`,
            value: `${colorMap.get(x)}`
          }
        }
      );
    let rows = [];
    const split = [];
    while (selectOptions.length > 0) {
        const chunk = selectOptions.splice(0, 25);
        split.push(chunk);
    }
    for(let i = 0; i < split.length; i++){
      rows.push(new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId(`DinoInjection${i}`)
            .setPlaceholder('Select Body 2')
            .addOptions(split[i]),
          )
      );
    } 

		
		await interaction.channel.send({ content: 'Select your body 2 skin from the list below!', components: rows });
  }

  async pickSkinPallete4(interaction, userId, value){
    let existingRequest = await GrowDinoRequest.findOne({where: {step: 6, UserId: userId, isComplete: false}});
    if(value && existingRequest){
      await GrowDinoRequest.update({isComplete: true, value,},{where: {UserId: userId, id: existingRequest.dataValues.id}});
      return;
    }

    if(!existingRequest){
      existingRequest = await new GrowDinoRequest({step: 6, isComplete: false, UserId: userId}).save();
    }
    const pickedDino = await GrowDinoRequest.findOne({where: {UserId: userId, step: 2}, order: [['id', 'desc']]});
    const isHerbivore = dinoData[pickedDino.dataValues.value].diet === 'Herbivore';
		const selectOptions = (isHerbivore ? allowedHerbivoreColors.SkinPalleteSection4.allowedValues : allowedCarnivoreColors.SkinPalleteSection4.allowedValues)
      .map(x => {
          return {
            label: x,
            description: `Body 3: ${x}`,
            value: `${colorMap.get(x)}`
          }
        }
      );
    let rows = [];
    const split = [];
    while (selectOptions.length > 0) {
        const chunk = selectOptions.splice(0, 25);
        split.push(chunk);
    }
    for(let i = 0; i < split.length; i++){
      rows.push(new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId(`DinoInjection${i}`)
            .setPlaceholder('Select Body 3')
            .addOptions(split[i]),
          )
      );
    } 

		
		await interaction.channel.send({ content: `<@${interaction.user.id}>, select your body 3 skin from the list below!`, components: rows });
  }

  async pickSkinPallete5(interaction, userId, value){
    let existingRequest = await GrowDinoRequest.findOne({where: {step: 7, UserId: userId, isComplete: false}});
    if(value && existingRequest){
      await GrowDinoRequest.update({isComplete: true, value,},{where: {UserId: userId, id: existingRequest.dataValues.id}});
      return;
    }

    if(!existingRequest){
      existingRequest = await new GrowDinoRequest({step: 7, isComplete: false, UserId: userId}).save();
    }
    const pickedDino = await GrowDinoRequest.findOne({where: {UserId: userId, step: 2}, order: [['id', 'desc']]});
    const isHerbivore = dinoData[pickedDino.dataValues.value].diet === 'Herbivore';
		const selectOptions = (isHerbivore ? allowedHerbivoreColors.SkinPalleteSection5.allowedValues : allowedCarnivoreColors.SkinPalleteSection5.allowedValues)
      .map(x => {
          return {
            label: x,
            description: `Body 4: ${x}`,
            value: `${colorMap.get(x)}`
          }
        }
      );
    let rows = [];
    const split = [];
    while (selectOptions.length > 0) {
        const chunk = selectOptions.splice(0, 25);
        split.push(chunk);
    }
    for(let i = 0; i < split.length; i++){
      rows.push(new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId(`DinoInjection${i}`)
            .setPlaceholder('Select Body 4')
            .addOptions(split[i]),
          )
      );
    } 

		await interaction.channel.send({ content: `<@${interaction.user.id}>, select your body 4 skin from the list below!`, components: rows });
  }

  async finalize(interaction, userId, value){
    let existingRequest = await GrowDinoRequest.findOne({where: {step: 8, UserId: userId}, order: [['id', 'desc']]});
    console.log(existingRequest)
    if(value && existingRequest){
      if(value === 'slay'){

      }
      if(value === 'vault'){

      }
      await interaction.channel.send(`<@${interaction.user.id}> your dino has succesfully been injected! Enjoy, and let any staff know if you have any issues!`);
      return await GrowDinoRequest.update({isComplete: true, value: value}, {where: {step: 8, UserId: userId, isComplete: false}});
    }

    if(!existingRequest){
      existingRequest = await new GrowDinoRequest({step: 8, isComplete: false, UserId: userId}).save();
    }

    if(existingRequest.isComplete) return;

		const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('DinoInjection')
					.setPlaceholder('Nothing selected')
					.addOptions([
						{
							label: 'Slay existing dino',
							description: 'Slay',
							value: 'slay',
						},
						{
							label: 'Vault existing dino',
							description: 'Vault existing dino to restore later',
							value: 'restore',
						},
					]),
			);

		await interaction.channel.send({ content: `<@${interaction.user.id}>, would you like to:`, components: [row] });
  }

}