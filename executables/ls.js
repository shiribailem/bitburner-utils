/** @param {NS} ns **/

// Terminal class to print to terminal with added features and without scriptname
// prefix.

// Also pulls in utility functions from the terminal object.

export class terminal {
	// Constructor is mostly to perform the exploit to bypass memory cost of document
	constructor () {
		this.doc = eval("document");
		this.elem = this.doc.querySelector("#terminal").parentElement.parentElement;
		this.term = this.elem[Object.keys(this.elem)[1]].children.props.terminal;
	}

	// Simple print function, does not provide any formatting features.
	// Essentially replicates ns.tprint without the scriptname used as a prefix
	print(text) {
		this.term.print(text);
	}

	// Fancy print function that takes React elements to output formatted text
	fancyPrint(text) {
		this.term.printRaw(text)
	}

	// Add DIV tag with color css easily
	setColor(text, color) {
		return React.createElement("div", {style: {color: `${color}`}}, text);
	}

	// Add bold easily
	setBold(text) {
		return React.createElement("u", null, text)
	}

	// Returns the current directory on the server
	cwd() {
		return this.term.cwd();
	}
}

// Simple list of the possible extensions used by scripts
const scriptExtensions = [
	"js",
	"ns",
	"script"
]

// Function used to print the spaced out block of entries rather than list
function printLine(items, color=null) {
	const term = new terminal();

	// Check that there are items left to print
	while (items.length > 0) {
		let line = '';
		// Add items to the lin until up until the max line length of 80
		while (items.length > 0 && (line.length + items[0].length + 1) < 80) {
			line = line + (items.shift() + ' ').padEnd(10);
		}
		if (line.trim().length > 0) {
			// Check if a color was set, and if so use the fancy print option
			// to set it
			if (color == null) {
				term.print(line)
			} else {
				let fancyLine = term.setColor(line, color);
				term.fancyPrint(fancyLine);
			}
		}
	}
}

// Function to print the list output, expecting a single character prefix
// for each file in the list.
function printWithPrefix (items, prefix, color=null) {
	const term = new terminal();

	while (items.length > 0) {
		let line = `${prefix}  ${items.shift()}`;

		if (color == null) {
			term.print(line)
		} else {
			let fancyLine = term.setColor(line, color);
			term.fancyPrint(fancyLine);
		}
	}
}

export async function main(ns) {
	const switches = ns.flags([
		["h", false],
		["a", false],
		["l", false]
	])

	// Grab the terminal, do this early because might as well have pretty
	// help output.
	const term = new terminal();

	if (switches.h) {
		term.print("Usage: ls -hal <files>");
		term.print("  -h show this output");
		term.print("  -a show All files, including system and hidden files ('.')");
		term.print("  -l show output in list mode");
		ns.exit()
	}

	// Grab the current working directory for relative listings	
	let cwd = term.cwd();
	let target = cwd;

	let fileList = [];

	// Check if a directory was passed
	if (switches._.length > 0) {
		target = switches._[0];

		if (target[0] != '/') {
			target = cwd + '/' + target;
		}
		if (target.slice(-1)[0] != '/') {
			target = target + '/'
		}
		fileList = ns.ls(ns.getHostname(), target);
	} else {
		fileList = ns.ls(ns.getHostname(), cwd);
	}

	// Create arrays to split files into types
	let directories = [];
	let textFiles = [];
	let scriptFiles = [];
	let special = [];
	let messages = [];
	let litFiles = [];

	// Time to work and split all the files up
	for (let i = 0; i < fileList.length; i++) {
		let item = fileList[i];

		// Check for false matches from ls
		if (target.length > 0) {
			let test = item.slice(0, target.length);
			if (test != target) {
				continue;
			}
			item = item.slice(target.length);
		}

		// Split filenames off of directory separators
		item = item.split('/',3);

		// if there was a leading /, just drop the first empty entry
		if (item[0] == '') {item.shift()}

		// If the list is longer than 1, then it's clearly a directory
		if (item.length > 1) {
			// Since directories come up multiple times, check for
			// duplicates
			if (!directories.includes(item[0])) {
				// Skip entries with leading '.' unless -a is set
				if (item[0][0] != '.') {
					directories.push(item[0]);
				} else if (switches.a) {
					directories.push(item[0]);
				}
			}
			continue;
		}

		// Now that we know it's not a directory, get the file extension
		// Using split with 100 splits just because we need to get the last
		// and there could be multiple.
		let itemext = fileList[i].split('.', 100).pop();

		// Check for script files, and add with same logic as directories
		if (scriptExtensions.includes(itemext)) {
			// Check for blank because I've been getting these?
			if (item[0] != '') {
				if (item[0][0] != '.') {
					scriptFiles.push(item[0]);
				} else if (switches.a) {
					scriptFiles.push(item[0]);
				}
			}
		} else {
			if (item[0] != '') {
				// Because there's a bunch of different items, using hide
				// to avoid repeating the check code over and over again
				// TODO? Put the hide check early in the loop
				let hide = false;
				if (item[0][0] == '.' && !switches.a) {
					hide = true
				}
				if (!hide) {
					// Split files off of type, if type is unknown then
					// put it in general special field (exe/cct)
					if (itemext == "txt") {
						textFiles.push(item[0]);
					} else if (itemext == "lit") {
						litFiles.push(item[0]);
					} else if (itemext == "msg") {
						messages.push(item[0]);
					} else {
						special.push(item[0]);
					}
				}
			}
		}
	}

	// Check for list flag
	if (!switches.l) {
		// Directories get pretty colors to match vanilla ls
		printLine(directories, 'cyan');
		// Show hidden file types if set
		if (switches.a) {
			printLine(special);
			printLine(litFiles);
			printLine(messages);
		}
		printLine(textFiles);
		printLine(scriptFiles);
	} else if (switches.l) {
		// Directories get pretty colors to match vanilla ls
		printWithPrefix(directories, 'd', 'cyan');
		// Show hidden file types if set
		if (switches.a) { 
			printWithPrefix(special, 's');
			printWithPrefix(litFiles, 'l');
			printWithPrefix(messages, 'm');
		}
		printWithPrefix(textFiles, 't');
		printWithPrefix(scriptFiles, 'x');
	}
	
}
