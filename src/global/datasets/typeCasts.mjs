export default (obj, schema) => {
  return Object.entries(obj)
    .map(([key, value]) => {
      switch(schema[key].type) {
        case 'number': return [key, Number(value)];
        case 'string': return [key, String(value)];
        case 'boolean': return [key, value === 'true'];
        default: return [key, value];
      }
    })
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {} );
};
