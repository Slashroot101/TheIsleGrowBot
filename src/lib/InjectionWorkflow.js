const {GrowDinoRequest, User} = require('../model');
const dinoData = require('../commands/commandData/dino.json');
const { MessageActionRow, MessageSelectMenu } = require('discord.js'); 
const {allowedCarnivoreColors, allowedHerbivoreColors, colorMap} = require('./ColorMap');
const logger = require('./logger');
const {playerDatabase} = require('../config/index');
const IslePlayerDatabase = require('../lib/IslePlayerDatabase');

module.exports = class InjectionWorkflow {
  constructor(){
    this.initializeDino = this.initializeDino.bind(this);
    this.pickDino = this.pickDino.bind(this);
  }

  async next(userId, autocall, client){
    const steps = {
      1: this.initializeDino,
      2: this.pickDino,
      3: this.pickGender,
      4: this.pickSkinPallete1,
      5: this.pickSkinPallete2,
      6: this.pickSkinPallete3,
      7: this.pickSkinPallete4,
      8: this.pickSkinPallete5,
      9: this.finalize,
    }
    const dinoRequests = await GrowDinoRequest.findAll({where: {UserId: userId}, order: [['id', 'desc'],['step', 'desc']]});

    const lastDinoRequest = dinoRequests[0];

    if(lastDinoRequest === undefined){
      logger.info(`Could not find a last dino request for user [userId=${userId}], returning to step 1`);
      return steps[1];
    }

    if(lastDinoRequest.dataValues.step === 9 && lastDinoRequest.dataValues.isComplete && autocall) return;

    if(lastDinoRequest.dataValues.step === 3 && lastDinoRequest.dataValues.value){
      const pickedDino = await GrowDinoRequest.findOne({where: {step: 2, UserId: userId, isComplete: true}, order: [['id', 'desc']]});
      const dino = dinoData[pickedDino.dataValues.value];
      console.log(dino)
      if (dino.isSandbox === true){
        return steps[9];
      }
    }

    if(lastDinoRequest.dataValues.step === 3 && lastDinoRequest.dataValues.isComplete && lastDinoRequest.dataValues.value === 'Female'){
      return steps[5];
    }

    if(lastDinoRequest.dataValues.step === 9 && lastDinoRequest.dataValues.isComplete){
      logger.info(`Last dino step was 9 for [userId=${userId}] and it was complete, returning to step 1`);
      return steps[1];
    }

    if(lastDinoRequest.dataValues.isComplete === true){
      logger.info(`Last dino step was complete for [userId=${userId}], handing step ${lastDinoRequest.dataValues.step + 1}`)
      return steps[lastDinoRequest.dataValues.step + 1];
    } else {
      logger.info(`Last dino step was not complete for [userId=${userId}], handing them step ${lastDinoRequest.dataValues.step}`);
      return steps[lastDinoRequest.dataValues.step];
    }
  }

  async initializeDino(interaction, userId, value) {
    let existingRequest = await GrowDinoRequest.findOne({where: {step: 1, UserId: userId, isComplete: false}});
    if(value && existingRequest){
      await GrowDinoRequest.update({isComplete: true, value,},{where: {UserId: userId, id: existingRequest.id}});
      return await this.pickDino(interaction, userId, null);
    }

    const message = await interaction.channel.send(`<@${interaction.user.id}>, your grow request has initiated! Follow along the next prompts to complete your grow! You may visit back later by typing /inject.`);
    if(!existingRequest){
      existingRequest = await new GrowDinoRequest({step: 1, isComplete: false, UserId: userId, messageId: message.id}).save();
    }

    return await this.initializeDino(interaction, userId, 'CreatedRequest');
  }

  async pickDino(interaction, userId, value, client){
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
															.filter(x => x.requiresApex === false || x.requiresApex === (user.isApexApproved === 'Y'))
															.map(x => {
																	return {
																		label: x.displayName,
																		description: `Apex: ${x.requiresApex} | Sandbox : ${x.isSandbox}`,
																		value: x.value
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
            .setPlaceholder(`Select Dinosaur Page ${i + 1}/${split.length}`)
            .addOptions(split[i]),
          )
      );
    }                           
		
		const message = await interaction.reply({ content: `<@${interaction.user.id}>, select your dino from the list below!`, components: [...rows], ephemeral: true, fetchReply: true});
    await GrowDinoRequest.update({messageId: message.id}, {where: {id: existingRequest.id}});
  }

  async pickSkinPallete1(interaction, userId, value, client){
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
		const selectOptions = (isHerbivore ? allowedHerbivoreColors.SkinPalleteSection1.allowedValues : allowedCarnivoreColors.SkinPalleteSection1.allowedValues)
      .map(x => {

          return {
            label: x,
            description: `Detail: ${x}`,
            value: colorMap.get(x).toString()
          }
        }
      );

		const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('DinoInjection')
          .setPlaceholder('Select Crest Detail')
          .addOptions(selectOptions),
      );
		
		const message = await interaction.reply({ content: `<@${interaction.user.id}>, select your crest skin from the list below!`, components: [row], fetchReply: true, ephemeral: true, });
    await GrowDinoRequest.update({messageId: message.id}, {where: {id: existingRequest.id}});
  }

  async pickSkinPallete2(interaction, userId, value, client){
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
		const selectOptions = (isHerbivore ? allowedHerbivoreColors.SkinPalleteSection2.allowedValues : allowedCarnivoreColors.SkinPalleteSection2.allowedValues)
      .map(x => {
          return {
            label: x,
            description: `Underbelly: ${x}`,
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
            .setPlaceholder(`Select Underbelly Page ${i + 1}/${split.length}`)
            .addOptions(split[i]),
          )
      );
    } 
		
		const message = await interaction.reply({ content: `<@${interaction.user.id}>, select your underbelly skin from the list below!`, components: rows, fetchReply: true, ephemeral: true,  });
    await GrowDinoRequest.update({messageId: message.id}, {where: {id: existingRequest.id}});
  }

  async pickSkinPallete3(interaction, userId, value, client){
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
		const selectOptions = (isHerbivore ? allowedHerbivoreColors.SkinPalleteSection3.allowedValues : allowedCarnivoreColors.SkinPalleteSection3.allowedValues)
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
            .setPlaceholder(`Select Body 1 Page ${i + 1}/${split.length}`)
            .addOptions(split[i]),
          )
      );
    } 

		
		const message = await interaction.reply({ content: 'Select your body 1 skin from the list below!', components: rows, fetchReply: true, ephemeral: true,  });
    await GrowDinoRequest.update({messageId: message.id}, {where: {id: existingRequest.id}});
  }

  async pickSkinPallete4(interaction, userId, value, client){
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
		const selectOptions = (isHerbivore ? allowedHerbivoreColors.SkinPalleteSection4.allowedValues : allowedCarnivoreColors.SkinPalleteSection4.allowedValues)
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
            .setPlaceholder(`Select Body 2 Page ${i + 1}/${split.length}`)
            .addOptions(split[i]),
          )
      );
    } 

		
		const message = await interaction.reply({ content: `<@${interaction.user.id}>, select your body 2 skin from the list below!`, components: rows, fetchReply: true, ephemeral: true,  });
    await GrowDinoRequest.update({messageId: message.id}, {where: {id: existingRequest.id}});
  }

  async pickSkinPallete5(interaction, userId, value, client){
    let existingRequest = await GrowDinoRequest.findOne({where: {step: 8, UserId: userId, isComplete: false}});
    if(value && existingRequest){
      await GrowDinoRequest.update({isComplete: true, value,},{where: {UserId: userId, id: existingRequest.dataValues.id}});
      return;
    }

    if(!existingRequest){
      existingRequest = await new GrowDinoRequest({step: 8, isComplete: false, UserId: userId}).save();
    }
    const pickedDino = await GrowDinoRequest.findOne({where: {UserId: userId, step: 2}, order: [['id', 'desc']]});
    const isHerbivore = dinoData[pickedDino.dataValues.value].diet === 'Herbivore';
		const selectOptions = (isHerbivore ? allowedHerbivoreColors.SkinPalleteSection5.allowedValues : allowedCarnivoreColors.SkinPalleteSection5.allowedValues)
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
            .setPlaceholder(`Select Body 3 Page ${i + 1}/${split.length}`)
            .addOptions(split[i]),
          )
      );
    } 

		const message = await interaction.reply({ content: `<@${interaction.user.id}>, select your body 3 skin from the list below!`, components: rows, fetchReply: true, ephemeral: true,  });
    await GrowDinoRequest.update({messageId: message.id}, {where: {id: existingRequest.id}});
  }

  async pickGender(interaction, userId, value, client){
    let existingRequest = await GrowDinoRequest.findOne({where: {step: 3, UserId: userId, isComplete: false}});
    if(value && existingRequest){
      await GrowDinoRequest.update({isComplete: true, value,},{where: {UserId: userId, id: existingRequest.dataValues.id}});
      return;
    }

    if(!existingRequest){
      existingRequest = await new GrowDinoRequest({step: 3, isComplete: false, UserId: userId}).save();
    }

    const row = new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId(`DinoInjection`)
            .setPlaceholder('Select Gender')
            .addOptions({
              label: 'Male',
              description: `Gender: Male`,
              value: `Male`
            },
            {
              label: 'Female',
              description: `Gender: Female`,
              value: `Female`
            }),
          );

		const message = await interaction.reply({ content: `<@${interaction.user.id}>, select your gender from the list below!`, components: [row], fetchReply: true, ephemeral: true,  });
    await GrowDinoRequest.update({messageId: message.id}, {where: {id: existingRequest.id}});
  }

  async finalize(interaction, userId, value, client){
    const user = await User.findOne({where: {discordId: interaction.user.id}});
    const fileStore = new IslePlayerDatabase(playerDatabase);
    const doesPlayerFileExist = await fileStore.doesPlayerFileExist(user.steamId);
    let existingRequest = await GrowDinoRequest.findOne({where: {step: 9, UserId: userId, isComplete: false}, order: [['id', 'desc']]});
    if(value && existingRequest){
      if(value === 'slay'){
        await fileStore.slayAndInject();
      }
      if(value === 'vault'){
        console.log(this)

        const dino = await GrowDinoRequest.findOne({where: {step: 2, isComplete: true}, order: [['id', 'desc']]});
        await fileStore.vaultAndInject(dino.dataValues.value, user.id);
      }
      await interaction.reply(`<@${interaction.user.id}> your dino has succesfully been injected! Enjoy, and let any staff know if you have any issues!`);
      return await GrowDinoRequest.update({isComplete: true, value: value}, {where: {step: 9, UserId: userId, isComplete: false}});
    }

    if(!existingRequest){
      existingRequest = await new GrowDinoRequest({step: 9, isComplete: false, UserId: userId}).save();
    }

    if(existingRequest.isComplete) return;

    if(doesPlayerFileExist){
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
                value: 'vault',
              },
            ]),
        );

      const message = await interaction.reply({ content: `<@${interaction.user.id}>, would you like to:`, components: [row], fetchReply: true, ephemeral: true,  });
      return await GrowDinoRequest.update({messageId: message.id}, {where: {id: existingRequest.id}});
    }

    await interaction.reply({content: `<@${interaction.user.id}>, your dino has been injected!`, ephemeral: true});
    await GrowDinoRequest.update({isComplete: true, value: 'Non-Existing'}, {where: {step: 9, UserId: userId, isComplete: false}});
  }
}