deploy: submodules

submodules: # read-only
	git submodule init
	git config submodule.js/lib/rdform.url "https://github.com/simeonackermann/RDForm.git"
	git submodule update

