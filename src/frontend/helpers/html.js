// Обработка HTML
import query from '@front/manifest/query';
import env, {Plugins} from '@front/helpers/env';

export default {
	// Экранирование HTML
	escape(html) {
		return html.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	},

  async collectLocationElement({expression, context, id, entity}) {
    const result = await query.expression(expression)
      .evaluate(context) || [];

    if (env.isPlugin(Plugins.idea)) {
      return result.map((item) => ({
        title: item.title.slice(19),
        link: `${item.link}?entity=${entity}&id=${id}`
      }));
    }

    if (env.isPlugin(Plugins.vscode)) {
      return result.map((item) => ({
        title: item.title.replace('https://file+.vscode-resource.vscode-cdn.net', ''),
        link: `${item.link}?entity=${entity}&id=${id}`
      }));
    }

    return result;
  }
};
