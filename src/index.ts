import 'dotenv/config';
if (!process.env.DEBUG) console.debug = () => undefined;
import './clients/akairoClient';
