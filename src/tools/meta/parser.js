module.exports = {
    data: [],
    context: {},
    // Определяет идентификатор контекста по идентификатору компонента
    getContextIDByComponentID (id) {
        const structID = id.split('.');
        return structID.slice(0, structID.length - 1).join('.');
    },
    // Преобразование GUID в ключ
    guidToKey(guid) {
        return guid.replace(/-/g, '_');
    },
    // Создает строку размещения контекста
    makeContextLocation(id) {
        const currID = [];
        const location = [];
        id.split('.').map((part) => {
            currID.push(part);
            const context = this.context.contexts[currID.join('.')];
            location.push(context.title || part);
        });
        return location.join('/');
    },
    // Поиск идентификатора по GUID
    searchElement(guid) {
        let result = null;
        for (const index in this.data.digitalArchitecture) {
            const element = this.data.digitalArchitecture[index];
            if (element.guid === guid) {
                result = element;
                break;
            }
        }
        return result;
    },
    // Создать структурированный идентификатор
    makeDeepID (id) {
        let result = [id];
        let element = this.searchElement(id);
        while (element && element.parentGuid) {
            result.unshift(element.parentGuid);
            element = this.searchElement(element.parentGuid);
        }
        const root = this.searchElement(result[0]);
        if (root && root.centralizationLevel)
            result.unshift(root.centralizationLevel);
        result.unshift('SBER');
        for (let i = 0; i < result.length; i ++) {
            result[i] = this.guidToKey(result[i]);
        }
        return result.join('.');
    },
    parseDefaultSystemFields(element) {
        const result = {
            title: element.name,
            guid: element.guid,
            type: 'type: Целевая, внедрено полностью',
            status: element.status,
            statusC3: element.statusC3,
            criticality: element.criticality,
            targetStatus: element.targetStatus,
            targetReadiness: element.targetReadiness,
            systemType: element.systemType,
            nicknameEng: element.nicknameEng,
            shortDescription: element.shortDescription,
            dateLastChange: element.dateLastChange,
            receivedDataConfLevel: element.receivedDataConfLevel,
            receivedDataIntegrityLevel: element.receivedDataIntegrityLevel,
            ciiCategory: element.ciiCategory
        };
        element.fullName && (result.fullname = element.fullName);
        return result;
    },
    parseSystem(element) {
        const system = this.parseDefaultSystemFields(element);
        system.entity = 'system';

        // eslint-disable-next-line no-console
        console.log('Detected system ', system.title);

        const deepID = this.makeDeepID(element.guid);
        const deepIDStruct = deepID.split('.');

        // Строим контекст уровня централизации
        const cLevel = `${deepIDStruct[0]}.${deepIDStruct[1]}`;
        const cLevelContext = this.context.contexts[cLevel] || (
            this.context.contexts[cLevel] = {
                title: deepIDStruct[1],
                uml: {
                    $notation: 'Sber',
                    $version: 'v1.0'
                },
                components: []
            }
        );
        cLevelContext.location = this.makeContextLocation(cLevel);
        cLevelContext.components.push(deepID);

        // Создаем компонент
        this.context.components[deepID] = system;
        this.context.contexts[deepID] = {
            title: system.title,
            components: []
        };

        this.context.contexts[deepID].location = this.makeContextLocation(deepID);

        // Строим контекст уровня Сбер
        if (!this.context.components[cLevel]) {
            this.context.components[cLevel] = {
                title: deepIDStruct[1],
                entity: 'system'
            };
            this.context.contexts.SBER.components.push(cLevel);
            this.context.namespaces[cLevel] = {
                title: deepIDStruct[1]
            }
        }

        this.context.namespaces[deepID] = {
            title: system.title
        }
    },
    parseSubSystem(element) {
        const subSystem = this.parseDefaultSystemFields(element);
        subSystem.entity = 'component';

        // eslint-disable-next-line no-console
        console.log('Detected subsystem ', subSystem.title);

        const deepID = this.makeDeepID(element.guid);

        this.context.components[deepID] = subSystem;
        this.context.contexts[deepID] = {
            title: subSystem.title,
            components: []
        };
        this.context.contexts[deepID].location = this.makeContextLocation(deepID);
        this.context.contexts[this.getContextIDByComponentID(deepID)].components.push(deepID);
        this.context.namespaces[deepID] = {
            title: subSystem.title
        }
    },
    parseModule(element) {
        const module = {
            title: element.name,
            entity: 'component'
        };

        // eslint-disable-next-line no-console
        console.log('Detected module ', module.title);

        const deepID = this.makeDeepID(element.guid);

        this.context.contexts[deepID] = {
            title: module.title,
            components: []
        };
        this.context.contexts[deepID].location = this.makeContextLocation(deepID);

        this.context.contexts[this.getContextIDByComponentID(deepID)].components.push(deepID);
        this.context.components[this.makeDeepID(element.guid)] = module;
        this.context.namespaces[deepID] = {
            title: module.title
        }
    },
    parseSubModule(element) {
        const submodule = {
            title: element.name,
            entity: 'component'
        };

        // eslint-disable-next-line no-console
        console.log('Detected submodule ', submodule.title);

        const deepID = this.makeDeepID(element.guid);
        this.context.contexts[this.getContextIDByComponentID(deepID)].components.push(deepID);
        this.context.components[this.makeDeepID(element.guid)] = submodule;
    },
    // Парсинг интеграций
    parseIntegrationInteraction(element) {
        const deepID =  this.makeDeepID(element.parentYamlId);
        const subject = this.context.components[deepID];
        subject.links = subject.links || [];
        const externDeepID = `SBER.SBERBANK.${this.guidToKey(element.externalSystem.yamlId)}`;
        this.context.components[externDeepID] || (
            this.context.components[externDeepID] = {
                title: element.externalSystem.name,
                entity: 'system'
            }
        );
        subject.links.push({
            id: externDeepID,
            title: element.name,
            direction: '<--d-->'
        });
    },
    // Парсинг выгрузки из Meta
    parse (data) {
        this.data = data;
        this.context = {
            components: {
                SBER : {
                    title: 'Сбер',
                    entity: 'system'
                }
            },
            contexts: {
                SBER: {
                    title: 'Сбер',
                    location: 'Сбер',
                    components: [],
                    uml: {
                        $notation: 'Sber',
                        $version: 'v1.0'
                    }
                }
            },
            namespaces: {
                SBER: {
                    title: 'Сбер',
                }
            }
        };
        data.digitalArchitecture && data.digitalArchitecture.map((element) => {
            switch (element.kind.toLowerCase()) {
                case 'system': this.parseSystem(element); break;
                case 'subsystem': this.parseSubSystem(element); break;
                case 'module': this.parseModule(element); break;
                case 'submodule': this.parseSubModule(element); break;
                case 'integrationinteraction': this.parseIntegrationInteraction(element); break;
                default:
                    // eslint-disable-next-line no-console
                    console.error(`Неопределенный тип компонента [${element.kind}]`)
            }
        });

        return this.context;
    }
}
