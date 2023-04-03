export function mergeMapTester(volume) {
  let unitIsTrue = true;

  if (!volume) {
    unitIsTrue = undefined;
  } else if (typeof volume === 'object' && Object.keys(volume).length) {
    Object.values(volume).forEach((value) => {
      if (!value.length) {
        unitIsTrue = false;
        return;
      }

      value.forEach((component) => {
        if (typeof component !== 'string') {
          unitIsTrue = false;
        }
      });
    });
  } else {
    unitIsTrue = false;
  }


  return unitIsTrue;
}

export function manifestTester(volume) {
  let unitIsTrue = true;

  if (!volume) {
    unitIsTrue = undefined;
  } else if (typeof volume === 'object' && Object.keys(volume).length) {
    Object.values(volume).forEach((value) => {
      if (!value) {
        unitIsTrue = false;
      }
    });
  } else {
    unitIsTrue = false;
  }


  return unitIsTrue;
}

