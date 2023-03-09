import errConstants from '@front/constants/errConstants.json';

export function errorMiddleware(params) {

	let error = null;

	if (params?.error) {
		switch (params.error.response?.status) {
      case 509:
        error = errConstants.SIZE_LIMIT;
        break;
      case 400:
        error = params.error.response?.data;
        break;
      default:
        error = errConstants.UNKNOWN;
		}

		// eslint-disable-next-line no-console
		console.error(['errorMiddleware', params]);
	}

	return { ...params, error };
}
