OUTPUT_DIR = out

# Set up the common Closure compiler command line parameters.
JAVA = java
JAVA_FLAGS = -jar
TOOLS_DIR = tools

# Set up the common Closure compiler command line parameters.
COMPILER = $(TOOLS_DIR)/compiler.jar
COMPILER_COMMAND = $(JAVA) $(JAVA_FLAGS) $(COMPILER)
COMPILER_OUTPUT = $(OUTPUT_DIR)/temp-compiled.js

# Set up the linter command line parameters to use Rhino and jshint.
RHINO = $(TOOLS_DIR)/rhino.jar
JSHINT = $(TOOLS_DIR)/jshint-rhino.js
LINTER_OPTIONS = strict=true,jquery=true,undef=true,smarttabs=true,forin=true,noarg=true,noempty=true,eqeqeq=true,bitwise=true,curly=true,browser=true,es5=true,indent=4,maxerr=50
LINTER_COMMAND = $(JAVA) $(JAVA_FLAGS) $(RHINO) $(JSHINT)

LIBS = lib/Math.uuid.js \
		lib/underscore-min.js \
		lib/underscore.string.min.js \
        lib/backbone-min.js \
        lib/jquery-1.9.1.min.js \
        lib/parse-1.2.8.min.js \
        hit/hit.js \
        lib/angular.min.js \
        lib/bootstrap.min.js \
        lib/bootstrap-datepicker.js \
        lib/angular-strap.min.js \
        hit.js


ANON_FILES = hit/user.js hit/venue.js
DEV_OUTPUT_FILE = $(OUTPUT_DIR)/fullmoon.min.js

# Concatenate the minified jQuery, Underscore and HIT libraries
CAT_FILES = $(LIBS) $(ANON_FILES)

# Make Targets
all:	js

js:
	@echo '[DEV] Compiling fullmoon.min.js ...' && \
	cat $(CAT_FILES) > $(DEV_OUTPUT_FILE)

