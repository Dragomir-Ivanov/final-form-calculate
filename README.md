# 🏁 Final Form Calculate

[![NPM Version](https://img.shields.io/npm/v/final-form-calculate.svg?style=flat)](https://www.npmjs.com/package/final-form-calculate)
[![NPM Downloads](https://img.shields.io/npm/dm/final-form-calculate.svg?style=flat)](https://www.npmjs.com/package/final-form-calculate)
[![Build Status](https://travis-ci.org/final-form/final-form-calculate.svg?branch=master)](https://travis-ci.org/final-form/final-form-calculate)
[![codecov.io](https://codecov.io/gh/final-form/final-form-calculate/branch/master/graph/badge.svg)](https://codecov.io/gh/final-form/final-form-calculate)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Decorator for [🏁 Final Form](https://github.com/final-form/final-form) that
allows you to define calculations that happen between fields, i.e. "When field X
changes, update field Y."

---

## Installation

```bash
npm install --save final-form-calculate
```

or

```bash
yarn add final-form-calculate
```

## Usage

```js
import { createForm, getIn } from 'final-form'
import createDecorator from 'final-form-calculate'

// Create Form
const form = createForm({ onSubmit })

// Create Decorator
const decorator = createDecorator(
  // Calculations:
  {
    field: 'foo', // when the value of foo changes...
    updates: {
      // ...set field "doubleFoo" to twice the value of foo
      doubleFoo: (fooValue, allValues) => fooValue * 2
    }
  },
  {
    field: 'bar', // when the value of bar changes...
    updates: {
      // ...set field "foo" to previous value of bar
      foo: (fooValue, allValues, prevValues) => prevValues.bar
    }
  },
  {
    field: /items\[\d+\]/, // when a field matching this pattern changes...
    updates: {
      // ...sets field "total" to the sum of all items
      total: (itemValue, allValues) =>
        (allValues.items || []).reduce((sum, value) => sum + value, 0)
    }
  },
  {
    field: 'foo', // when the value of foo changes...
    updates: {
      // ...asynchronously set field "doubleFoo" to twice the value using a promise
      doubleFoo: (fooValue, allValues) =>
        new Promise(resolve => {
          setTimeout(() => resolve(fooValue * 2), 100)
        })
    }
  },
  {
    field: /\.timeFrom/, // when a deeper field matching this pattern changes...
    updates: (value, name, allValues) => {
      const toField = name.replace('timeFrom', 'timeTo')
      const toValue = getIn(allValues, toField)
      if (toValue && value > toValue) {
        return {
          [toField]: value
        }
      }

      return {}
    }
  }
)

// Decorate form
const undecorate = decorator(form)

// Use form as normal
```

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Example](#example)
  - [Calculated Fields Example](#calculated-fields-example)
- [API](#api)
  - [`createDecorator: (...calculations: Calculation[]) => Decorator`](#createdecorator-calculations-calculation--decorator)
- [Types](#types)
  - [`Calculation: { field: FieldPattern, updates: Updates }`](#calculation--field-fieldpattern-updates-updates-)
  - [`FieldName: string`](#fieldname-string)
  - [`FieldPattern: FieldName | RegExp`](#fieldpattern-fieldname--regexp)
  - [`Updates: { [FieldName]: (value: any, allValues: Object, prevValues: Object, setHints: Hints) => any }`](#updates--fieldname-value-any-allvalues-object--any-)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Example

### [Calculated Fields Example](https://codesandbox.io/s/oq52p6v96y)

Example using
[🏁 React Final Form](https://github.com/final-form/react-final-form#-react-final-form).

## API

### `createDecorator: (...calculations: Calculation[]) => Decorator`

A function that takes a set of calculations and returns a 🏁 Final Form
[`Decorator`](https://github.com/final-form/final-form#decorator-form-formapi--unsubscribe).

## Types

### `Calculation: { field: FieldPattern, isEqual?: (any, any) => boolean, updates: Updates }`

A calculation to perform, with an optional `isEqual` predicate to determine if a value has really changed (defaults to `===`).

### `FieldName: string`

### `FieldPattern: FieldName | RegExp | (FieldName | RegExp)[]`

A pattern to match a field with.

### `Updates: UpdatesByName | UpdatesForAll`

Either an object of updater functions or a function that generates updates for multiple fields.

### `UpdatesByName: { [FieldName]: (value: any, allValues: Object, prevValues: Object) => Promise | any }`

Updater functions for each calculated field.

### `UpdatesForAll: (value: any, field: string, allValues: Object, prevValues: Object, setHints: {skipNextUpdate: boolean}) => Promise | { [FieldName]: any }`

Takes the value and name of the field that just changed, as well as all the values, and returns an object of fields and new values.

With `setHints`, you can instruct `final-form-calculate` to skip calling next `Updates` cycle.
You can do that with `skipHints({skipNextUpdate: true})` in your `updates` handler.

The reason behind this feature is, in certain scenarious you may have closed loops of fields dependency. E.g. field `foo` updates field `bar`, and field `bar` updates field `foo`. 
This will result in infinite loop of updates. By calling this function selectively in the body of `updates`, `foo` will update `bar`, but updates on next update cycle will not be called, so `bar` will not update foo.

When using this, make sure you `update` all fields that are dependant on the current field, even if they are recursive dependency.

Example:
```
{
  field: "foo",
  updates: {
    bar: "foo updated me",
  }
},{
  field: "bar",
  updates: {
    baz: "bar updated me"
  }
}
```

Updates on `foo` indirecly will update `baz` in 2 update cycles.

When using:
```
{
  field: "foo",
  updates: (value, field, allValues, prevValues, setHints) => {
    setHints({ skipNextUpdate: true })
    return {
      bar: "foo updated me",
    }
  }
},{
  field: "bar",
  updates: {
    baz: "bar updated me"
  }
}
```

Updates on `foo` will not trigger update on `baz`. 

In order to make such updates, make them directly from `foo`.
```
{
  field: "foo",
  updates: (value, field, allValues, prevValues, setHints) => {
    setHints({ skipNextUpdate: true })
    return {
      bar: "foo updated me",
      baz: "foo updated me",
    }
  }
},{
  field: "bar",
  updates: {
    baz: "bar updated me"
  }
}
```