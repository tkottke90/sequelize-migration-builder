const Sequelize = require('sequelize/lib/data-types');

module.exports = class FieldBuilder {
  state = {};


  /**
   * Sets the type of a column as a boolean
   * @returns {FieldBuilder} The builder instance
   */
  boolean() {
    Object.assign(this.state, { type: Sequelize.BOOLEAN });
    return this;
  }

  /**
   * Applies custom configuration to the field
   * @param {Record<string, any>} input 
   */
  customInput(input) {
    if (typeof input !== 'object') {
      throw new Error('Invalid custom input');
    }

    Object.assign(this.state, input);

    return this;
  }

  /**
   * Sets the type of a column as a date
   * @returns {FieldBuilder} The builder instance 
   */
  date() {
    Object.assign(this.state, { type: Sequelize.DATE });
    return this;
  }

  /**
   * 
   * @param {*} value The value to be applied to new records if none is provided
   * @returns {FieldBuilder} The builder instance 
   */
  defaultValue(value) {
    if (value === undefined) {
      throw new Error('Default value must be defined')
    }

    Object.assign(this.state, { default: value });
    return this;
  }

  /**
   * Applies the STRING type and email validation flag to the column
   * @returns {FieldBuilder} The builder instance
   */
  email() {
    Object.assign(this.state, {
      type: Sequelize.STRING
    });

    const validate = {
      isEmail: true,
    };

    if (this.state.validate) {
      Object.assign(this.state.validate, validate);
    } else {
      Object.assign(this.state, { validate });
    }

    return this;
  }

  /**
   * Applies the ENUM type and email validation flag to the column
   * @param {string[]} options List of valid string options 
   * @returns {FieldBuilder} The builder instance
   */
  enum(...options) {
    const values = options.flat();

    if (!values.length) {
      throw new Error('Enums cannot be empty');
    }

    Object.assign(this.state, {
      type: Sequelize.ENUM,
      values,
    });
    return this;
  }

  /**
   * Creates a foreign key constraint in the database associating the current table with the targeted table on this column and the column targeted by the key
   * @param {string} model Name of the model to be targeted 
   * @param {string} [key="id"] The column in the target table that is associated with this field 
   * @returns {FieldBuilder} The builder instance
   */
  foreignKey(model, key = 'id') {
    if (!model || typeof model !== 'string') {
      throw new Error('A model name must be provided for a foreign key constraint');
    }

    Object.assign(this.state, {
      type: Sequelize.INTEGER,
      references: {
        model: {
          tableName: model
        },
        key
      }
    });
    return this;
  }

  /**
   * Sets the field type as `JSON` and assigns a default value
   * @param {Record<string, any>} [defaultValue={}] Default value to be assigned to fields 
   * @returns {FieldBuilder} The builder instance 
   */
  json(defaultValue = {}) {

    if (typeof defaultValue !== 'object') {
      throw new Error('Default value must be an object');
    }

    Object.assign(this.state, {
      type: Sequelize.JSON,
      default: defaultValue
    });
    return this;
  }

  /**
   * Sets the validation on a field to require that the input be "not empty"
   * @returns {FieldBuilder} The builder instance 
   */
  nonEmptyString() {
    if (this.state.validate) {
      Object.assign(this.state.validate, { notEmpty: true });
    } else {
      Object.assign(this.state, { validate: { notEmpty: true } });
    }

    return this;
  }

  /**
   * Sets the type of the column to `Sequelize.FLOAT`
   * @param { 'bigint' | 'double' | 'float' | 'integer' | 'smallint'} [typeSelection] The type of integer
   * @returns {FieldBuilder} The builder instance 
   */
  number(typeSelection = 'integer') {
    const typeMap = {
      'bigint': Sequelize.BIGINT,
      'double': Sequelize.DOUBLE,
      'float': Sequelize.FLOAT,
      'integer': Sequelize.INTEGER,
      'smallint': Sequelize.SMALLINT
    }

    const type = typeMap[typeSelection] ?? typeMap.integer;

    Object.assign(this.state, { type });
    return this;
  }

  /**
     * Marks a column as accepting a value or NULL
     * @returns {FieldBuilder} The builder instance
     */
  optional() {
    Object.assign(this.state, { allowNull: true });
    return this;
  }

  /**
   * Returns a serialized object of all of the instances options.  
   * @returns 
   */
  output() {
    return this.state;
  }

  /**
   * Sets the field with the primary key configurations
   * @returns {FieldBuilder} The builder instance 
   */
  primaryKey() {
    Object.assign(this.state, {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    });
    return this;
  }

  /**
   * Marks a column as requiring a value
   * @returns {FieldBuilder} The builder instance
   */
   required() {
    Object.assign(this.state, { allowNull: false });
    return this;
  }

  /**
   * A map of generic columns that can be added to an existing 
   * @returns {{ active: {}, created_at: {}, updated_at: {} }} An object with pre-built columns
   */
  static statusColumns() {
    return {
      active: new FieldBuilder().boolean().required().output(),
      created_at: new FieldBuilder().date().required().output(),
      updated_at: new FieldBuilder().date().required().output(),
    }
  }

  string() {
    Object.assign(this.state, {
      type: Sequelize.STRING,
      default: "",
    });
    return this;
  }

  text() {
    Object.assign(this.state, {
      type: Sequelize.TEXT,
      default: "",
    });
    return this;
  }

  /**
   * Applies the unique constraint to the field
   * @param {string} [constraintName] 
   */
  unique(constraintName) {
    if (constraintName && typeof constraintName !== 'string') {
      throw new Error('Named constraints must be a string')
    }
    
    Object.assign(this.state, {
      unique: constraintName || true
    });

    return this;
  }
}