# Sequelize Migration Builder

![Tests](https://github.com/tkottke90/sequelize-migration-builder/actions/workflows/node.js.svg?branch=main)

This small module is designed to make Sequelize migrations files easier to manage by abstracting away boilerplate code that is used repeatedly and providing a builder object to construct the configuration.

```js
// Manual Sequelize Migration

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users')
  }
}
```

```js
// Sequelize Builder

const FieldBuilder = require('./utils/migration.utils');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: new FieldBuilder().primaryKey().output(),

      firstName: new FieldBuilder()
        .stringColumn()
        .allowNull()
        .output(),

      lastName: new FieldBuilder()
        .stringColumn()
        .allowNull()
        .output(),

      email: new FieldBuilder()
        .emailColumn()
        .allowNull()
        .unique()
        .output()

      password: new FieldBuilder()
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
```

## Installation

The module is available via either directly targeting the github repository in your `package.json` or by setting up a _custom registery_ using the `.npmrc` file.

## Github

If you are going to install the github repository directly, you can use the following command:

```bash
npm install --save-dev https://github.com/tkottke90/sequelize-migration-builder
```

## NPM

The module is hosted in Github Packages.  To install using npm, first you will need to create a _Personal Access Token_ which will be used by npm to authenticate to Github and download the package.

You can create a token by following the [Github Documentation](https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).  When creating the token you will specifically need to include the `read:packages` permission which allows the token to be used to download from Github.


Next you will need to create a `.npmrc` file in your project, add your personal access token and define the where Github can find the module:

```bash
echo "//npm.pkg.github.com/:_authToken=<Personal Access Token>" >> /.npmrc
echo "@tkottke90:registry=https://npm.pkg.github.com\n" >> .npmrc
```

This will let NPM know that when you are looking for packages in the `@tkottke90` scope, to look in github packages instead of in NPM.  Then install the module using NPM:

```bash
npm install --save-dev @tkottke90/sequelize-migration-builder@1.0.0
```

## Usage

To use the module, simply import it into your migration files.  You can then create a new instance of the builder for each column you wish to add:

```js
// Sequelize Builder

const FieldBuilder = require('./utils/migration.utils');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: new FieldBuilder().primaryKey().output(),

      firstName: new FieldBuilder()
        .stringColumn()
        .allowNull()
        .output(),
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
```

At the core each column should instantiate a new instance of the `FieldBuilder` class.

```js
firstName: new FieldBuilder()
```

Once you have the class, you will have access to all the functions available to that class (see docs below for full list). For example, calling the `stringColumn()` and `allowNull()` will add the `Sequelize.STRING` type and set the `allowNull` property to false which results in a required string field:

```js
firstName: new FieldBuilder()
  .stringColumn()
  .allowNull()
```

Finally, the last function you will need to call is `output()`, which will output a JSON object based on state of the builder:

```js
firstName: new FieldBuilder()
  .stringColumn()
  .allowNull()
  .output()


// Output:
firstName: {
  type: Sequelize.STRING
  default: "",
  allowNull: false
}

```

## Implementation Notes

Under the hood the main action being taken by the builder is to use `Object.assign` to update the internal state of the instance.  For this reason, the order of your functions can be important.

## Motivation

I found it tedious to have to manage Sequelize migration implementation by hand since many of the column configurations used the exact same objects in the end.  Additionally I wanted to explore the [builder pattern](https://refactoring.guru/design-patterns/builder) on a small scale to better understand it's implementation.  I was especially interested in the a la carte style function chaining allowing the developer using the module to build something up by calling specific methods.  I have seen this pattern used in other modules like [Joi](https://www.npmjs.com/package/joi) and [MomentJS](https://www.npmjs.com/package/moment) which inspired the investigation.

## Column Type Functions

The following functions configure a column by setting the `type` property on the column.  Some functions will set additional supporting properties such as the `enumColumn` function which will populate an array of accepted values.

### Boolean Column

Marks a column for storing boolean values.

Usage: `FieldBuilder.booleanColumn()`

Example:
```js
field: FieldBuilder.booleanColumn().output();

// Output
// field: {
//   type: Sequelize.BOOLEAN
// }
```

### Date Column

Marks a column for storing date values.  Note that this is the simplest date option provided by Sequelize.  Other date based types can be found in their [documentation](https://sequelize.org/docs/v7/other-topics/other-data-types/#dates).

Usage: `FieldBuilder.dateColumn()`

Example:
```js
field: FieldBuilder.booleanColumn().output();

// Output
// field: {
//   type: Sequelize.DATE
// }
```

### Email Column

Marks the column as a string _and_ assigns the `isEmail` validation condition.  This is one of the many validators provided by sequelize

Usage: `FieldBuilder.emailColumn()`

Example:
```js
field: FieldBuilder.booleanColumn().output();

// Output
// field: {
//   type: Sequelize.STRING,
//   validate: {
//      isEmail: true,
//    },
//  }
```

### Enum Column *(Postgres, MySQL, MariaDB only)*

Configures a column to accept a set of accepted values.  This is a list of strings either as a list of parameters or as an array of strings.

Usage: `FieldBuilder.enumColumn(...options: string)`

Example:
```js
field: FieldBuilder.enumColumn('pending', 'active', 'complete').output();

// Output
// field: {
//   type: Sequelize.ENUM,
//   values: [ 'pending', 'active', 'complete' ],
//  }
```

```js
const status = ['pending', 'active', 'complete']
field: FieldBuilder.enumColumn(status);

// Output
// field: {
//   type: Sequelize.ENUM,
//   values: [ 'pending', 'active', 'complete' ],
//  }
```

### Foreign Key Column

Creates a foreign key constraint to tie this column to the key of another table.  

Usage: `FieldBuilder.foreignKey(model: string, key?: string)`

Example:
```js
// Ties this table to another table called `Addresses`

field: FieldBuilder.foreignKey('Addresses').output();

// Output
// field: {
//    type: Sequelize.INTEGER
//    references: {
//      model: {
//        tableName: 'Addresses'
//      }
//      key: 'id'
//    }
//  }
```

```js
// Ties this table to another table called `Users_Addresses` on the column named `userId`

field: FieldBuilder.foreignKey('Users_Addresses', 'userId);

// Output
// field: {
//    type: Sequelize.INTEGER
//    references: {
//      model: {
//        tableName: 'Addresses'
//      }
//      key: 'userId'
//    }
//  }
```

### JSON Column *(Postgres, MySQL, MariaDB only)*

Marks a column for storing JSON data.  Full details can be found in the [documentation](https://sequelize.org/docs/v6/other-topics/other-data-types/#json-sqlite-mysql-mariadb-and-postgresql-only).

Usage: `FieldBuilder.jsonColumn(defaultValue?: Record<string,any>)`

Example:
```js
field: FieldBuilder.jsonColumn().output();

// Output
// field: {
//   type: Sequelize.JSON
//   default: {}
// }
```

### Number Column

Marks a column for storing float values.

Usage: `FieldBuilder.numberColumn()`

Example:
```js
field: FieldBuilder.numberColumn().output();

// Output
// field: {
//   type: Sequelize.FLOAT
// }
```

### Primary Key Column

Configures the column as the primary key for the record.  This includes setting the auto increment flag and identifying the column as the primary key.

Usage: `FieldBuilder.primaryKey()`

Example:
```js
field: FieldBuilder.numberColumn().output();

// Output
// field: {
//    allowNull: false,
//    autoIncrement: true,
//    primaryKey: true,
//    type: Sequelize.INTEGER,
//  }
```

### String Column

Marks a column for storing smaller strings.  Per the [documentation](https://sequelize.org/docs/v7/other-topics/other-data-types/#strings), Sequelize will create a `VARCHAR` type with a 255 character max.

Usage: `FieldBuilder.stringColumn()`

Example:
```js
field: FieldBuilder.stringColumn().output();

// Output
// field: {
//   type: Sequelize.STRING
// }
```

### Text Column

Marks a column for storing larger strings.  Depending on your database, Sequelize will use that flavor syntax to generate the field.  The max size will depend on the database and it is recommended that you review the [documentation](https://sequelize.org/docs/v7/other-topics/other-data-types/#strings).

Usage: `FieldBuilder.textColumn()`

Example:
```js
field: FieldBuilder.textColumn().output();

// Output
// field: {
//   type: Sequelize.TEXT
// }
```

## Modifier Functions

The following functions are available on the FieldBuilder class instance and will apply specific configurations to the field

### Custom Input

Allows for custom configuration not provided by this tool.  This function will throw an error if you attempt to pass a non-object.

Usage: `FieldBuilder.customInput(input: Record<string, any>)`

Example:
```js
// Add a JSONB field to a PostgreSQL table

FieldBuilder.customInput({ type: Sequelize.JSONB });

// Output
// {
//   type: Sequelize.JSONB
// }
```

```js
// Invalid: Passing a non-object

FieldBuilder.customInput(true);

// Output
// Error: Invalid custom input
```

### Default Value

Configures a default value for the field.  Note that this is not type checked against the fields `type` value.

Usage: `FieldBuilder.defaultValue(value: string)`

Example:
```js
// Set default value on a string column to `None`

FieldBuilder
  .stringColumn()
  .defaultValue('None');

// Output
// {
//   type: Sequelize.JSONB
// }
```

```js
// Invalid: Parameter-less call

FieldBuilder.defaultValue();

// Output
// Error: Default value must be defined
```

### Non-Empty String

Adds the `notEmpty` validation flag to the fields validate configuration.

Usage: `FieldBuilder.nonEmptyString()`

Example:
```js
field: new FieldBuilder().nonEmptyString().output();

// Output
// field: {
//  validate: {
//    notEmpty: true
//  }
// }
```

### Optional Column

Sets the field as allowing NULL as a value.  Depending on your SQL dialect, you may or may not need this.  Check your dialect documentation for more details.

Example:
```js
field: new FieldBuilder().optional().output();

// Output
// field: {
//  allowNull: true
// }
```

### Required Column

Sets the field as requiring a non-null value.  Depending on your SQL dialect, you may or may not need this.  Check your dialect documentation for more details.

Example:
```js
field: new FieldBuilder().required().output();

// Output
// field: {
//  allowNull: false
// }
```

### Status Columns

This is a special static method that I have added to the builder to further remove the boilerplate of having to setup tables. In each of my tables I have included an _active_, _created\_at_, and _updated\_at_ columns. This method can be used to apply those columns to your table if you would like.

Usage: `FieldBuilder.statusColumns()`

Example:
```js
up(queryInstance, Sequelize) {
  await queryInterface.createTable('Users', {
    id: new FieldBuilder().primaryKey().output();

    ...FieldBuilder.statusColumns()
  });
}

// Output:
//  {
//    id: {
//      allowNull: false,
//      autoIncrement: true,
//      primaryKey: true,
//      type: Sequelize.INTEGER,
//    },
//    active: { type: Sequelize.BOOLEAN },
//    created_at: { type: Sequelize.DATE },
//    updated_at: { type: Sequelize.DATE }
//  }
```

If you wish to rename the columns, you an do so using normal Javascript techniques like destructuring:

```js
const { active, created_at, updated_at } = FieldBuilder.statusColumns();


up(queryInstance, Sequelize) {
  await queryInterface.createTable('Users', {
    id: new FieldBuilder().primaryKey().output();

    createdTimestamp: created_at,
    updatedTimestamp: updated_at
  });
}
```

### Unique

The _unique_ operator allows you to identify a column as unique to the table.  This will be set as a constraint in your SQL database and will be enforced by the database.

There are 2 forms of uniqueness.  The first one is column level uniqueness.  To implement column level uniqueness, simply call the `unique` function:

```js

field: new FieldBuilder().unique().output();

// Output:
//  {
//    unique: true
//  }

```

Alternatively you can create named constraints by passing a string constraint name:

```js
field: new FieldBuilder().unique('user_info').output();

// Output:
//  {
//    unique: 'user_info'
//  }
```

Named constraints can come in handy when you are building out tables that require that multiple pieces of information are unique in conjunction with each other:

```js
up(queryInstance, Sequelize) {
  await queryInterface.createTable('Users', {
    id: new FieldBuilder().primaryKey().output();

    name: new FieldBuilder().stringColumn().unique('user_info').output()
    email: new FieldBuilder().emailColumn().unique('user_info')
  });
}

// Output
// {
//   id: {
//     allowNull: false,
//     autoIncrement: true,
//     primaryKey: true,
//     type: Sequelize.INTEGER,
//   },
//   name: {
//     type: Sequelize.STRING,
//     default: '',
//     unique: 'user_info'
//   },
//   email: {
//     type: Sequelize.STRING,
//     validate: {
//       isEmail: true
//     },
//     unique: 'user_info'
//   }
// }
```

## Feedback

If you have feedback, don't hesitate to open an issue and I will get to it when I have time.