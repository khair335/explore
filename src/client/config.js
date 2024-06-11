/**
 *  @file config.js
 *  @brief Brief
 */
import UrlParse from "url-parse";
import ConfigVMware from './config.vm.js';
import ConfigExplore from './config.explore.js';
import ConfigBroadcom from './config.broadcom.js';

class Config {
	constructor() {
		let config = null;

		this.microsite = null;
		if (gMicrosite) { // Hardcode for now.
			this.microsite = gMicrosite;

			if (gMicrosite === 'Explore') {
				config = new ConfigExplore();
			}
			else {		
				config = new ConfigVMware();
			}
		}
		else {
			config = new ConfigBroadcom ();
		}

		
		Object.assign(this, config);
		//this = { ...this, ...config };


	}

}

export default new Config();