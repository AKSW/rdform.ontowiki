function OntoWikiRDForm ( settings ){
	var self = this;

	this.defaultSettings = {
		data 		: null,
		template 	: "form.html", // looking for the template file in: extensions/rdform/public/
		hooks 		: "owrdform_hooks.js", // looking for the hooks file in: extensions/rdform/public/
		owHooks		: "hooks_"+urlBase.replace(/[^a-z0-9-_.]/gi,'')+".js",
		lang 		: null,
		verbose		: true,
		$container 	: $(".active-tab-content"), // the container element for the form. In OntoWiki by default the content of the active tab
		$elem 		: null, // the form element,
		hash 		: '40cd750bba9870f18aada2478b24840a' // the default hash for a new and empty resource
	};

	// merge default settings with given settings
	this.rdform = null;
	this.result = null;
	this.settings = $.extend({}, self.defaultSettings, settings || {});

	if ( settings.hash == null ) {
		this.settings.hash = self.defaultSettings.hash;
	}
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
				if ( this.length < 1 ) { // no data
					return false;
				}
				self.result = this[0];
				if ( self.result.length < 1 || self.settings.data ) { // edited existing data
					callback( self.result );
				} else { // new data created
					var resourceIri = self.result["@id"];
					self.getNewResourceIri( resourceIri, 0, function(newResourceIri) {
						self.result["@id"] = newResourceIri;
						self.result["@hash"] = self.settings.hash;
						callback( self.result );
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
    getNewResourceIri: function( resourceIri, i, callback, dontAsk=false ) {
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
    			if ( dontAsk ) {
    				self.getNewResourceIri( resourceIri, i, function( newResourceIri ) {
    					callback( newResourceIri );
    				}, dontAsk );
    			} else {
					self.rdform._rdform_class.showAlert( "warning", "Es existiert bereits die Resource <a href='"+resourceIri+"' target='_blank'>"+resourceIri.split("/").reverse()[0]+"</a> mit der gleichen URI." +
						"<br /><br /><button type='button' class='btn btn-default rdform-submit-overwrite'>Überschreiben</button> (alle Daten in <a href='"+resourceIri+"' target='_blank'>"+resourceIri.split("/").reverse()[0]+"</a> werden durch die unten stehenden ersetzt)" +						
						"<br /><br /><button type='button' class='btn btn-default rdform-submit-adopt'>Übernehmen</button> (als neue Resource wird <a href='"+resourceIri+"' target='_blank'>"+resourceIri.split("/").reverse()[0]+"</a> verwendet)" +
						"<br /><br /><button type='button' class='btn btn-default rdform-submit-new'>Neue anlegen</button> (die unten stehenden Daten werden als neue Resource angelegt)"
					);
					$(".rdform-submit-overwrite", self.settings.$container).click(function() {
						self.settings.hash = resData.dataHash;
						callback( resourceIri );
					});
					$(".rdform-submit-adopt", self.settings.$container).click(function() {
						jsonld.fromRDF( resData.data,  {format: 'application/nquads'}, function(err, doc) {
								if (err) { console.log('There was an error', err); }
								self.settings.hash = resData.dataHash;
								self.result = doc[0];
								callback( resourceIri );
							}
						);
					});
					$(".rdform-submit-new", self.settings.$container).click(function() {
						self.getNewResourceIri( resourceIri, i, function( newResourceIri ) {
	    					callback( newResourceIri );
	    				}, true );
					});
				}
    		}
		});
    },
}
