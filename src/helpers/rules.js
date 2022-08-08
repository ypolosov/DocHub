import datasets from './datasets'

// Выполняет валидаторы и накладывает исключения
export default function (manifest) {
    return new Promise((success, reject) => {
        const validators = (manifest['rules'] || {})["validators"] || {};

        for (const id in validators) {
            const provider = datasets();
            provider.dsResolver = (id) => {
              return {
                subject: (this.manifest.rules.validators || {})[id],
                baseURI: (this.$store.state.sources.find((item) => item.path === `/rules/validators/${id}`) || {}).location
              }
            };

            provider.getData(manifest, validators[id])
                .then((items) => {
                    // eslint-disable-next-line no-debugger
                    debugger;
                    success({
                        id,
                        items
                    });
                }).catch(reject)
        }
    });
}
