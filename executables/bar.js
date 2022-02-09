/** @param {NS} ns **/
export async function main(ns) {
	var switches = ns.flags([
		['c', false],
		['x', false],
		['a', false],
		['h', false],
		['f', ''],
		['e', false],
		['l', false],
		['v', false]
	])

	// Shhh, this is an exploit to bypass ram requirements for the file picker, ignore this
	const win = eval("window");

	// Print help documentation on -h flag
	//   or when lacking necessary flags
	//   or when combining flags that shouldn't be combined
	if (switches.h 
			|| (!switches.c && !switches.a && !switches.x && !switches.l)
			|| switches.c && switches.a || switches.a && switches.x || switches.x && switches.c
			) {
		ns.tprint(
			"\nbar - Bitburner ARchive\n",
			"-----------------------\n",
			"bar.js -xca -f <file> -e -l -v <files>\n",
			"\n",
			"  -h prints this help document\n",
			"  -c create archive\n",
			"  -a append to archive\n",
			"  -x extract archive\n",
			"  -f <file> specify archive file (default is clipboard)\n",
			"  -e use file picker to access external file\n",
			"  -l list archive contents\n",
			"  -v verbose\n",
			"  <files> ns.ls patterns for files to add to archive"
		);
		ns.exit()
	}

	// Start with an empty data variable to modify later depending on flags
	let data = {};

	let filehandle = null;

	// Collect raw data when opening or appending archives
	// try catches provided to present clean errors on fail
	if (switches.f && (switches.x || switches.a || switches.l)) {
		// Open file in bitburner when passed a file with -f
		try {
			data = JSON.parse(ns.read(switches.f));
		} catch {
			ns.tprint(`Error reading file: ${switches.f}`);
			ns.exit();
		}
	} else if ((switches.x || switches.a || switches.l) && switches.e) {
		// Open file using file picker when -e is passed
		try {
			filehandle = await win.showOpenFilePicker();

			// to avoid problems with later writable behavior, remove handle from array.
			filehandle = filehandle[0];
			let file = await filehandle.getFile();

			if (switches.v) {
				ns.tprint(`Opening file ${file.name} from host system.`);
			}
			data = JSON.parse(await file.text());
		} catch {
			ns.tprint("Error opening/reading/parsing file");
			ns.exit();
		}
	} else if (switches.x || switches.a || switches.l) {
		// When nothing is passed, try to load from the clipboard
		try {
			data = JSON.parse(await navigator.clipboard.readText())
		} catch {
			ns.tprint("Error reading data from clipboard");
			ns.exit();
		}
	}

	// If -l is provided list all filenames in file
	if (switches.l) {
		ns.tprint("Listing archive contents: ");

		for (let i = 0; i < Object.keys(data).length; i++) {
			ns.tprint(` -${Object.keys(data)[i]}`);
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
			if (switches.v) {
				ns.tprint(`Adding ${files[i]} to archive.`)
			}
			data[files[i]] = ns.read(files[i]);
		}

		// stringify the data and output it to the relevant output
		if (switches.f) {
			// Output to bitburner file if specified via -f
			try {
				if (switches.v) {
					ns.tprint(`Archive written to ${switches.f}`)
				}
				await ns.write(switches.f,JSON.stringify(data),'w');
			} catch {
				// Can't really think of why it would fail other than wrong extension
				ns.tprint("Error writing output file (did you make sure to give a .txt extension?");
			}
		} else if (switches.e) {
			// Write file to system file from picker when -e is passed
			try {
				// Check if filehandle is already loaded, don't show picker if appending
				if (!filehandle) {
					filehandle = await win.showSaveFilePicker({suggestedName: "archive.bar"});
				}

				let file = await filehandle.createWritable();

				// Convert data to Blob to meet filestream requirements
				const blobData = new Blob([JSON.stringify(data)], {type: "text/plain"})

				await file.write(blobData);
				await file.close();
			} catch {
				ns.tprint("Error writing file");
			}
		} else {
			if (switches.v) {
				ns.tprint("Archive written to clipboard.")
			}
			navigator.clipboard.writeText(JSON.stringify(data));
		}
	} else if (switches.x) {
		// If e(x)tract is set, cycle through all keys in data and write them out
		for (let i = 0; i < Object.keys(data).length; i++) {
			let filename = Object.keys(data)[i];
			if (switches.v) {
				ns.tprint(`Extracting: ${filename}`);
			}
			await ns.write(filename, data[filename], 'w');
		}
	}
}
