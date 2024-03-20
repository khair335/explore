/**
 *  @file settings.js
 *  @brief Settings used between front and backend
 */
export default { 
	title_case:  {
		// DEPRECATED: Let content handle case in the browser title. Just strip out html when we can.
		//except: ['a', 'an', 'and', 'but','for', 'if','of', 'OEM','or', 'nor', 'not','SEC','so', 'the', 'yet' ],
		//ignore: ['ACF2', 'CA IDMS', 'CA 2E', 'HCL', 'IBM', 'BCM', 'NLA', 'HCP', 'ACP', 'HDS', 'ACM', 'PEX', 'HSM', 'AFE', 'AFB', 'HFB', 'ASM', 'HLM', 'ABS', 'OLFA', 'VIP', 'TCS', 'HCP', 'KAKUDAI', 'SGN', 'EY', 'GDPR', 'AIG', 'FAQ', 'OEM', 'MACH5', 'FILIADATA', 'COTA']
		// DEPRECATED: 
		//skip: ['5G-HD','CA','FC-NVMe','HBAs','ICs','I/O','LED','MegaRAID','NVMe','OEM','PCI','PCIe','RAID','SAN','SAS','SATA','SEC','SOCs','BES-Switch', 'SaaS', 'iDash', 'AIOps'],
	}
}
