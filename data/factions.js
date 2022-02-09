/** @param {NS} ns **/

/*
	WARNING: Potential Spoilers! Lists All Factions In Game!

	This is a data library to be imported into other scripts
	Contained in this library is:
	  -- earlyfactions: a list of early factions
	  -- cityfactions: a list of city factions
	  -- hackingfactions: a list of hacking group factions
	  -- megacorpfactions: a list of megacorp factions
	  -- crimefactions: a list of crime factions
	  -- endgamefactions: a list of endgame factions in the game
	  -- allfactions: a list of all factions in the game
*/

export const earlyfactions = [
	"CyberSec",
	"Netburners",
	"Tian Di Hui"
];

export const cityfactions = [
	"Sector-12",
	"Aevum",
	"Ishima",
	"New Tokyo",
	"Chongqing",
	"Volhaven"
];

export const hackingfactions = [
	"NiteSec",
	"The Black Hand",
	"BitRunners"
];

export const megacorpfactions = [
	"ECorp",
	"MegaCorp",
	"KuaiGong International",
	"Four Sigma",
	"Blade Industries",
	"OmniTek Incorporated",
	"Bachman & Associates",
	"Clarke Incorporated",
	"Fulcrum Secret Technologies",
	"NWO"
];

export const crimefactions = [
	"Slum Snakes",
	"Tetrads",
	"Silhouette",
	"Speakers for the Dead",
	"The Dark Army",
	"The Syndicate"
];

export const endgamefactions = [
	"The Covenant",
	"Daedalus",
	"Illuminati"
]

export const allfactions = [
	"CyberSec",
	"Netburners",
	"NiteSec",
	"The Black Hand",
	"Tian Di Hui",
	"BitRunners",
	"ECorp",
	"MegaCorp",
	"KuaiGong International",
	"Four Sigma",
	"Blade Industries",
	"OmniTek Incorporated",
	"Bachman & Associates",
	"Clarke Incorporated",
	"Fulcrum Secret Technologies",
	"Sector-12",
	"Aevum",
	"Ishima",
	"New Tokyo",
	"Chongqing",
	"Volhaven",
	"NWO",
	"Slum Snakes",
	"Tetrads",
	"Silhouette",
	"Speakers for the Dead",
	"The Dark Army",
	"The Syndicate",
	"The Covenant",
	"Daedalus",
	"Illuminati"
	];

export async function main(ns) {
	ns.tprint("This is a data library to be imported into other scripts.\n",
			  "Contained in this library is:\n",
			  "\n",
			  "  -- earlyfactions: a list of early factions\n",
			  "  -- cityfactions: a list of city factions\n",
			  "  -- hackingfactions: a list of hacking group factions\n",
			  "  -- megacorpfactions: a list of megacorp factions\n",
			  "  -- crimefactions: a list of crime factions\n",
			  "  -- endgamefactions: a list of endgame factions in the game\n",
			  "  -- allfactions: a list of all factions in the game"
	)
}
