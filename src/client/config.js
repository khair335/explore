/**
 *  @file config.js
 *  @brief Brief
 */
import UrlParse from "url-parse";
import ConfigVMware from './config.vm.js';
import ConfigBroadcom from './config.broadcom.js';

class Config {
	constructor() {
		let config = null;

		this.microsite = null;
		if (gMicrosite) { // Hardcode for now.
			this.microsite = gMicrosite;

			config = ConfigVMware;

		}
		else {
			config = ConfigBroadcom;
		}

		
		Object.assign(this, config);
		//this = { ...this, ...config };


	}

}

export default new Config();