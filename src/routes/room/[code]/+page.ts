import type { PageLoad } from './$types';

export const load: PageLoad = ({ params, url }) => {
	return {
		code: params.code.toUpperCase(),
		username: url.searchParams.get('username') || ''
	};
};
