<template>
  <plantuml class="plantuml-schema"
      :uml = "uml"
      :postrender = "postrender"
  ></plantuml>
</template>

<script>

import PlantUML from "./PlantUML";
import DSL from "!!raw-loader!../../assets/dsl.txt";

export default {
  name: 'Schema',
  components: {
    "plantuml" : PlantUML
  },
  methods: {
    createSVGElement(tag) {
      return document.createElementNS("http://www.w3.org/2000/svg", tag);
    },
    getControlsByTarget(target) {
      const linkID = target.getAttribute('data-link-selector');
      return document.querySelectorAll(`[data-link-selector="${linkID}"]`);
    },
    onOverLink(event) {
      const controls = this.getControlsByTarget(event.target);
      for (let i = 0; i < controls.length; i++)
        controls[i].classList.add("selected");
    },

    onOutLink(event) {
      const controls = this.getControlsByTarget(event.target);
      for (let i = 0; i < controls.length; i++)
        controls[i].classList.remove("selected");
    },

    postrender (svg) {
      // Строим надписи на связях
      let prefix = 0;
      let defs = svg.querySelectorAll('defs')[0];
      if (!defs) {
        defs = this.createSVGElement('defs');
        svg.insertAfter(0, defs);
      }
      for (const linkId in this.structure.links) {
        const link = this.structure.links[linkId];
        const selector = (() => {
          const isBack = link.direction.slice(0, 1) === '<';
          const isTo = link.direction.slice(-1) === '>';
          if (isBack && isTo) return `path[id^='${link.linkFrom}-${link.linkTo}']`;
          else if (isBack) return `path[id^='${link.linkFrom}-backto-${link.linkTo}']`;
          else return `path[id^='${link.linkFrom}-to-${link.linkTo}']`;
        })();
        //const selector = `path[id^='${link.linkFrom}'][id$='${link.linkTo}']`
        const linkPath = svg.querySelectorAll(selector)[0];
        if (linkPath) {
          linkPath.classList.add("link-path");
          linkPath.style = null;
          const defPathID = `def_${prefix++}_${linkPath.id}`;
          const path = this.createSVGElement('svg:path');
          path.setAttribute('id',defPathID);
          path.setAttribute('d',linkPath.getAttribute('d'));
          defs.appendChild(path);

          const title = this.createSVGElement('svg:text');
          title.classList.add('schema-link-title');
          title.setAttribute('text-anchor', 'middle');
          title.setAttribute('dy', -4);

          const titlePath = this.createSVGElement('svg:textPath');
          titlePath.setAttribute("href", `#${defPathID}`);
          titlePath.setAttribute("startOffset", '50%');
          titlePath.textContent = link.link_title;

          title.setAttribute('data-link-selector', prefix);
          titlePath.setAttribute('data-link-selector', prefix);
          titlePath.addEventListener('mouseover', this.onOverLink);
          titlePath.addEventListener('mouseout', this.onOutLink);

          linkPath.setAttribute('data-link-selector', prefix);
          linkPath.addEventListener('mouseover', this.onOverLink);
          linkPath.addEventListener('mouseout', this.onOutLink);

          title.appendChild(titlePath);
          svg.appendChild(title);
        }
      }
    },
    makeRef(type, id, title) {
      const url = (() => {
        switch (type) {
          case 'context':
            return (new URL(`architect/contexts/${id}`, location.origin)).toString();
          case 'component':
            return (new URL(`architect/components/${id}`, location.origin)).toString();
          case 'aspect':
            return (new URL(`architect/aspects/${id}`, location.origin)).toString();
          case 'contract':
            return (new URL(`docs/${id}`, location.origin)).toString();
        }
      })();
      return `[[${url} ${title || id}]]`;
    }
  },
  computed: {
    extraLinks() {
      return !('extra' in this.schema) || (this.schema.extra !== false);
    },

    structure() {
      // Структура схемы
      const structure = {
        namespaces: {},
        links: {}
      };

      // Размещает компонент в структуре схемы
      const expandComponent = (component, extra) => {
        let namespaces = structure.namespaces;
        component.namespaces && component.namespaces.map((namespace) => {
          !namespaces.namespaces && (namespaces.namespaces = {});
          !namespaces.namespaces[namespace.id] && (namespaces.namespaces[namespace.id] = Object.assign({}, namespace));
          namespaces = namespaces.namespaces[namespace.id];
        });
        !namespaces.components && (namespaces.components = {});
        if (!extra || !namespaces.components[component.id]) {
          namespaces.components[component.id] = Object.assign({extra}, component);
        }
      }

      (this.schema.components || []).map((component) => {
        // Разбираем компонент
        expandComponent(component, false);
        // Разбираем зависимости компонента
        (component.links || []).map((link) => {
          expandComponent(link, true);
          structure.links[`[${component.id}] ${link.direction} [${link.id}]`] =
              Object.assign(link, { linkFrom: component.id, linkTo: link.id});
        });
      });

      return structure;
    },
    uml () {
      let uml = `@startuml\n${DSL}\n`;
      this.orientation === 'horizontal' && (uml += 'left to right direction\n');
      if(this.schema) {
        if (this.schema.uml) {
          if (typeof this.schema.uml === 'string') {
            return this.schema.uml;
          } else if (this.schema.uml.$before) {
            uml += this.schema.uml.$before + '\n';
          }
        }
        uml += `title  "${this.makeRef('context', this.schema.id, this.schema.title)}"\n`;
        // Готовим структуру схемы для рендеринга
        const structure = this.structure;
        // Разбираем архитектурные пространства
        const expandNamespace = (namespace) =>  {
          // Если область определена, выводим ее
          if (namespace.id) {
            uml += `rectangle "${namespace.title}" {\n`;
          }
          // Если есть вложенные пространства, отображаем их тоже
          if (namespace.namespaces) {
            for (const namespaceID in namespace.namespaces) {
              expandNamespace(namespace.namespaces[namespaceID]);
            }
          }
          // Формируем компоненты
          for (const componentID in namespace.components) {
            const component = namespace.components[componentID];
            if (!this.extraLinks && component.extra)
              continue;
            const title = this.makeRef('component', component.id, component.title);
            if (component.aspects && component.aspects.length) {
              uml += `${component.entity} ${component.id}`;
              const aspectList = [];
              component.aspects.map((aspect) => {
                let aspectTitle = this.makeRef('aspect', aspect.id, aspect.title);
                aspectList.push(aspectTitle);
              });
              aspectList.length && (uml += `[\n<b>${title}</b>\n====\n* ${aspectList.join('\n----\n* ')}\n]`);
            } else {
              uml += `${component.entity} "${title}" as ${component.id}`;
            }
            uml += `\n`
          }
          if (namespace.id) {
            uml += `}\n`
          }
        };
        expandNamespace(structure.namespaces);

        // Строим связи
        for (const linkId in structure.links) {
          const link = structure.links[linkId];
          if (this.extraLinks || (
              structure.namespaces[link.namespace.id]
              && structure.namespaces[link.namespace.id].components[link.id]
              && !structure.namespaces[link.namespace.id].components[link.id].extra
          )) uml += `${linkId}: "                               "\n`
        }
        this.schema.uml && this.schema.uml.$after && (uml += this.schema.uml.$after + '\n');
      }
      uml += '@enduml';
      // eslint-disable-next-line no-console
      console.info(uml);
      return uml;
    }
  },
  props: {
    schema: Object,
    orientation: { // Ориентация построения схемы
      type: String,
      default: 'horizontal', // По умолчанию - сверху в низ
      validator: value => [
          'vertical',
          'horizontal'
      ].indexOf(value) >= 0
    }
  },
  data() {
    return {
      rawUML: null
    };
  }
};
</script>

<style>

  .schema-link-title {
    font-size: 12px;
    margin-bottom: 6px;
  }

  text.selected {
    font-size: 16px;
    cursor: pointer;
  }

  path.link-path {
    stroke: rgb(52, 149, 219);
    stroke-width: 1;
  }

  path.selected {
    stroke: #F00;
    stroke-width: 2;
  }

</style>
