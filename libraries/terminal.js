/** @param {NS} ns **/

const GUIDE=
"Terminal Library:\n" +
"Provides the terminal class object containing:\n" +
"    terminal.term: a direct handle for the native terminal class\n" +
"    terminal.print(string): Prints natively to the terminal without the added script name.\n" +
"    terminal.fancyPrint(React Element): Takes a react element to print fancy text\n" +
"    terminal.setColor(string/React Element, color): Returns a React Element wrapping the passed\n"+
"             string or React Element to apply the color given.\n" +
"    terminal.setBold(string/React Element): Like setColor, but sets bold.\n" +
"    terminal.cwd(): Returns the current terminal directory."

// Terminal class to print to terminal with added features and without scriptname
// prefix.

// Also pulls in utility functions from the terminal object.

export class terminal {
	// Constructor is mostly to perform the exploit to bypass memory cost of document
	constructor () {
		this.term = this.findProp("terminal");
	}

	// Functioned copied from @omuretsu in Discord to grab terminal object
	// this took a lot of work because apparently the electron version likes to shuffle this object around...
	findProp(propName) {
		for (let div of eval("document").querySelectorAll("div")) {
		let propKey = Object.keys(div)[1];
		if (!propKey) continue;
		let props = div[propKey];
		if (props.children?.props && props.children.props[propName]) return props.children.props[propName];
		if (props.children instanceof Array) for (let child of props.children) if (child?.props && child.props[propName]) return child.props[propName];
	}
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

export async function main(ns) {
	const term = new terminal();
	term.print(GUIDE)
}
