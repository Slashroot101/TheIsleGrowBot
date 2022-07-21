process.env.CURRENCY_NAME = 'test';
const balCommand = require('../../src/commands/bal');
const User = require('../../src/model/User');
const UserBank = require('../../src/model/UserBank');
const UserBank = require('../../src/model/UserBank');

describe('bal', () => {
  jest.mock('../../src/model/UserBank');
  it('should return the balance if the user exists', async () => {
    User.findOne = jest.fn().mockReturnValue(Promise.resolve({ id: 1 }));
    UserBank.findOne = jest.fn().mockReturnValue(Promise.resolve({ balance: 100 }));
    const interaction = {
      user: {
        id: '123',
      },
      reply: jest.fn(),
    };
    await balCommand.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith('You have 100 test!');
  });

  it('should return 0 if the user does not exist', async () => {
    User.findOne = jest.fn().mockReturnValue(Promise.resolve({ id: 1 }));
    UserBank.findOne = jest.fn().mockReturnValue(Promise.resolve(null));
    const interaction = {
      user: {
        id: '123',
      },
      reply: jest.fn(),
    };
    await balCommand.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith('You have 0 test!');
  });
});