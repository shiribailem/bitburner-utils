import json
import argparse
import tkinter
import os
import string

### Load tkinter window for relevant functions
tk = tkinter.Tk()
# Hide window immediately because we don't need a main window
tk.withdraw()

# Because there's a bug in tkinter that clears the clipboard on close...
# Create a button to show when outputting to the clipboard so that it can be
# closed by the user when ready.
tkclosebutton = tkinter.Button(tk, text="tkinter bug requires this window "\
                + "while pasting, click to close", command = tk.destroy)
tkclosebutton.pack()

# Reference list of valid file extensions
extensions = [".js", ".ns", ".script", ".txt"]

# Whitelist of valid characters for a Bitburner file
charwhitelist = string.ascii_letters + string.digits + ' .-_'

# Check string against character whitelist
def checkfilestring (item):
    valid = True
    for char in item:
        if not char in charwhitelist:
            valid = False
            break
    return (valid, char)

# Function that when passed a path will return:
# (is valid file, is directory, contents if relevant)
# Validity is if a file is a valid bitburner filetype
def parsefile (path):
    # If it doesn't exist it can't be archived
    if os.path.exists(path):
        # If it's a directory, I need to know to walk it but can't read it
        if os.path.isdir(path):
            strtest = checkfilestring(os.path.split(path)[1])
            if strtest[0]:
                return (False, True, '')
            else:
                print(strtest[1] + " is not a valid character in Bitburner filenames.")
        else:
            # Check if it's a valid filetype.
            # If it passes this stage, read it and return it
            if path[-3:] == ".js" or path[-4:] in extensions:
                strtest = checkfilestring(os.path.split(path)[1])
                if strtest[0]:
                    with open(path, 'r') as f:
                        filedata = f.read()
                    return (True, False, filedata)
                else:
                    print(strtest[1] + " is not a valid character in Bitburner filenames.")
            else:
                print(path + " is not a valid Bitburner file. Skipping")

    # If it gets to here the file is invalid regardless and should be skipped
    return (False, False, '')

parser = argparse.ArgumentParser(
                    description="Manage Bitrunner Archive Files (.bar)")
parser.add_argument('files', metavar='file/directory', type=str, nargs='*',
                    help="Input files and/or output directory",
                    default=[])
actionargs = parser.add_mutually_exclusive_group()
actionargs.add_argument('-c', '--create', action='store_true',
                    help="Create archive from given files (default destination:\
                    clipboard")
actionargs.add_argument('-x', '--extract', action='store_true',
                    help="Extract files (default to either current directory or\
                    given directory)")
actionargs.add_argument('-a', '--append', action='store_true',
                    help="Append given files to archive")
parser.add_argument('-f', '--file', type=str,
                    help="Use this file as the archive")
parser.add_argument('-l', '--list', action='store_true',
                    help="List file contents")
# TODO: Add file picker after everything else is working first
# parser.add_argument('-e', '--browse', action='store_true',
#                    help="Use file picker to select archive and/or output directory.")

args = parser.parse_args()

# Preload path variable because it might get populated early
path = None

### Check if data needs to be parsed FROM and archive
if args.extract or args.append or args.list:
    # Determine source and load the data
    try:
        # If set with -f, load given file
        if args.file:
            print("Loading from archive file: " + args.file + "\n")
            # In case using extract later, get the archive name in path
            # remove the file extension if used
            if args.file[-4:].lower() == '.bar':
                path = args.file[:-4]
            else:
                path = args.file
            with open(args.file, 'r') as f:
                data = json.loads(f.read())
        # Check if the first file passed is a .bar file
        elif len(args.files) > 0 and \
                    args.files[0][-4:].lower() == '.bar' and \
                    os.path.isfile(args.files[0]):
            print("Loading from archive file: " + args.files[0] + "\n")
            # In case using extract later, get the archive name in path
            path = args.files[0][:-4]
            with open(args.files[0], 'r') as f:
                data = json.loads(f.read())
        # Default to loading archive data from the clipboard
        else:
            print("Loading archive from clipboard\n")
            data = json.loads(tk.clipboard_get())
    # Error and exit if the JSON is invalid
    # Combined with above will tell user if they used an invalid source
    except json.decoder.JSONDecodeError:
        print("Error decoding archive")
        exit()
        
# If -l is set list out files in archive
if args.list:
    files = data.keys()
    for file in files:
        print(file)

### Check if Extracting Data
if args.extract:
    # Check if last item passed is a directory (to allow for passing a file and
    # a directory
    if len(args.files) > 0 and os.path.isdir(os.path.normcase(args.files[-1])):
        path = os.path.normcase(args.files[-1])
    # Check if path is preloaded from an earlier passed archive
    elif not path is None:
        count = 0
        while os.path.exists(path) and not os.path.isdir(path):
            path = path + "_" + str(count)
            count += 1
        
        if not os.path.exists(path):
            os.mkdir(path)
    # If no path given, default to creating a folder
    else:
        path = os.path.normcase('archive')
        if not os.path.exists(path):
            os.mkdir(path)

    # Get a list of all the filenames to work with
    files = data.keys()
    
    # Work through the files one by one
    for key in files:
        # Break up the filepath, extract the filenames
        # Since bitburner doesn't allow empty folders, the last entry should
        # always be a file
        filepath = key.split('/')
        file = filepath.pop(-1)
        
        # Start a variable to hold the composite path as it works
        comp_path = path
        
        # Walk down the directory path and make sure everything exists
        for subpath in filepath:
            comp_path = os.path.join(comp_path,subpath)
            if not os.path.exists(comp_path):
                os.mkdir(comp_path)
        
        # Reassemble the whole path in an os friendly format
        filepath = os.path.join(comp_path, file)
        
        # Write the file data out
        with open(filepath, 'w') as f:
            f.write(data[key])
            
### Check if Creating or Appending archive
if args.create or args.append:
    # Until I add a filepicker, the only input method is files
    inputlist = args.files
    
    # Preload the empty data variable if we're not appending.
    # If we're appending this variable will already exist
    if not args.append:
        data = {}
    
    # Side Note: Since file types matter to this and it will only accept .bar
    # on the output without -f (defaulting otherwise to clipboard), there's no
    # need to worry about overlap
    
    # Step through items in the input list
    for inputitem in inputlist:
    
        # First check for existing files (this is crucial because the first
        # item may be the destination archive file that doesn't exist yet.
        if os.path.exists(inputitem):
            # Check if the item is valid and/or a directory.
            # Skip all items that aren't valid format
            test = parsefile(inputitem)
            
            # Returns true if it's a file and valid format
            if test[0]:
                # Sanitize slashes to correct format
                inputitem = inputitem.replace('\\','/')
                # Make sure there's a leading slash on all items not in root
                if "/" in inputitem and not inputitem[0] == "/":
                    inputitem = "/" + inputitem
                # Load data into archive
                data[inputitem] = test[2]
            # Returns true if its a directory (and valid format)
            elif test[1]:
            
                # Walk through the contents of the directory
                walker = os.walk(inputitem)
                for walkitem in walker:
                    # We only care about directories with files in them
                    if len(walkitem[2]) > 0:
                        # Cycle through files
                        for filename in walkitem[2]:
                            # Check if file is valid for Bitburner
                            filename = os.path.join(walkitem[0], filename)
                            filetest = parsefile(filename)
                            
                            # If valid, do as above: sanitize and load
                            if filetest[0]:
                                inputitem = filename.replace('\\','/')
                                if "/" in inputitem and not inputitem[0] == "/":
                                    inputitem = "/" + inputitem
                                data[inputitem] = filetest[2]
                        
    # If -f is set, use it as the output archive file
    if not args.file is None:
        with open(args.file, 'w') as f:
            f.write(json.dumps(data))
    # Otherwise if first item is .bar, use it as archive file
    elif args.files[0][-4:].lower() == '.bar':
        with open(args.files[0], 'w') as f:
            f.write(json.dumps(data))
    # Fallback to outputting archive to the clipboard
    else:                
        tk.clipboard_clear()
        tk.clipboard_append(json.dumps(data))
        # Because of bug, we have to show a dialogue and wait for user
        tk.deiconify()
        tk.mainloop()
