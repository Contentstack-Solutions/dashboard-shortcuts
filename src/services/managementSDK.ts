import * as contentstack from '@contentstack/management';

const contentstackClient = contentstack.client();

const stack = contentstackClient.stack({ 
	api_key: import.meta.env.VITE_CONTENTSTACK_API_KEY, 
	management_token: import.meta.env.VITE_CONTENTSTACK_MANAGEMENT_TOKEN 
});

export default stack;

