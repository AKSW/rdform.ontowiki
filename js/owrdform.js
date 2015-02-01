function OntoWikiRDForm ( settings ){
	var self = this;

	this.defaultSettings = {
		data 		: null,
		template 	: "form.html", // looking for the template file in: extensions/rdform/public/
		hooks 		: "owrdform_hooks.js", // looking for the hooks file in: extensions/rdform/public/
		owHooks		: "hooks_"+urlBase.replace(/[^a-z0-9-_.]/gi,'')+".js",
		lang 		: null,
		$container 	: $(".active-tab-content"), // the container element for the form. In OntoWiki by default the content of the active tab
		$elem 		: null, // the form element
	};

	// merge default settings with given settings
	this.rdform = null;
	this.settings = $.extend({}, self.defaultSettings, settings || {});
}


OntoWikiRDForm.prototype = {

	// init a new form. Callback returns the submitted result of the form
	init: function( callback ) {
		var self = this;
		var now = new Date();
		rdformId = "rdform-" + now.getTime();

		if ( ! self.settings.$elem ) {
			self.settings.$elem = $('<form id="'+rdformId+'" class="rdform form-horizontal" onsubmit="return false;"></form>');	
		}

		self.settings.$container.append(self.settings.$elem);

		if ( self.settings.data ) {
			jsonld.fromRDF( self.settings.data,  {format: 'application/nquads'},
				function(err, data) {
					self.settings.data = data;
					self.run( function(res) { callback( res ) } );
				}
			);
		} else {
			self.run( function(res) { callback( res ) } );
		}
	},

	// run the rdform-plugin
    run: function( callback) {
    	var self = this;
    	
    	var rdform = self.settings.$elem.RDForm({
            template: urlBase + "extensions/rdform/public/"+self.settings.template,            
            hooks: urlBase + "extensions/rdform/public/"+self.settings.hooks,
            owHooks: urlBase + "extensions/rdform/public/"+self.settings.owHooks,
            lang: urlBase + "extensions/rdform/public/"+self.settings.lang,
            debug: true,
            data: self.settings.data,

            submit: function() {
            	var result = this[0];
            	if ( result.length < 1 || self.settings.data ) {
            		callback( result );
            	} else {
	            	var resourceIri = result["@id"];
	            	self.getNewResourceIri( resourceIri, 0, function(newResourceIri) {
	            		result["@id"] = newResourceIri;
	            		callback( result );
	            	});
	            }
            },

            abort : function() {
            	callback( false );
            }
        });        
        self.rdform = rdform.data();
    },

    // create new distinc resource id if its already existing
    getNewResourceIri: function( resourceIri, i, callback ) {
    	var self = this;
    	var owCon = new OntoWikiConnection(urlBase + 'jsonrpc');

    	if ( i == 0 ) {
    		var testResourceIri = resourceIri;
    	} else {
    		var testResourceIri = resourceIri + "-" + i;
    	}

    	owCon.getResource( modelIri, testResourceIri, function( resData ) {
    		if ( resData.dataHash == '40cd750bba9870f18aada2478b24840a' ) { // the has for an new resource
    			callback( testResourceIri );
    		} else {
    			i++;
    			self.getNewResourceIri( resourceIri, i, function( newResourceIri ) {
    				callback( newResourceIri );
    			});
    		}
		});
    },
}
