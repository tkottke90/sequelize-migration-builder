const expect = require('chai').expect;
const Sequelize = require('sequelize/lib/data-types');
const FieldBuilder = require('../index');

describe('FieldBuilder', () => {

  it('should create a new FieldBuilder instance', () => {
    expect(new FieldBuilder()).to.be.instanceOf(FieldBuilder);
  });

  describe('#booleanColumn', () => {
    it('should set the type of the field as `Sequelize.BOOLEAN`', () => {
      const builder = new FieldBuilder();

      expect(builder.boolean())
        .to.deep.eq({ type: Sequelize.BOOLEAN })
    })
  });

  describe('#customInput', () => {
    it('should accept an Record with any configuration', () => {
      const builder = new FieldBuilder();
      const customConfig = { type: Sequelize.JSONB }

      expect(builder.customInput(customConfig))
        .to.deep.eq(customConfig);
    });

    it('should reject an input that is not an object', () => {
      const builder = new FieldBuilder();

      expect(builder.customInput).to.throw('Invalid custom input', true);
      expect(builder.customInput).to.throw('Invalid custom input', 10);
      expect(builder.customInput).to.throw('Invalid custom input', 'test');
    });
  });

  describe('#dateColumn', () => {
    it('should set the type of the field as `Sequelize.DATE`', () => {
      const builder = new FieldBuilder();

      expect(builder.date())
        .to.deep.eq({ type: Sequelize.DATE })
    })
  });

  describe('#defaultValue', () => {
    it('should set the `defaultValue` to the provided input', () => {
      const builder = new FieldBuilder();

      expect(builder.defaultValue('N/A'))
        .to.deep.eq({ default: 'N/A' });
    });

    it('should throw an error if input value is undefined', () => {
      const builder = new FieldBuilder();

      expect(builder.defaultValue).to.throw('Default value must be defined', undefined);
    });
  });

  describe('#emailColumn', () => {
    it('should set the type of the field as `Sequelize.STRING` and the email validation', () => {
      const builder = new FieldBuilder();

      expect(builder.email())
        .to.deep.eq({ type: Sequelize.STRING, validate: { isEmail: true } });
    });

    it('should append to the validate object when one already exists', () => {
      const builder = new FieldBuilder();

      expect(builder.nonEmptyString().email())
        .to.deep.eq({ type: Sequelize.STRING, validate: { notEmpty: true, isEmail: true } });
    });
  });

  describe('#enumColumn', () => {
    it('should accept a list of params and apply them', () => {
      const builder = new FieldBuilder();

      expect(builder.enum('pending', 'active', 'complete'))
        .to.deep.eq({ type: Sequelize.ENUM, values: [ 'pending', 'active', 'complete' ] });
    });

    it('should accept arrays', () => {
      const builder = new FieldBuilder();
      const statusArray = ['pending', 'active', 'complete'];

      expect(builder.enum(statusArray))
        .to.deep.eq({ type: Sequelize.ENUM, values: [ 'pending', 'active', 'complete' ] });
    });

    it('should throw an error if there are no items', () => {
      const builder = new FieldBuilder();

      expect(builder.enum).to.throw('Enums cannot be empty', []);
    });
  });

  describe('#foreignKey', () => {
    it('should accept a single parameter with the table name', () => {
      const builder = new FieldBuilder();

      expect(builder.foreignKey('Addresses'))
        .to.deep.eq({
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Addresses'
            },
            key: 'id'
          }
        })
    });

    it('should throw an error when model is not provided', () => {
      const builder = new FieldBuilder();

      expect(builder.foreignKey).to.throw('A model name must be provided for a foreign key constraint', undefined);
      expect(builder.foreignKey).to.throw('A model name must be provided for a foreign key constraint', null);
      expect(builder.foreignKey).to.throw('A model name must be provided for a foreign key constraint', 0);
    });

    it('should accept 2 parameters for the table name and target column', () => {
      const builder = new FieldBuilder();

      expect(builder.foreignKey('User_Addresses', 'userId'))
        .to.deep.eq({
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'User_Addresses'
            },
            key: 'userId'
          }
        })
    });

  });

  describe('#jsonColumn', () => {
    it('should set the type of the field as `Sequelize.JSON`', () => {
      const builder = new FieldBuilder();

      expect(builder.json())
        .to.deep.eq({ type: Sequelize.JSON, default: {} });
    });

    it('should throw an error if provided with a non-object', () => {
      const builder = new FieldBuilder();

      try {
        builder.json('default')
      } catch (error) {
        expect(error.message).to.be.eq('Default value must be an object');
      }

      try {
        builder.json(0)
      } catch (error) {
        expect(error.message).to.be.eq('Default value must be an object');
      }

      try {
        builder.json()
      } catch (error) {
        expect(error.message).to.be.eq('Default value must be an object');
      }

      try {
        builder.json(null)
      } catch (error) {
        expect(error.message).to.be.eq('Default value must be an object');
      }

    });
  });

  describe('#nonEmptyString', () => {
    it('should set `notEmpty` validator flag to true', () => {
      const builder = new FieldBuilder();

      expect(builder.nonEmptyString())
        .to.deep.eq({ validate: { notEmpty: true } });
    });

    it('should append to the validate object when one already exists', () => {
      const builder = new FieldBuilder();

      expect(builder.email().nonEmptyString())
        .to.deep.eq({ type: Sequelize.STRING, validate: { notEmpty: true, isEmail: true } });
    });
  });

  describe('#numberColumn', () => {
    it('should set the type of the field as `Sequelize.INTEGER`', () => {
      const builder = new FieldBuilder();

      expect(builder.number())
        .to.deep.eq({ type: Sequelize.INTEGER })
    });

    it('should set the type of the field as `Sequelize.BIGINT`', () => {
      const builder = new FieldBuilder();

      expect(builder.number('bigint'))
        .to.deep.eq({ type: Sequelize.BIGINT })
    });

    it('should set the type of the field as `Sequelize.DOUBLE`', () => {
      const builder = new FieldBuilder();

      expect(builder.number('double'))
        .to.deep.eq({ type: Sequelize.DOUBLE })
    });
    
    it('should set the type of the field as `Sequelize.FLOAT`', () => {
      const builder = new FieldBuilder();

      expect(builder.number('float'))
        .to.deep.eq({ type: Sequelize.FLOAT })
    });

    it('should set the type of the field as `Sequelize.INTEGER`', () => {
      const builder = new FieldBuilder();

      expect(builder.number('integer'))
        .to.deep.eq({ type: Sequelize.INTEGER })
    });

    it('should set the type of the field as `Sequelize.smallint`', () => {
      const builder = new FieldBuilder();

      expect(builder.number('smallint'))
        .to.deep.eq({ type: Sequelize.SMALLINT })
    });
    
  });

  describe('#optional', () => {
    it('should configure the field to allow NULL', () => {
      const falsyBuilder = new FieldBuilder();

      const falsyField = falsyBuilder.optional();


      expect(falsyField).to.deep.eq({ allowNull: true })
    });

  });

  describe('#primaryKey', () => {
    it('should provide the primary key configurations', () => {
      const builder = new FieldBuilder();

      expect(builder.primaryKey())
        .to.deep.eq({ type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true })
    })
  });

  describe('#required', () => {
    it('should configure the field to NOT allow NULL', () => {
      const falsyBuilder = new FieldBuilder();

      const falsyField = falsyBuilder.required();


      expect(falsyField).to.deep.eq({ allowNull: false })
    });

  });

  describe('#statusColumns', () => {
    it('should return an object with a `active`, `created_at`, and `updated_at` properties', () => {
      const statusColumns = FieldBuilder.statusColumns();

      expect(statusColumns.active).to.exist;
      expect(statusColumns.created_at).to.exist;
      expect(statusColumns.updated_at).to.exist;
    })
  });

  describe('#stringColumn', () => {
    it('should set the type of the field as `Sequelize.STRING`', () => {
      const builder = new FieldBuilder();

      expect(builder.string())
        .to.deep.eq({ type: Sequelize.STRING, default: "" })
    })
  });

  describe('#textColumn', () => {
    it('should set the type of the field as `Sequelize.TEXT`', () => {
      const builder = new FieldBuilder();

      expect(builder.text())
        .to.deep.eq({ type: Sequelize.TEXT, default: "" })
    })
  });

  describe('#unique', () => {
    it('should set the unique flag to true', () => {
      const builder = new FieldBuilder();

      expect(builder.unique())
        .to.deep.eq({ unique: true })
    })

    it('should set the unique flag to the input value', () => {
      const builder = new FieldBuilder();

      expect(builder.unique('user_info'))
        .to.deep.eq({ unique: 'user_info' })
    })

    it('should throw an error if a value other than a string is passed', () => {
      const builder = new FieldBuilder();

      try {
        builder.unique(10);
      } catch (error) {
        expect(error.message).to.eq('Named constraints must be a string');
      }
    });
  });
});