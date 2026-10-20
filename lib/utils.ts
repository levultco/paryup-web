import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const getRandomIntInRange = (min: number, max: number): number => {
  const minNumber = Math.ceil(min);
  const maxNumber = Math.floor(max);

  return Math.floor(Math.random() * (maxNumber - minNumber + 1) + minNumber);
};

export const getPrizeAdditionalOffset = (itemSize: number, gap: number = 9): number => {
  const itemTotalSize = itemSize + gap;
  const center = itemTotalSize / 2;

  console.log('[OFFSET DEBUG] Center:', center);

  const randomOffset = getRandomIntInRange(-center + 1, center - 1);
  console.log('[OFFSET DEBUG] RandomOffset:', randomOffset);

  return randomOffset;
};


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const isArray = (item: unknown) => Array.isArray(item);

const isObject = (item: unknown) =>
  item !== null && isArray(item) === false && typeof item === 'object';

const isFunction = (item: unknown) => typeof item === 'function';

const isBoolean = (item: unknown) => typeof item === 'boolean';

const hasOwnPrototypeOfToString = (object: object) =>
  object.toString !== Object.prototype.toString;

export const classNames = (...classes: Array<unknown>) => {
  let resultClassName = '';

  const handlePrimitive = (item: unknown, asKey?: string) => {
    const isItemBoolean = isBoolean(item);

    if (!item || isItemBoolean === true) {
      return;
    }

    resultClassName += `${asKey !== undefined ? asKey : item} `;
  };

  const handleObject = (object: object) => {
    const entries = Object.entries(object);

    /* maybe throw it out */
    const hasObjectOwnPrototypeOfToString = hasOwnPrototypeOfToString(object);
    /**/

    entries.forEach(([key, value]) => {
      if (!value) {
        return;
      }

      const isValueFunction = isFunction(value);
      const isToString = key === 'toString';

      if (isValueFunction === true && isToString === false) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        const functionResult = (value as Function)();

        handlePrimitive(functionResult, key);

        return;
      }

      if (isToString === false) {
        resultClassName += `${key} `;
      }
    });

    /* maybe throw it out */
    if (hasObjectOwnPrototypeOfToString === true) {
      const toStringValue = object.toString();

      handlePrimitive(toStringValue);
    }
    /**/
  };

  const handleArray = (array: Array<unknown>) => {
    array.forEach((item) => {
      if (!item || typeof item === 'boolean') {
        return;
      }

      const isItemArray = isArray(item);
      const isItemObject = isObject(item);

      if (isItemArray === true) {
        return handleArray(item as Array<unknown>);
      }

      if (isItemObject === true) {
        return handleObject(item as object);
      }

      resultClassName += `${item} `;
    });
  };

  for (let i = 0; i < classes.length; i += 1) {
    const classNameItem = classes[i];

    const isItemObject = isObject(classNameItem);

    const isItemArray = isArray(classNameItem);

    if (isItemObject === true) {
      handleObject(classNameItem as object);

      continue;
    }

    if (isItemArray === true) {
      handleArray(classNameItem as Array<unknown>);

      continue;
    }

    handlePrimitive(classNameItem);
  }

  return resultClassName.trim();
};



export const getPrizeOffset = (
  itemSize: number,
  prizeIndex: number,
  containerCenter: number,
) => itemSize * prizeIndex - (containerCenter - itemSize / 2);

export const reproductionArray = (array = [], length = 0) => [
  ...Array(length)
    .fill('_')
    .map(() => array[Math.floor(Math.random() * array.length)]),
];

export function random(min: number, max: number) {
  const random = Math.random()
  min = Math.round(min)
  max = Math.floor(max)

  return random * (max - min) + min
}