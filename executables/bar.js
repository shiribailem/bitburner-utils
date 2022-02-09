/** @param {NS} ns **/
export async function main(ns) {
	var switches = ns.flags([
		['c', false],
		['x', false],
		['a', false],
		['h', false],
		['f', '']
	])

	// Print help documentation on -h flag
	//   or when lacking necessary flags
	//   or when combining flags that shouldn't be combined
	if (switches.h 
			|| (!switches.c && !switches.a && !switches.x)
			|| switches.c && switches.a || switches.a && switches.x || switches.x && switches.c
			) {
		ns.tprint(
			"\nbar - Bitburner ARchive\n",
			"-----------------------\n",
			"bar.js -xca -f <file> <files>\n",
			"\n",
			"  -h prints this help document\n",
			"  -c create archive\n",
			"  -a append to archive\n",
			"  -x extract archive\n",
			"  -f <file> specify archive file (default is clipboard)\n",
			"  <files> ns.ls patterns for files to add to archive"
		);
		ns.exit()
	}

	// Start with an empty data variable to modify later depending on flags
	let data = {};
	let rawdata = '';

	// Collect raw data either from clipboard or from file when opening or appending archives
	// try catches provided to present clean errors on fail
	if (switches.f && (switches.x || switches.a)) {
		try {
			data = JSON.parse(ns.read(switches.f));
		} catch {
			ns.tprint(`Error reading file: ${switches.f}`);
			ns.exit();
		}
	} else if (switches.x || switches.a) {
		try {
			data = JSON.parse(await navigator.clipboard.readText())
		} catch {
			ns.tprint("Error reading data from clipboard");
			ns.exit();
		}
	}

	// On a (c)reate or (a)ppend read the file patterns passed and load them into the data variable
	// Because this is additive, the preload from the earlier section means the data will be
	//   combined.
	if (switches.c || switches.a) {
		let files = [];

		// Run all the trailing patterns through ls to get the full list of files to add to the
		//   archive.
		for (let i = 0; i < switches._.length; i++) {
			let regex = switches._[i];
			files = files.concat(ns.ls(ns.getHostname(), regex));
		}

		// Read all the files into the data structure.
		for (let i = 0; i < files.length; i++) {
			ns.tprint(`Adding ${files[i]} to archive.`)
			data[files[i]] = ns.read(files[i]);
		}

		// stringify the data and output it either to the archive file or clipboard
		if (switches.f) {
			try {
				ns.tprint(`Archive written to ${switches.f}`)
				await ns.write(switches.f,JSON.stringify(data),'w');
			} catch {
				// Can't really think of why it would fail other than wrong extension
				ns.tprint("Error writing output file (did you make sure to give a .txt extension?");
			}
		} else {
			ns.tprint("Archive written to clipboard.")
			navigator.clipboard.writeText(JSON.stringify(data));
		}
	} else if (switches.x) {
		// If e(x)tract is set, cycle through all keys in data and write them out
		for (let i = 0; i < Object.keys(data).length; i++) {
			let filename = Object.keys(data)[i];
			ns.tprint(`Extracting: ${filename}`);
			await ns.write(filename, data[filename], 'w');
		}
	}
}
